// CRM SIMULAT per a les proves de punta a punta de SavEnergy IA (cap dada real, cap enviament real).
// CRM simulat: valida la signatura HMAC i el nonce de cada petició, i respon com l'API pública de SavEnergy.
import http from "node:http";
import { createHash, createHmac, randomUUID } from "node:crypto";
const SECRET = process.env.SECRET;
const PORT = Number(process.env.PORT ?? 4010);
const seen = new Set();
const log = [];
const sha = (s) => createHash("sha256").update(s).digest("hex");
const fields = [
  { key: "customerKind", value: "particular", unit: null, status: "llegit" }, { key: "periodFrom", value: "2026-09-16", unit: "data", status: "llegit" }, { key: "periodTo", value: "2026-10-19", unit: "data", status: "llegit" },
  { key: "accessTariff", value: "2.0TD", unit: null, status: "llegit" }, { key: "days", value: 33, unit: "dies", status: "llegit" }, { key: "annualKwh", value: 2253, unit: "kWh", status: "per_revisar" },
  { key: "kwh.P1", value: 80, unit: "kWh", status: "per_revisar" }, { key: "kwh.P2", value: 70, unit: "kWh", status: "llegit" }, { key: "kwh.P3", value: 110, unit: "kWh", status: "llegit" },
  { key: "kw.P1", value: 4.6, unit: "kW", status: "llegit" }, { key: "kw.P2", value: 4.6, unit: "kW", status: "llegit" },
  { key: "energyPrice.P1", value: 0.24, unit: "€/kWh", status: "llegit" }, { key: "energyPrice.P2", value: 0.19, unit: "€/kWh", status: "llegit" }, { key: "energyPrice.P3", value: 0.15, unit: "€/kWh", status: "llegit" },
  { key: "powerPrice.P1", value: 0.11, unit: "€/kW·dia", status: "llegit" }, { key: "powerPrice.P2", value: 0.06, unit: "€/kW·dia", status: "llegit" },
];
// Escenari «hores promocionades» (sessions obertes amb utm_source=promo): dues franges comercials, sense preus per període d'accés.
const promoFields = [
  ...fields.filter((f) => !f.key.startsWith("energyPrice.") && f.key !== "annualKwh").map((f) => ({ ...f, status: "llegit" })),
  { key: "priceMode", value: "hores_promocionades", unit: null, status: "llegit" },
  { key: "promoKwh", value: 212.72, unit: "kWh", status: "llegit" }, { key: "promoPrice", value: 0.1349, unit: "€/kWh", status: "llegit" },
  { key: "restKwh", value: 369.48, unit: "kWh", status: "llegit" }, { key: "restPrice", value: 0.26371, unit: "€/kWh", status: "llegit" },
];
const promoSessions = new Set();
// Escenari «factura antiga, indexada i titular dubtós» (utm_source=antiga): període antic per revisar, tipus de client per
// confirmar, servei recurrent de la comercialitzadora i resultat només orientatiu, amb advertència.
const oldFields = [
  ...fields.filter((f) => !["annualKwh", "customerKind", "periodFrom", "periodTo"].includes(f.key)).map((f) => ({ ...f, status: "llegit" })),
  { key: "customerKind", value: "empresa", unit: null, status: "per_revisar" }, { key: "periodFrom", value: "2024-01-05", unit: "data", status: "llegit" }, { key: "periodTo", value: "2024-02-04", unit: "data", status: "llegit" },
  { key: "priceMode", value: "indexat", unit: null, status: "llegit" }, { key: "serviceFeeEur", value: 5.01, unit: "€", status: "llegit" },
];
const oldSessions = new Set();
// Escenari «3.0TD d'empresa» (utm_source=tri): sis períodes d'energia i de potència, amb energia reactiva facturada.
const six = (k, unit, v) => v.map((x, i) => ({ key: `${k}.P${i + 1}`, value: x, unit, status: "llegit" }));
const triFields = [
  { key: "accessTariff", value: "3.0TD", unit: null, status: "llegit" }, { key: "customerKind", value: "empresa", unit: null, status: "llegit" }, { key: "days", value: 30, unit: "dies", status: "llegit" },
  { key: "periodFrom", value: "2026-09-01", unit: "data", status: "llegit" }, { key: "periodTo", value: "2026-09-30", unit: "data", status: "llegit" }, { key: "priceMode", value: "periodes", unit: null, status: "llegit" },
  ...six("kwh", "kWh", [800, 700, 600, 500, 400, 1200]), ...six("kw", "kW", [30, 30, 30, 30, 30, 45]), ...six("energyPrice", "€/kWh", [0.21, 0.19, 0.16, 0.14, 0.12, 0.11]), ...six("powerPrice", "€/kW·dia", [0.06, 0.04, 0.016, 0.014, 0.009, 0.005]),
  { key: "reactiveEur", value: 18.5, unit: "€", status: "llegit" },
];
const triSessions = new Set();
// Escenari «gas» (utm_source=gas): un sol període de consum, terme variable i terme fix (€/dia); sense potència.
const gasFields = [
  { key: "energyType", value: "gas", unit: null, status: "llegit" }, { key: "accessTariff", value: "RL.1", unit: null, status: "llegit" }, { key: "customerKind", value: "particular", unit: null, status: "llegit" },
  { key: "days", value: 61, unit: "dies", status: "llegit" }, { key: "periodFrom", value: "2026-09-01", unit: "data", status: "llegit" }, { key: "periodTo", value: "2026-10-31", unit: "data", status: "llegit" },
  { key: "annualKwh", value: 6200, unit: "kWh", status: "llegit" }, { key: "kwh.P1", value: 512, unit: "kWh", status: "llegit" }, { key: "energyPrice.P1", value: 0.0625, unit: "€/kWh", status: "llegit" },
  { key: "gasFixedEurDay", value: 0.17326, unit: "€/dia", status: "llegit" }, { key: "priceMode", value: "fix24h", unit: null, status: "llegit" },
];
const gasSessions = new Set();
// Escenari «SIPS» (sessions obertes amb l'autorització del titular): consum anual real SIMULAT; mai el CUPS complet.
const sipsSessions = new Set();
const sipsInfo = { status: "ok", annualKwh: 3420, periods: [980, 870, 1570], from: "2025-11-01", to: "2026-10-31" };
const state = (status, extra = {}) => ({ status, readStatus: "ok", cupsMasked: "ES••••••••••••5678JN", fields, missing: [], missingPrices: [], toConfirm: fields.filter((f) => f.status === "per_revisar").map((f) => f.key), outcome: null, contactRequested: false, ...extra });
const outcome = { kind: "resultat", asOf: "2026-11-25", current: { annualCost: 1079.09, monthlyCost: 89.92 }, basis: "anualitzat", supplierDisplay: "anonim", hypotheses: ["Consum anualitzat a partir d'una factura de 30 dies (×12.17); no té en compte l'estacionalitat."],
  alternatives: [{ rank: 1, label: "Comercialitzadora A", product: null, contractType: "periodes", permanence: "Sense permanència", priceGuaranteeMonths: 12, conditions: ["Preus diferents per franges horàries", "Preu garantit 12 mesos", "Oferta vigent fins al 2027-06-30"], annualCost: 715.13, monthlyCost: 59.59, saving: 363.96, savingMonthly: 30.33, savingPct: 33.73, validTo: "2027-06-30" },
                 { rank: 2, label: "Comercialitzadora B", product: null, contractType: "fix24h", permanence: "Permanència: 12 mesos", priceGuaranteeMonths: 12, conditions: ["Preu fix de l'energia", "Preu garantit 12 mesos", "Preu garantit 12 mesos"], annualCost: 760, monthlyCost: 63.33, saving: 319.09, savingMonthly: 26.59, savingPct: 29.57, validTo: null },
                 { rank: 3, label: "Comercialitzadora C", product: null, contractType: "periodes", permanence: "Sense permanència", priceGuaranteeMonths: null, conditions: [], annualCost: 801.5, monthlyCost: 66.79, saving: 277.59, savingMonthly: 23.13, savingPct: 25.72, validTo: null }] };
let polls = 0;
http.createServer((req, res) => {
  const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "PUT, OPTIONS", "access-control-allow-headers": "content-type, x-upsert" };
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    const send = (code, obj, h = {}) => { res.writeHead(code, { "content-type": "application/json", ...h }); res.end(JSON.stringify(obj)); };
    if (req.url === "/__log") return send(200, log);
    if (req.url === "/turnstile") { const p = new URLSearchParams(body); return send(200, { success: p.get("response") === "ok-token-0123456789" && p.get("secret") === "test-secret", action: "savenergy" }); }
    if (req.url.startsWith("/upload/")) { log.push({ op: "upload", bytes: body.length, type: req.headers["content-type"] }); return send(200, { Key: "ok" }, cors); }
    const m = /^\/api\/public\/savenergy\/(\w+)$/.exec(req.url);
    if (!m) return send(404, { error: "no_trobat" });
    const [ts, nonce, sig] = [req.headers["x-a30-ts"], req.headers["x-a30-nonce"], req.headers["x-a30-signature"]];
    const expected = createHmac("sha256", SECRET).update(`${ts}.${nonce}.POST.${req.url}.${sha(body)}`).digest("hex");
    const fresh = Math.abs(Date.now() / 1000 - Number(ts)) < 300;
    if (!sig || sig !== expected || !fresh) { log.push({ op: m[1], sigOk: false }); return send(401, { error: "Signatura no vàlida" }); }
    if (seen.has(nonce)) return send(409, { error: "Petició repetida" });
    seen.add(nonce);
    const data = body ? JSON.parse(body) : {};
    log.push({ op: m[1], sigOk: true, ip: req.headers["x-a30-client-ip"], data });
    const old = oldSessions.has(data.session);
    const sipsOn = sipsSessions.has(data.session);
    const tri = triSessions.has(data.session);
    const gasOn = gasSessions.has(data.session);
    const promo = gasOn ? { fields: gasFields, toConfirm: [], energy: "gas", periods: { energy: 1, power: 0 } } : tri ? { fields: triFields, toConfirm: [], periods: { energy: 6, power: 6 } } : sipsOn ? { sips: sipsInfo } : promoSessions.has(data.session) ? { fields: promoFields, toConfirm: [] } : old ? { fields: oldFields, toConfirm: ["customerKind"], notice: "factura_antiga" } : {};
    if (m[1] === "session") { const id = randomUUID(); if (data.utm?.source === "promo") promoSessions.add(id); if (data.utm?.source === "antiga") oldSessions.add(id); if (data.utm?.source === "tri") triSessions.add(id); if (data.utm?.source === "gas") gasSessions.add(id); if (data.consents?.sips_titular === true && data.utm?.source === "sips") sipsSessions.add(id); return send(200, { session: id, access: "A".repeat(43), expiresAt: new Date(Date.now() + 864e5).toISOString(), maxBytes: 8388608, upload: { url: `http://localhost:${PORT}/upload/${randomUUID()}`, method: "PUT", headers: { "content-type": data.mime, "x-upsert": "false" } } }); }
    if (m[1] === "analyse") return send(200, state("analitzant"));
    if (m[1] === "status") { polls += 1; return send(200, polls < 2 ? state("analitzant") : state("llegida", promo)); }
    if (m[1] === "confirm") return send(200, state("resultat", { ...promo, notice: null, outcome: old ? { ...outcome, stale: { periodTo: data.values.periodTo }, variable: true } : sipsOn ? { ...outcome, basis: "anual", consumption: { kind: "sips", from: sipsInfo.from, to: sipsInfo.to } } : { ...outcome, consumption: { kind: "factura_anualitzada", from: null, to: null } }, toConfirm: [] }));
    if (m[1] === "lead") return send(200, { ok: true, reference: "ABCD1234" });
    if (m[1] === "visit") return send(200, { ok: true, sips: true });
    send(404, { error: "no_trobat" });
  });
}).listen(PORT, () => console.log(`mock CRM :${PORT}`));
