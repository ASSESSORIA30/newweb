"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { leadAdapter } from "../lead/adapter";
import { getAttribution, track } from "../lead/tracking";
import type { LeadContact, LeadKind } from "../lead/types";

export type Rule = "required" | "phone" | "email" | "phoneOrEmail" | "optionalEmail";

const PHONE = /^(\+34\s?)?[6789]\d{2}\s?\d{3}\s?\d{3}$|^(\+34\s?)?[6789]\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const squash = (s: string) => s.replace(/[\s.-]+/g, " ").trim();

function check(rule: Rule, v: string, t: Dictionary): string | null {
  const s = v.trim();
  if (rule === "required") return s ? null : t.errors.name;
  if (rule === "phone") return PHONE.test(squash(s)) ? null : t.errors.phone;
  if (rule === "email") return EMAIL.test(s) ? null : t.errors.email;
  if (rule === "optionalEmail") return !s || EMAIL.test(s) ? null : t.errors.email;
  if (rule === "phoneOrEmail") return PHONE.test(squash(s)) || EMAIL.test(s) ? null : t.errors.contact;
  return null;
}

/** One "phone or email" box: decide which it is, so the CRM gets `phone` or `email`. */
export function splitContact(v: string): { phone?: string; email?: string } {
  const s = v.trim();
  if (EMAIL.test(s)) return { email: s.toLowerCase() };
  if (PHONE.test(squash(s))) return { phone: squash(s).replace(/\s/g, "") };
  return {};
}

// Duplicate guard shared by all forms on the page: the same enquiry is not sent twice within 10 minutes.
const recent = new Map<string, number>();
const DUP_WINDOW = 10 * 60 * 1000;
const MIN_FILL_MS = 1200;

type SendError = "network" | "server" | "rejected" | "tooFast";

/**
 * Shared lead form logic: inline validation, focus on the first error, mandatory privacy consent and
 * separate optional marketing consent, honeypot + minimum fill time against bots, one submission at a
 * time, duplicate guard, real delivery through the single Formspree connector. On failure the form keeps
 * every value and offers a retry; on success Formspree has confirmed reception.
 */
export function useLeadForm(opts: {
  kind: LeadKind | ((data: FormData) => LeadKind);
  locale: Locale;
  t: Dictionary;
  rules: Record<string, Rule>;
  /** Maps the form to the CRM contact fields and to labelled extra answers. */
  map: (data: FormData) => { contact: LeadContact; details?: [string, string][]; clientType?: "particular" | "empresa" };
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [sendError, setSendError] = useState<SendError | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy.current) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const next: Record<string, string> = {};
    for (const [name, rule] of Object.entries(opts.rules)) {
      const msg = check(rule, String(data.get(name) ?? ""), opts.t);
      if (msg) next[name] = msg;
    }
    if (!data.get("privacy")) next.privacy = opts.t.consent.errPrivacy;
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      track("form_error", { field: first });
      return;
    }
    const honeypot = String(data.get("_gotcha") ?? "");
    if (!honeypot && mountedAt.current && Date.now() - mountedAt.current < MIN_FILL_MS) {
      setSendError("tooFast");
      setStatus("error");
      return;
    }

    const kind = typeof opts.kind === "function" ? opts.kind(data) : opts.kind;
    const mapped = opts.map(data);
    const at = new Date().toISOString();
    const fingerprint = JSON.stringify([kind, mapped.contact]);
    const seen = recent.get(fingerprint);
    if (seen && Date.now() - seen < DUP_WINDOW) {
      setStatus("done");
      form.reset();
      return;
    }

    busy.current = true;
    setStatus("sending");
    setSendError(null);
    const res = await leadAdapter.submit(
      {
        kind,
        locale: opts.locale,
        contact: mapped.contact,
        details: mapped.details ?? [],
        clientType: mapped.clientType,
        consent: { privacy: true, marketing: data.get("marketing") === "on", at, text: `${opts.t.consent.privacy} ${opts.t.consent.privacyLink}` },
        attribution: getAttribution(),
        page: window.location.pathname,
      },
      honeypot,
    );
    busy.current = false;
    if (res.ok) {
      recent.set(fingerprint, Date.now());
      form.reset();
      setStatus("done");
    } else {
      setSendError(typeof navigator !== "undefined" && navigator.onLine === false ? "network" : res.reason);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setSendError(null);
  };

  return { formRef, onSubmit, errors, status, sendError, reset };
}

/** Hidden field for bots only (Formspree's `_gotcha`). Out of the tab order and of the accessibility tree. */
export function Honeypot() {
  return (
    <div className="s-hp" aria-hidden="true">
      <label>
        Website
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** Submit button with progress state, plus the send error with a retry (the values stay in the form). */
export function SubmitRow({ t, label, status, sendError, className }: { t: Dictionary; label: string; status: string; sendError: SendError | null; className: string }) {
  const sending = status === "sending";
  return (
    <>
      {status === "error" && sendError ? (
        <div className="s-senderr" role="alert">
          <p>{sendError === "tooFast" ? t.send.tooFast : sendError === "network" ? t.send.offline : t.send.error}</p>
        </div>
      ) : null}
      <button type="submit" className={className} disabled={sending} aria-busy={sending || undefined} data-sending={sending || undefined}>
        {sending ? (
          <>
            <span className="s-spin" aria-hidden="true" />
            {t.common.sending}
          </>
        ) : status === "error" && sendError && sendError !== "tooFast" ? (
          t.send.retry
        ) : (
          label
        )}
      </button>
    </>
  );
}

export function Field({
  label,
  name,
  type = "text",
  error,
  autoComplete,
  inputMode,
  placeholder,
  optional,
  t,
  as,
  options,
  hint,
  value,
  onValue,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  optional?: boolean;
  t: Dictionary;
  as?: "textarea" | "select";
  options?: string[];
  hint?: string;
  /** Controlled select (value + onValue); otherwise uncontrolled. */
  value?: string;
  onValue?: (v: string) => void;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: "s-input",
  } as const;
  return (
    <div className="s-field" data-invalid={error ? "" : undefined}>
      <label htmlFor={id}>
        {label}
        {optional ? <span className="s-field__opt"> ({t.common.optional})</span> : null}
      </label>
      {as === "textarea" ? (
        <textarea {...common} rows={3} placeholder={placeholder} autoComplete="off" />
      ) : as === "select" ? (
        <select {...common} {...(onValue ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onValue(e.target.value) } : { defaultValue: "" })}>
          <option value="" disabled>
            —
          </option>
          {options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          spellCheck={type === "email" ? false : undefined}
        />
      )}
      {hint ? (
        <span id={hintId} className="s-field__hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errId} className="s-field__err" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function Consent({ t, error, privacyHref, legalHref }: { t: Dictionary; error?: string; privacyHref: string; legalHref?: string }) {
  const id = useId();
  return (
    <div className="s-consent">
      <label className="s-check" data-invalid={error ? "" : undefined}>
        <input type="checkbox" name="privacy" aria-describedby={error ? `${id}-err` : undefined} aria-invalid={error ? true : undefined} />
        <span>
          {t.consent.privacy}{" "}
          <a href={privacyHref} target="_blank" rel="noopener">
            {t.consent.privacyLink}
          </a>
          .
        </span>
      </label>
      {error ? (
        <span id={`${id}-err`} className="s-field__err" role="alert">
          {error}
        </span>
      ) : null}
      <label className="s-check">
        <input type="checkbox" name="marketing" defaultChecked={false} />
        <span>{t.consent.marketing}</span>
      </label>
      <p className="s-consent__info">
        {t.consent.info}{" "}
        {legalHref ? (
          <a href={legalHref} target="_blank" rel="noopener">
            {t.footer.legalLinks[0].label}
          </a>
        ) : null}
      </p>
    </div>
  );
}

export function FormDone({ text, t, onAgain }: { text: string; t: Dictionary; onAgain: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="s-done" role="status" tabIndex={-1} ref={ref}>
      <span className="s-done__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="s-done__title">{t.send.done}</p>
      <p>{text}</p>
      <button type="button" className="s-textbtn" onClick={onAgain}>
        {t.send.again}
      </button>
    </div>
  );
}
