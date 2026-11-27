import "server-only";
/**
 * SavEnergy IA · pont signat entre la web i el CRM (només servidor).
 *  · El navegador només parla amb /api/savenergy/*: mai veu la URL del CRM ni el secret compartit.
 *  · Cada petició al CRM va signada (HMAC-SHA256 amb timestamp, nonce d'un sol ús i la IP del visitant).
 *    La IP forma part de la signatura (versió 2): el CRM hi basa els límits per connexió i rebutja qualsevol petició
 *    on la capçalera de la IP no coincideixi amb la signada.
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
  // sense espais ni salts de línia enganxats per error en copiar la clau al panell
  const turnstile = (process.env.TURNSTILE_SECRET_KEY ?? "").trim();
  // HTTPS obligatori; http només per a un CRM local de proves (localhost), mai a Vercel.
  const okUrl = /^https:\/\//.test(crm) || (!process.env.VERCEL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(crm));
  // Previews del CRM protegides amb Vercel Authentication: secret de «Protection Bypass for Automation» (només servidor).
  const bypass = process.env.SAVENERGY_CRM_BYPASS ?? "";
  return { crm, secret, turnstile, bypass, ready: okUrl && secret.length >= 32 && !!turnstile && process.env.NEXT_PUBLIC_SAVENERGY_ENABLED === "true" };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const SIGNATURE_VERSION = "2";
export function sign(secret: string, method: string, path: string, body: string, ip: string, now = Date.now()) {
  const ts = String(Math.floor(now / 1000));
  const nonce = randomBytes(24).toString("base64url");
  const sig = createHmac("sha256", secret).update(`v${SIGNATURE_VERSION}.${ts}.${nonce}.${method.toUpperCase()}.${path}.${sha256(body)}.${ip}`).digest("hex");
  return { "x-a30-ts": ts, "x-a30-nonce": nonce, "x-a30-sig-v": SIGNATURE_VERSION, "x-a30-client-ip": ip, "x-a30-signature": sig };
}

/** IP del visitant segons Vercel (només per als límits del CRM, que la guarda resumida amb un hash diari). */
export function clientIp(h: Headers) {
  const v = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "";
  const ip = v.trim();
  return /^[0-9a-fA-F:.]{3,64}$/.test(ip) ? ip : "0.0.0.0";
}

/** Dominis on es pot haver resolt el repte: els de TURNSTILE_ALLOWED_HOSTS (separats per comes) o, si no n'hi ha, el de la mateixa petició. */
export function turnstileHosts(requestHost: string | null | undefined): string[] {
  // només el nom del domini: s'ignora un «https://», un camí o un port escrits per error (la comparació continua sent exacta)
  const clean = (h: string) => h.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").replace(/[/?#].*$/, "").replace(/:\d+$/, "");
  const env = (process.env.TURNSTILE_ALLOWED_HOSTS ?? "").split(",").map(clean).filter(Boolean);
  return env.length ? env : requestHost ? [clean(requestHost)] : [];
}
export const TURNSTILE_ACTION = "savenergy";
export const TURNSTILE_MAX_AGE_MS = 5 * 60_000;

/**
 * Valida un testimoni de Turnstile (un sol ús) amb l'API de Cloudflare. A més de `success`, s'exigeix que:
 *  · l'ACCIÓ sigui exactament la del comparador (un testimoni obtingut per a una altra acció no serveix);
 *  · el DOMINI on s'ha resolt el repte sigui un dels admesos (un testimoni resolt en un altre lloc web no serveix);
 *  · el repte sigui recent (com a màxim 5 minuts).
 * Qualsevol dada que falti a la resposta es considera un rebuig.
 */
export async function verifyTurnstile(secret: string, token: unknown, ip: string, f: typeof fetch = fetch, hosts: string[] = turnstileHosts(null), now = Date.now()): Promise<boolean> {
  return (await checkTurnstile(secret, token, ip, f, hosts, now)) === null;
}

/**
 * Igual que `verifyTurnstile`, però retorna el MOTIU del rebuig (`null` si és vàlid) per poder-lo anotar al registre.
 * El motiu és un codi curt i neutre: mai conté el testimoni, la clau ni cap dada del visitant.
 */
export async function checkTurnstile(secret: string, token: unknown, ip: string, f: typeof fetch = fetch, hosts: string[] = turnstileHosts(null), now = Date.now()): Promise<string | null> {
  if (typeof token !== "string" || token.length < 10 || token.length > 4096) return "testimoni_absent";
  if (!hosts.length) return "sense_dominis_admesos";
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    // TURNSTILE_VERIFY_URL només per a proves locals (fora de Vercel); a producció sempre és Cloudflare.
    const url = (!process.env.VERCEL && process.env.TURNSTILE_VERIFY_URL) || "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const r = await f(url, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { success?: boolean; action?: string; hostname?: string; challenge_ts?: string; "error-codes"?: unknown };
    if (j.success !== true) {
      // codis públics de Cloudflare (p. ex. invalid-input-secret, timeout-or-duplicate); res més
      const codes = Array.isArray(j["error-codes"]) ? j["error-codes"].filter((c): c is string => typeof c === "string" && /^[a-z-]{3,40}$/.test(c)).slice(0, 4) : [];
      return `cloudflare:${codes.join("+") || "sense_codi"}`;
    }
    if (j.action !== TURNSTILE_ACTION) return "accio_diferent";
    if (typeof j.hostname !== "string" || !hosts.includes(j.hostname.toLowerCase())) return "domini_no_admes";
    const at = Date.parse(j.challenge_ts ?? "");
    return Number.isFinite(at) && Math.abs(now - at) <= TURNSTILE_MAX_AGE_MS ? null : "repte_antic";
  } catch {
    return "cloudflare_no_respon";
  }
}
