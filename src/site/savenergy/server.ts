import "server-only";
/**
 * SavEnergy IA · pont signat entre la web i el CRM (només servidor).
 *  · El navegador només parla amb /api/savenergy/*: mai veu la URL del CRM ni el secret compartit.
 *  · Cada petició al CRM va signada (HMAC-SHA256 amb timestamp i nonce d'un sol ús).
 *  · L'obertura de sessió exigeix un testimoni de Cloudflare Turnstile validat aquí, al servidor.
 *  · No es registren dades personals: els logs només porten codis d'error.
 */
import { createHash, createHmac, randomBytes } from "node:crypto";

export const OPS = ["session", "analyse", "status", "confirm", "lead", "visit"] as const;
export type Op = (typeof OPS)[number];
export const MAX_BODY = 16 * 1024;

export function savenergyConfig() {
  const crm = (process.env.SAVENERGY_CRM_URL ?? "").replace(/\/$/, "");
  const secret = process.env.SAVENERGY_SHARED_SECRET ?? "";
  const turnstile = process.env.TURNSTILE_SECRET_KEY ?? "";
  // HTTPS obligatori; http només per a un CRM local de proves (localhost), mai a Vercel.
  const okUrl = /^https:\/\//.test(crm) || (!process.env.VERCEL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(crm));
  return { crm, secret, turnstile, ready: okUrl && secret.length >= 32 && !!turnstile && process.env.NEXT_PUBLIC_SAVENERGY_ENABLED === "true" };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export function sign(secret: string, method: string, path: string, body: string, now = Date.now()) {
  const ts = String(Math.floor(now / 1000));
  const nonce = randomBytes(24).toString("base64url");
  const sig = createHmac("sha256", secret).update(`${ts}.${nonce}.${method.toUpperCase()}.${path}.${sha256(body)}`).digest("hex");
  return { "x-a30-ts": ts, "x-a30-nonce": nonce, "x-a30-signature": sig };
}

/** IP del visitant segons Vercel (només per als límits del CRM, que la guarda resumida amb un hash diari). */
export function clientIp(h: Headers) {
  const v = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "";
  const ip = v.trim();
  return /^[0-9a-fA-F:.]{3,64}$/.test(ip) ? ip : "0.0.0.0";
}

/** Valida un testimoni de Turnstile (un sol ús) amb l'API de Cloudflare. */
export async function verifyTurnstile(secret: string, token: unknown, ip: string, f: typeof fetch = fetch): Promise<boolean> {
  if (typeof token !== "string" || token.length < 10 || token.length > 4096) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    // TURNSTILE_VERIFY_URL només per a proves locals (fora de Vercel); a producció sempre és Cloudflare.
    const url = (!process.env.VERCEL && process.env.TURNSTILE_VERIFY_URL) || "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const r = await f(url, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { success?: boolean; action?: string };
    return j.success === true && (!j.action || j.action === "savenergy");
  } catch {
    return false;
  }
}
