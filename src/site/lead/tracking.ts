"use client";

import { CONSENT_EVENT, hasAnalyticsConsent, type ConsentState } from "../consent/consent";

/**
 * Lead attribution, captured in the browser only (no server cost):
 * - utm_*, gclid/fbclid, collaborator referral code (?ref= or ?col=), landing page, referrer.
 * - Without consent it lives in memory for this page view only (attached to a form sent now).
 * - With "analytics" consent: first touch kept 90 days (localStorage), last touch per session (sessionStorage).
 */
export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  ref?: string;
  landing: string;
  referrer: string;
  at: string;
};

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;
const FIRST = "a30.attribution.first.v1";
const LAST = "a30.attribution.last.v1";
const TTL = 90 * 24 * 3600 * 1000;

let memory: Attribution | null = null;

function read(): Attribution {
  const q = new URLSearchParams(window.location.search);
  const a: Attribution = { landing: window.location.pathname, referrer: document.referrer || "", at: new Date().toISOString() };
  for (const k of KEYS) {
    const v = q.get(k);
    if (v) a[k] = v.slice(0, 120);
  }
  const ref = q.get("ref") || q.get("col");
  if (ref && /^[\w-]{2,40}$/.test(ref)) a.ref = ref;
  return a;
}

function persist(now: Attribution) {
  try {
    const hasSignal = KEYS.some((k) => now[k]) || now.ref || (now.referrer && !now.referrer.includes(window.location.host));
    const first = localStorage.getItem(FIRST);
    const firstOk = first && Date.now() - Date.parse(JSON.parse(first).at) < TTL;
    if (!firstOk) localStorage.setItem(FIRST, JSON.stringify(now));
    if (hasSignal || !sessionStorage.getItem(LAST)) sessionStorage.setItem(LAST, JSON.stringify(now));
  } catch {
    /* storage unavailable (private mode): attribution is best effort */
  }
}

function forget() {
  try {
    localStorage.removeItem(FIRST);
    sessionStorage.removeItem(LAST);
  } catch {
    /* nothing stored */
  }
}

let listening = false;
export function captureAttribution() {
  memory = read();
  if (hasAnalyticsConsent()) persist(memory);
  if (!listening) {
    listening = true;
    window.addEventListener(CONSENT_EVENT, (e) => {
      if ((e as CustomEvent<ConsentState>).detail.analytics) persist(memory ?? read());
      else forget();
    });
  }
}

export function getAttribution(): { first?: Attribution; last?: Attribution } {
  const now = memory ?? read();
  if (!hasAnalyticsConsent()) return { last: now };
  try {
    const first = localStorage.getItem(FIRST);
    const last = sessionStorage.getItem(LAST);
    return { first: first ? JSON.parse(first) : undefined, last: last ? JSON.parse(last) : now };
  } catch {
    return { last: now };
  }
}

/** Conversion events go to window.dataLayer (in-page only); no third-party script is loaded. */
export function track(event: string, props: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...props });
}
