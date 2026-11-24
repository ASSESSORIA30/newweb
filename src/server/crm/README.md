# CRM integration (phase 2 — not active)

The public website will reuse the existing CRM (crm.assessoria30.com, repo `ASSESSORIA30/renovaciosC`):
AI bill reader, comparison engine, current tariff catalogue, savings calculation, authorised SIPS lookups,
lead capture, collaborator assignment, comparison documents and WhatsApp integration.

Rules
- One tariff catalogue: the CRM's. The website never stores tariffs.
- Secrets (`CRM_API_URL`, `CRM_API_KEY`) live only in Vercel server environment variables and are read
  in route handlers under `src/app/api/*` (to be created). Never prefix them with `NEXT_PUBLIC_`.
- Commissions, internal costs and agent notes never leave the server; responses are mapped to the public
  shapes in `types.ts` before returning.
- Route handlers are the only server functions; everything else stays static to keep Vercel usage minimal.

Switch-on checklist
1. Implement the ports in `types.ts` against the CRM API (server-only).
2. Add `src/app/api/leads/route.ts`, `src/app/api/savenergy/read/route.ts`, `.../estimate/route.ts`.
3. Set `NEXT_PUBLIC_LEAD_MODE=live` and the CRM secrets in Vercel (Production only).
4. Remove the simulation labels only for the flows that are actually live.
