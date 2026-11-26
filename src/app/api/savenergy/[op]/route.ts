import { clientIp, MAX_BODY, OPS, savenergyConfig, sign, verifyTurnstile, type Op, turnstileHosts } from "@/site/savenergy/server";

export const maxDuration = 30;

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

/**
 * Únic punt d'entrada del comparador SavEnergy IA. Pàgines estàtiques a part, aquesta és l'única funció de servidor
 * del comparador: valida, (a l'obertura) comprova Turnstile, signa i reenvia al CRM. No desa res.
 */
export async function POST(req: Request, ctx: { params: Promise<{ op: string }> }) {
  const { op } = await ctx.params;
  if (!(OPS as readonly string[]).includes(op)) return json({ error: "no_trobat" }, 404);
  const cfg = savenergyConfig();
  if (!cfg.ready) return json({ error: "servei_no_disponible" }, 503);
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY) return json({ error: "peticio_massa_gran" }, 413);
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "peticio_massa_gran" }, 413);
  let data: Record<string, unknown>;
  try { data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}; } catch { return json({ error: "peticio_no_valida" }, 400); }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return json({ error: "peticio_no_valida" }, 400);
  const ip = clientIp(req.headers);
  if ((op as Op) === "session") {
    const ok = await verifyTurnstile(cfg.turnstile, data.turnstileToken, ip, fetch, turnstileHosts(req.headers.get("x-forwarded-host") ?? req.headers.get("host")));
    if (!ok) return json({ error: "verificacio_antibot" }, 403);
    delete data.turnstileToken;
    data.turnstile = "verificat";
  }
  const body = JSON.stringify(data);
  const path = `/api/public/savenergy/${op}`;
  try {
    const r = await fetch(`${cfg.crm}${path}`, {
      method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(25_000),
      headers: { "content-type": "application/json", ...(cfg.bypass ? { "x-vercel-protection-bypass": cfg.bypass } : {}), ...sign(cfg.secret, "POST", path, body, ip) },
    });
    const out = await r.json().catch(() => ({ error: "error_intern" }));
    return json(out, r.status);
  } catch {
    console.warn("[savenergy] crm_no_disponible");
    return json({ error: "servei_no_disponible" }, 503);
  }
}
