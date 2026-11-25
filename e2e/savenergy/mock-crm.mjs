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
  { key: "accessTariff", value: "2.0TD", unit: null, status: "llegit" }, { key: "days", value: 33, unit: "dies", status: "llegit" }, { key: "annualKwh", value: 2253, unit: "kWh", status: "per_revisar" },
  { key: "kwh.P1", value: 80, unit: "kWh", status: "per_revisar" }, { key: "kwh.P2", value: 70, unit: "kWh", status: "llegit" }, { key: "kwh.P3", value: 110, unit: "kWh", status: "llegit" },
  { key: "kw.P1", value: 4.6, unit: "kW", status: "llegit" }, { key: "kw.P2", value: 4.6, unit: "kW", status: "llegit" },
  { key: "energyPrice.P1", value: 0.24, unit: "€/kWh", status: "llegit" }, { key: "energyPrice.P2", value: 0.19, unit: "€/kWh", status: "llegit" }, { key: "energyPrice.P3", value: 0.15, unit: "€/kWh", status: "llegit" },
  { key: "powerPrice.P1", value: 0.11, unit: "€/kW·dia", status: "llegit" }, { key: "powerPrice.P2", value: 0.06, unit: "€/kW·dia", status: "llegit" },
];
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
    if (m[1] === "session") return send(200, { session: randomUUID(), access: "A".repeat(43), expiresAt: new Date(Date.now() + 864e5).toISOString(), maxBytes: 8388608, upload: { url: `http://localhost:${PORT}/upload/${randomUUID()}`, method: "PUT", headers: { "content-type": data.mime, "x-upsert": "false" } } });
    if (m[1] === "analyse") return send(200, state("analitzant"));
    if (m[1] === "status") { polls += 1; return send(200, polls < 2 ? state("analitzant") : state("llegida")); }
    if (m[1] === "confirm") return send(200, state("resultat", { outcome, toConfirm: [] }));
    if (m[1] === "lead") return send(200, { ok: true, reference: "ABCD1234" });
    if (m[1] === "visit") return send(200, { ok: true });
    send(404, { error: "no_trobat" });
  });
}).listen(PORT, () => console.log(`mock CRM :${PORT}`));
