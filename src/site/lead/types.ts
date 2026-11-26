// Shape shared by every lead form. No internal fields (commissions, tariff costs, agent notes)
// ever travel to the browser.
import type { Attribution } from "./tracking";

/** Origin of the enquiry: contact, business, collaborator, advisor callback or energy study. */
export type LeadKind = "contact" | "business" | "collaborator" | "callback" | "study";

export type LeadContact = {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  service?: string;
  city?: string;
  message?: string;
};

export type Lead = {
  kind: LeadKind;
  locale: "ca" | "es";
  contact: LeadContact;
  /** Extra answers shown to the advisor, as [label, value]. */
  details: [string, string][];
  clientType?: "particular" | "empresa";
  consent: { privacy: boolean; marketing: boolean; at: string; text: string };
  attribution: { first?: Attribution; last?: Attribution };
  page: string;
};

export type LeadResult = { ok: true } | { ok: false; reason: "network" | "server" | "rejected"; status?: number };

export interface LeadAdapter {
  submit(lead: Lead, honeypot?: string): Promise<LeadResult>;
}
