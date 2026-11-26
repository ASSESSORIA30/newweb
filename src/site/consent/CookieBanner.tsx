"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import { readConsent, SETTINGS_EVENT, writeConsent } from "./consent";

/**
 * Consent banner for what the site really stores. Shown until the visitor chooses; re-opened from the
 * footer ("Configure cookies") or the cookie policy. Accept / reject carry the same weight.
 */
export function CookieBanner({ t, policyHref }: { t: Dictionary; policyHref: string }) {
  const c = t.cookies;
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const returnTo = useRef<HTMLElement | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    // Deferred to the first idle moment so the banner never competes with the hero's first paint.
    const show = () => {
      if (!readConsent()) setOpen(true);
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const h = ric ? ric(show, { timeout: 1500 }) : window.setTimeout(show, 600);
    const onSettings = () => {
      returnTo.current = document.activeElement as HTMLElement | null;
      setAnalytics(readConsent()?.analytics ?? false);
      setPanel(true);
      setOpen(true);
      requestAnimationFrame(() => box.current?.querySelector<HTMLElement>("input, button")?.focus());
    };
    window.addEventListener(SETTINGS_EVENT, onSettings);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSettings);
      if (!ric) window.clearTimeout(h);
    };
  }, []);

  const choose = (value: boolean) => {
    writeConsent(value);
    setOpen(false);
    setPanel(false);
    returnTo.current?.focus?.();
  };

  if (!open) return null;
  return (
    <div
      ref={box}
      className="s-cookie"
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      data-panel={panel || undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape" && readConsent()) setOpen(false);
      }}
    >
      <p className="s-cookie__title" id={`${id}-t`}>
        {c.title}
      </p>
      <p className="s-cookie__text" id={`${id}-d`}>
        {c.text}{" "}
        <a href={policyHref}>{c.policy}</a>.
      </p>
      {panel ? (
        <div className="s-cookie__cats">
          <div className="s-cookie__cat">
            <div>
              <p className="s-cookie__name">{c.necessary}</p>
              <p className="s-cookie__desc">{c.necessaryText}</p>
            </div>
            <span className="s-cookie__always">{c.always}</span>
          </div>
          <label className="s-cookie__cat">
            <div>
              <p className="s-cookie__name">{c.analytics}</p>
              <p className="s-cookie__desc">{c.analyticsText}</p>
            </div>
            <input type="checkbox" role="switch" className="s-switch" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>
        </div>
      ) : null}
      <div className="s-cookie__actions">
        <button type="button" className="s-cookie__btn" onClick={() => choose(false)}>
          {c.reject}
        </button>
        {panel ? (
          <button type="button" className="s-cookie__btn" onClick={() => choose(analytics)}>
            {c.save}
          </button>
        ) : (
          <button type="button" className="s-cookie__btn" onClick={() => setPanel(true)}>
            {c.configure}
          </button>
        )}
        <button type="button" className="s-cookie__btn s-cookie__btn--primary" onClick={() => choose(true)}>
          {c.accept}
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}>
      {label}
    </button>
  );
}
