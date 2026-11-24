// Shape shared by the public site and (later) the CRM adapter. No internal fields
// (commissions, tariff costs, agent notes) ever travel to the browser.
import type { Attribution } from "./tracking";

export type LeadKind = "contact" | "collaborator" | "callback" | "estimate" | "bill-study";

export type Lead = {
  kind: LeadKind;
  locale: "ca" | "es";
  fields: Record<string, string>;
  consent: { privacy: boolean; marketing: boolean; at: string; text: string };
  attribution: { first?: Attribution; last?: Attribution };
  page: string;
};

export type LeadResult = { ok: true; simulated: boolean; id: string } | { ok: false; error: string };

export interface LeadAdapter {
  submit(lead: Lead): Promise<LeadResult>;
}
