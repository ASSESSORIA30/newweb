"use client";

/** CTAs that ask for an energy study pre-set the contact form (origin "study" + service). */
export const INTENT_EVENT = "a30:lead-intent";
export type LeadIntent = { kind: "study"; service?: string };

export function requestStudy(service?: string) {
  window.dispatchEvent(new CustomEvent<LeadIntent>(INTENT_EVENT, { detail: { kind: "study", service } }));
}
