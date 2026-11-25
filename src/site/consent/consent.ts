"use client";

/**
 * Cookie / storage consent, kept in the browser only (no third-party consent platform).
 * Categories are the ones this site really uses:
 *  - necessary: this consent record and the language cookie (a30_lang). Always on.
 *  - analytics: persistent lead attribution (first touch for 90 days, last touch per session).
 * Nothing optional is written before the visitor chooses.
 */
export type ConsentState = { v: 1; analytics: boolean; at: string };

const KEY = "a30.consent.v1";
export const CONSENT_EVENT = "a30:consent";
export const SETTINGS_EVENT = "a30:cookie-settings";

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as ConsentState;
    return c && c.v === 1 && typeof c.analytics === "boolean" ? c : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return readConsent()?.analytics === true;
}

export function writeConsent(analytics: boolean) {
  const c: ConsentState = { v: 1, analytics, at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage blocked: the choice applies to this page view only */
  }
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: c }));
  return c;
}

/** Re-open the preferences panel (footer link, cookie policy page). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}
