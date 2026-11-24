"use client";

import type { Lead, LeadAdapter, LeadResult } from "./types";
import { track } from "./tracking";

/**
 * Simulated adapter: validates and records the lead locally (dataLayer event only).
 * It never sends personal data anywhere. Swap for `httpLeadAdapter` once the CRM
 * integration is authorised; that one posts to a same-origin route which forwards
 * server-side with the secret key (see src/server/crm).
 */
export const simulatedLeadAdapter: LeadAdapter = {
  async submit(lead: Lead): Promise<LeadResult> {
    await new Promise((r) => setTimeout(r, 650));
    const id = `SIM-${Date.now().toString(36).toUpperCase()}`;
    track("lead_submit", { kind: lead.kind, locale: lead.locale, simulated: true, source: lead.attribution.last?.utm_source, ref: lead.attribution.last?.ref });
    return { ok: true, simulated: true, id };
  },
};

/** Ready for phase 2; intentionally unused while NEXT_PUBLIC_LEAD_MODE !== "live". */
export const httpLeadAdapter: LeadAdapter = {
  async submit(lead: Lead): Promise<LeadResult> {
    const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(lead) });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return (await res.json()) as LeadResult;
  },
};

export const leadAdapter: LeadAdapter = process.env.NEXT_PUBLIC_LEAD_MODE === "live" ? httpLeadAdapter : simulatedLeadAdapter;
