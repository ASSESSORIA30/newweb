"use client";
/**
 * SavEnergy IA · client del navegador. Només parla amb /api/savenergy/* (mateix domini) i, per pujar la factura, amb
 * l'URL signada d'un sol fitxer que retorna el CRM. Res no es desa al navegador: la sessió viu en memòria.
 */
export const CONSENT_VERSION = "2026-11-sev1";
export type PublicFieldKey = "accessTariff" | "days" | "kwh.P1" | "kwh.P2" | "kwh.P3" | "kw.P1" | "kw.P2" | "energyPrice.P1" | "energyPrice.P2" | "energyPrice.P3" | "powerPrice.P1" | "powerPrice.P2";
export interface PublicField { key: PublicFieldKey; value: string | number | null; unit: string | null; status: "llegit" | "per_revisar" | "pendent" | "revisat" }
export interface Alternative { rank: number; label: string; product: string | null; contractType: string; permanence: string; priceGuaranteeMonths: number | null; conditions: string[]; annualCost: number; monthlyCost: number; saving: number; savingMonthly: number; savingPct: number; validTo: string | null }
export type Outcome =
  | { kind: "resultat"; asOf: string; current: { annualCost: number; monthlyCost: number }; alternatives: Alternative[]; hypotheses: string[]; supplierDisplay: "anonim" | "nom"; basis: "anual" | "anualitzat" }
  | { kind: "assessor"; reason: string; detail?: string | null; current?: { annualCost: number; monthlyCost: number } | null; hypotheses?: string[] };
export interface SessionState { status: string; readStatus: string | null; cupsMasked: string | null; fields: PublicField[]; missing: string[]; missingPrices: string[]; toConfirm: string[]; outcome: Outcome | null; contactRequested: boolean }

export class SavError extends Error { constructor(public code: string, public status: number) { super(code); } }

async function post<T>(op: string, body: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`/api/savenergy/${op}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  } catch {
    throw new SavError("sense_connexio", 0);
  }
  const j = (await r.json().catch(() => ({}))) as { error?: string };
  if (!r.ok) throw new SavError(j.error ?? "error_intern", r.status);
  return j as T;
}

export interface Session { session: string; access: string; expiresAt: string; maxBytes: number; upload: { url: string; method: string; headers: Record<string, string> } }
export const api = {
  open: (b: { locale: "ca" | "es"; turnstileToken: string; mime: string; bytes: number; consents: { privacitat_servei: true; factura_temporal: true }; ref?: string; utm?: Record<string, string>; startedAt: number; website: string }) =>
    post<Session>("session", { ...b, consentVersion: CONSENT_VERSION }),
  analyse: (s: Session) => post<SessionState>("analyse", { session: s.session, access: s.access }),
  status: (s: Session) => post<SessionState>("status", { session: s.session, access: s.access }),
  confirm: (s: Session, values: Record<string, number | null>) => post<SessionState>("confirm", { session: s.session, access: s.access, values }),
  lead: (s: Session, c: { idempotencyKey: string; name: string; phone: string; email: string; acceptCommercial: boolean; website: string }) => post<{ ok: true; reference?: string; duplicate?: boolean }>("lead", { session: s.session, access: s.access, ...c }),
  visit: () => post<{ ok: true }>("visit", {}).catch(() => undefined),
};

/** Puja el fitxer a l'URL signada (PUT directe a l'emmagatzematge privat; no passa per cap funció de la web). */
export async function uploadFile(s: Session, file: Blob): Promise<void> {
  let r: Response;
  try { r = await fetch(s.upload.url, { method: s.upload.method, headers: s.upload.headers, body: file }); } catch { throw new SavError("pujada_fallida", 0); }
  if (!r.ok) throw new SavError("pujada_fallida", r.status);
}

/** Espera l'anàlisi: consulta l'estat amb pauses creixents, com a màxim ~90 s. */
export async function waitForReading(s: Session, onTick?: (st: SessionState) => void): Promise<SessionState> {
  const started = Date.now();
  let delay = 2000;
  for (;;) {
    await new Promise((r) => setTimeout(r, delay));
    const st = await api.status(s);
    onTick?.(st);
    if (st.status !== "analitzant" && st.status !== "nova") return st;
    if (Date.now() - started > 90_000) throw new SavError("lectura_massa_llarga", 0);
    delay = Math.min(4000, delay + 500);
  }
}

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
/** Valida el tipus i redueix les fotos (≤ 2000 px, JPEG): menys temps de pujada i menys cost de lectura. */
export async function prepareFile(file: File, maxBytes: number): Promise<{ blob: Blob; mime: string } | { error: "format" | "mida" }> {
  if (!ACCEPTED.includes(file.type)) return { error: "format" };
  if (file.type === "application/pdf") return file.size <= maxBytes ? { blob: file, mime: file.type } : { error: "mida" };
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/jpeg", 0.85));
    if (blob && blob.size <= maxBytes) return { blob, mime: "image/jpeg" };
  } catch { /* el navegador no la pot descodificar: s'envia l'original si cap */ }
  return file.size <= maxBytes ? { blob: file, mime: file.type } : { error: "mida" };
}

/* --------------------------------------------------------------- Cloudflare Turnstile (només quan es fa servir) */
type TS = { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
let loading: Promise<TS> | null = null;
function loadTurnstile(): Promise<TS> {
  const w = window as unknown as { turnstile?: TS };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  loading ??= new Promise<TS>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.defer = true;
    s.onload = () => (w.turnstile ? resolve(w.turnstile) : reject(new SavError("antibot_no_disponible", 0)));
    s.onerror = () => { loading = null; reject(new SavError("antibot_no_disponible", 0)); };
    document.head.appendChild(s);
  });
  return loading;
}
/** Obté un testimoni d'un sol ús. Normalment invisible; només demana interacció si Cloudflare ho considera necessari. */
export async function turnstileToken(container: HTMLElement, locale: "ca" | "es"): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) throw new SavError("antibot_no_disponible", 0);
  const ts = await loadTurnstile();
  return new Promise<string>((resolve, reject) => {
    let id = "";
    const done = (fn: () => void) => { fn(); setTimeout(() => { try { ts.remove(id); } catch { /* ja retirat */ } }, 0); };
    id = ts.render(container, {
      sitekey: siteKey, action: "savenergy", appearance: "interaction-only", language: locale, "refresh-expired": "never",
      callback: (t: string) => done(() => resolve(t)),
      "error-callback": () => done(() => reject(new SavError("verificacio_antibot", 0))),
      "timeout-callback": () => done(() => reject(new SavError("verificacio_antibot", 0))),
    });
  });
}
