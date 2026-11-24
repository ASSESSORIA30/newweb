"use client";

import { useId, useRef, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { leadAdapter } from "../lead/adapter";
import { getAttribution, track } from "../lead/tracking";
import type { LeadKind } from "../lead/types";

export type Rule = "required" | "phone" | "email" | "phoneOrEmail";

const PHONE = /^(\+34\s?)?[6789]\d{2}\s?\d{3}\s?\d{3}$|^(\+34\s?)?[6789]\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function check(rule: Rule, v: string, t: Dictionary): string | null {
  const s = v.trim();
  if (rule === "required") return s ? null : t.errors.name;
  if (rule === "phone") return PHONE.test(s.replace(/\s+/g, " ")) ? null : t.errors.phone;
  if (rule === "email") return EMAIL.test(s) ? null : t.errors.email;
  if (rule === "phoneOrEmail") return PHONE.test(s) || EMAIL.test(s) ? null : t.errors.contact;
  return null;
}

/**
 * Shared lead form logic: inline validation on submit, focus on the first error,
 * explicit privacy consent, attribution attached, simulated adapter until the CRM is live.
 */
export function useLeadForm(opts: { kind: LeadKind; locale: Locale; t: Dictionary; rules: Record<string, Rule> }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [ref, setRef] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      track("form_error", { kind: opts.kind, field: first });
      return;
    }
    setStatus("sending");
    const fields: Record<string, string> = {};
    data.forEach((v, k) => {
      if (k !== "privacy" && k !== "marketing" && typeof v === "string") fields[k] = v.slice(0, 2000);
    });
    const res = await leadAdapter.submit({
      kind: opts.kind,
      locale: opts.locale,
      fields,
      consent: {
        privacy: true,
        marketing: data.get("marketing") === "on",
        at: new Date().toISOString(),
        text: `${opts.t.consent.privacy} ${opts.t.consent.privacyLink}`,
      },
      attribution: getAttribution(),
      page: window.location.pathname,
    });
    if (res.ok) {
      setRef(res.id);
      setStatus("done");
      form.reset();
    } else setStatus("error");
  };

  const reset = () => {
    setStatus("idle");
    setRef(null);
  };

  return { formRef, onSubmit, errors, status, refId: ref, reset };
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
        <select {...common} defaultValue="">
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

export function Consent({ t, error, privacyHref }: { t: Dictionary; error?: string; privacyHref: string }) {
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
        <input type="checkbox" name="marketing" />
        <span>{t.consent.marketing}</span>
      </label>
    </div>
  );
}

export function FormDone({ text, refId, t, onAgain, againLabel }: { text: string; refId: string | null; t: Dictionary; onAgain: () => void; againLabel: string }) {
  return (
    <div className="s-done" role="status">
      <span className="s-sim">{t.common.simulation}</span>
      <p>{text}</p>
      {refId ? <p className="s-done__ref s-measure">{refId}</p> : null}
      <button type="button" className="s-textbtn" onClick={onAgain}>
        {againLabel}
      </button>
    </div>
  );
}
