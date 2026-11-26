"use client";

/**
 * The one connection to Formspree, shared by every lead form of the site.
 * Existing Assessoria 3.0 form (delivers to info@assessoria30.com); no new form, no paid plan.
 * Sent with fetch (JSON, Accept: application/json) so the visitor never leaves the page.
 * The form id is public by design (it is in the HTML of any Formspree form); no secret is involved.
 */
export const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mredlbqp";

export type FormspreeResult = { ok: true } | { ok: false; reason: "network" | "server" | "rejected"; status?: number };

export async function sendToFormspree(payload: Record<string, string>, timeoutMs = 15000): Promise<FormspreeResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (res.ok) return { ok: true };
    // 4xx: Formspree refused the content (validation, spam, form disabled). 5xx: try again later.
    return { ok: false, reason: res.status >= 500 ? "server" : "rejected", status: res.status };
  } catch {
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
