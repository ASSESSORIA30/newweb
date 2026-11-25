"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { getAttribution, track } from "../lead/tracking";
import { useDropTarget } from "@/lib/useDropTarget";
import { SavError, api, prepareFile, turnstileToken, uploadFile, waitForReading, type Outcome, type PublicField, type Session, type SessionState } from "./client";

/**
 * SavEnergy IA · comparador real (2.0TD residencial). Flux: consentiments → factura → verificació antibot →
 * pujada privada → lectura → el visitant confirma les dades → resultat (o assessor) → sol·licitud de l'oferta.
 * Mai es mostra un estalvi que el CRM no hagi calculat amb dades confirmades.
 */
type Phase =
  | { k: "idle"; error?: string }
  | { k: "busy"; stage: "verifying" | "uploading" | "reading" }
  | { k: "confirm"; st: SessionState }
  | { k: "outcome"; st: SessionState }
  | { k: "contact"; st: SessionState }
  | { k: "done" };

/** Una sola visita per sessió de navegador; la resposta diu si es pot oferir la consulta SIPS (servei activat al CRM). */
let visitInfo: Promise<{ ok: true; sips?: boolean } | undefined> | null = null;
const MAX_BYTES = 8 * 1024 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+34)?[6789]\d{8}$/;

export function LiveUpload({ t, locale }: { t: Dictionary; locale: Locale }) {
  const L = t.savenergy.live;
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const [consent, setConsent] = useState({ privacy: false, retention: false, sips: false });
  const [sipsOffered, setSipsOffered] = useState(false);
  const [consentErr, setConsentErr] = useState(false);
  const [sess, setSess] = useState<Session | null>(null);
  const started = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const tsBox = useRef<HTMLDivElement>(null);
  const honey = useRef<HTMLInputElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const id = useId();

  useEffect(() => {
    started.current = Date.now();
    visitInfo ??= api.visit();
    let alive = true;
    void visitInfo.then((v) => { if (alive && v?.sips) setSipsOffered(true); });
    return () => { alive = false; };
  }, []);
  // en canviar de fase, el focus va al títol de la nova pantalla (lectors de pantalla i teclat)
  useEffect(() => { if (phase.k !== "idle" && phase.k !== "busy") headRef.current?.focus(); }, [phase.k]);

  const errText = (e: unknown) => {
    const code = e instanceof SavError ? e.code : "generic";
    if (code === "limit_ip" || code === "limit_global" || (e instanceof SavError && e.status === 429)) return L.errors.limit;
    return L.errors[code] ?? L.errors.generic;
  };

  const run = async (file: File | null | undefined) => {
    if (!file) return;
    if (!consent.privacy || !consent.retention) { setConsentErr(true); return; }
    const prep = await prepareFile(file, MAX_BYTES);
    if ("error" in prep) { setPhase({ k: "idle", error: L.errors[prep.error] }); return; }
    track("savenergy_live_start");
    try {
      setPhase({ k: "busy", stage: "verifying" });
      const token = await turnstileToken(tsBox.current!, locale);
      const a = getAttribution();
      const last = a.last ?? a.first;
      const utm = Object.fromEntries(([["source", last?.utm_source], ["medium", last?.utm_medium], ["campaign", last?.utm_campaign], ["content", last?.utm_content], ["term", last?.utm_term]] as const).filter(([, v]) => v)) as Record<string, string>;
      const s = await api.open({
        locale, turnstileToken: token, mime: prep.mime, bytes: prep.blob.size, consents: { privacitat_servei: true, factura_temporal: true, sips_titular: sipsOffered && consent.sips },
        ref: last?.ref ?? a.first?.ref, utm: Object.keys(utm).length ? utm : undefined, startedAt: started.current, website: honey.current?.value ?? "",
      });
      setSess(s);
      setPhase({ k: "busy", stage: "uploading" });
      await uploadFile(s, prep.blob);
      setPhase({ k: "busy", stage: "reading" });
      const first = await api.analyse(s);
      const st = first.status === "analitzant" || first.status === "nova" ? await waitForReading(s) : first;
      show(st);
    } catch (e) {
      if (e instanceof SavError && e.code === "servei_no_disponible") { setPhase({ k: "outcome", st: advisorState("servei_no_disponible") }); return; }
      setPhase({ k: "idle", error: errText(e) });
    }
  };

  const show = (st: SessionState) => {
    if (st.outcome) { setPhase({ k: "outcome", st }); track("savenergy_live_outcome", { kind: st.outcome.kind }); return; }
    if (st.status === "llegida" && st.fields.length) { setPhase({ k: "confirm", st }); return; }
    setPhase({ k: "outcome", st: advisorState(st.readStatus === "limit" ? "limit_ia" : "error_lectura") });
  };

  const { over, bind } = useDropTarget((f) => void run(f));
  const reset = () => { setSess(null); started.current = Date.now(); setPhase({ k: "idle" }); };

  if (phase.k === "idle" || phase.k === "busy") {
    const busy = phase.k === "busy";
    return (
      <div className="s-drop s-live" data-over={over || undefined} data-status={busy ? "reading" : "idle"} {...(busy ? {} : bind)} aria-live="polite" aria-busy={busy || undefined}>
        {!busy ? (
          <div className="s-drop__idle">
            <svg viewBox="0 0 48 60" aria-hidden="true" className="s-drop__doc">
              <path d="M6 2h26l12 12v42a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <path d="M32 2v12h12M12 26h24M12 34h18M12 42h22" />
            </svg>
            <h3>{L.title}</h3>
            <p>{L.hint}</p>
            <div className="s-consent s-live__consent">
              <label className="s-check" data-invalid={consentErr && !consent.privacy ? "" : undefined}>
                <input type="checkbox" checked={consent.privacy} onChange={(e) => { setConsent({ ...consent, privacy: e.target.checked }); setConsentErr(false); }} />
                <span>{L.consentPrivacy} <a href={t.footer.legalLinks[1].href} target="_blank" rel="noopener">{L.privacyLink}</a>.</span>
              </label>
              <label className="s-check" data-invalid={consentErr && !consent.retention ? "" : undefined}>
                <input type="checkbox" checked={consent.retention} onChange={(e) => { setConsent({ ...consent, retention: e.target.checked }); setConsentErr(false); }} />
                <span>{L.consentRetention}</span>
              </label>
              {sipsOffered ? (
                <label className="s-check s-check--opt" data-sips-consent>
                  <input type="checkbox" checked={consent.sips} onChange={(e) => setConsent({ ...consent, sips: e.target.checked })} />
                  <span>{L.sips.consent} <span className="s-field__opt">{L.sips.optional}</span></span>
                </label>
              ) : null}
              {consentErr ? <p className="s-field__err" role="alert">{L.errConsent}</p> : null}
            </div>
            {phase.error ? <p className="s-field__err" role="alert">{phase.error}</p> : null}
            <div className="s-row">
              <button type="button" className="s-btn s-btn--primary" onClick={() => { if (!consent.privacy || !consent.retention) { setConsentErr(true); return; } inputRef.current?.click(); }}>
                {L.choose}
              </button>
              <span className="s-drop__or">{t.savenergy.upload.drop}</span>
            </div>
            <input ref={inputRef} id={id} type="file" tabIndex={-1} aria-label={L.title} accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { void run(e.target.files?.[0]); e.target.value = ""; }} />
            <div className="s-hp" aria-hidden="true"><label>Website<input ref={honey} type="text" tabIndex={-1} autoComplete="off" defaultValue="" /></label></div>
          </div>
        ) : (
          <ol className="s-stages">
            {(["verifying", "uploading", "reading"] as const).map((k, i, all) => {
              const now = all.indexOf(phase.stage);
              return (
                <li key={k} data-state={i < now ? "done" : i === now ? "now" : "next"}>
                  <span className="s-stages__mark" aria-hidden="true" />
                  {L.stages[k]}{i === now ? "…" : ""}
                </li>
              );
            })}
          </ol>
        )}
        <div ref={tsBox} className="s-live__turnstile" />
      </div>
    );
  }

  if (phase.k === "confirm") return <Confirm t={t} st={phase.st} headRef={headRef} onDone={show} onError={(e) => setPhase({ k: "idle", error: errText(e) })} session={sess!} />;

  if (phase.k === "outcome") {
    const o = phase.st.outcome!;
    return (
      <div className="s-live s-live__panel" data-wide={o.kind === "resultat" || undefined}>
        {o.kind === "resultat" ? (
          <Result t={t} o={o} headRef={headRef} locale={locale} cta={
            <div className="s-res__cta">
              {sess ? <button type="button" className="s-btn s-btn--primary s-res__btn" onClick={() => setPhase({ k: "contact", st: phase.st })}>{L.wantOffer}</button> : <a href="#contacte" className="s-btn s-btn--primary s-res__btn">{L.wantOffer}</a>}
              <p className="s-res__cta-note">{L.ctaNote}</p>
            </div>
          } />
        ) : (
          <>
            <div className="s-live__advisor">
              <h3 ref={headRef} tabIndex={-1}>{L.advisorTitle}</h3>
              <p>{(o.reason === "fora_abast" && o.detail === "empresa" ? L.advisor.empresa : o.reason === "fora_abast" && o.detail === "segment" ? L.advisor.segment : o.reason === "factura_no_representativa" ? (o.detail === "factura_antiga" ? L.advisor.factura_antiga : L.advisor.periode_curt) : L.advisor[o.reason]) ?? L.advisor.dades_insuficients}</p>
            </div>
            <div className="s-row">
              {sess ? <button type="button" className="s-btn s-btn--primary" onClick={() => setPhase({ k: "contact", st: phase.st })}>{L.talk}</button> : <a href="#contacte" className="s-btn s-btn--primary">{L.talk}</a>}
            </div>
          </>
        )}
        <button type="button" className="s-textbtn s-live__again" onClick={reset}>{L.again}</button>
      </div>
    );
  }

  if (phase.k === "contact") return <Contact t={t} headRef={headRef} session={sess!} onDone={() => setPhase({ k: "done" })} onBack={() => setPhase({ k: "outcome", st: phase.st })} />;

  return (
    <div className="s-live s-live__panel s-done" role="status">
      <h3 ref={headRef} tabIndex={-1}>{L.doneTitle}</h3>
      <p>{L.doneText}</p>
      <button type="button" className="s-textbtn" onClick={reset}>{L.again}</button>
    </div>
  );
}

const advisorState = (reason: string): SessionState => ({ status: "assessor", readStatus: null, cupsMasked: null, fields: [], missing: [], missingPrices: [], toConfirm: [], outcome: { kind: "assessor", reason }, contactRequested: false });

/* ------------------------------------------------------------------ confirmació de dades */
/** Modalitats de preu que el visitant pot triar (la mixta es tracta com a indexada: preus facturats per període). */
type PriceMode = "fix24h" | "periodes" | "hores_promocionades" | "indexat" | "desconegut";
const BAND_KEYS = ["promoKwh", "promoPrice", "restKwh", "restPrice"] as const;
const periodKeys = (k: string, n: number) => Array.from({ length: n }, (_, i) => `${k}.P${i + 1}`);
const FLAT_KEY = "energyPrice.24h";
/** Camps de preu d'energia que es mostren per a cada modalitat: exclusivament els que li corresponen. */

function Confirm({ t, st, session, onDone, onError, headRef }: { t: Dictionary; st: SessionState; session: Session; onDone: (s: SessionState) => void; onError: (e: unknown) => void; headRef: React.RefObject<HTMLHeadingElement | null> }) {
  const L = t.savenergy.live;
  const byKey = new Map<string, PublicField>(st.fields.map((f) => [f.key, f]));
  const has = (k: string) => byKey.get(k)?.value != null;
  // PERÍODES segons la tarifa d'accés: 2.0TD → 3 d'energia i 2 de potència; 3.0TD i 6.1TD → 6 i 6 (els diu el CRM)
  const nE = st.periods?.energy === 6 ? 6 : 3, nP = st.periods?.power === 6 ? 6 : 2;
  const BASE_KEYS = ["days", "annualKwh", ...periodKeys("kwh", nE), ...periodKeys("kw", nP)];
  const PERIOD_PRICE_KEYS = periodKeys("energyPrice", nE);
  const TAIL_KEYS = ["energyDiscountPct", ...periodKeys("powerPrice", nP)];
  // les hores promocionades són una modalitat de 2.0TD; en sis períodes no s'ofereix
  const MODES = (["fix24h", "periodes", "hores_promocionades", "indexat", "desconegut"] as const).filter((m) => nE === 3 || m !== "hores_promocionades");
  const ENERGY_KEYS: Record<PriceMode, readonly string[]> = { fix24h: [FLAT_KEY], periodes: PERIOD_PRICE_KEYS, hores_promocionades: BAND_KEYS, indexat: PERIOD_PRICE_KEYS, desconegut: [] };
  // modalitat detectada pel lector; si el CRM no la informa, es dedueix de les dades llegides
  const detect = (): PriceMode => {
    const m = byKey.get("priceMode")?.value;
    const periods = PERIOD_PRICE_KEYS.map((k) => byKey.get(k)?.value);
    if (nE === 3 && (m === "hores_promocionades" || (BAND_KEYS.some(has) && !PERIOD_PRICE_KEYS.every(has)))) return "hores_promocionades";
    if (m === "indexat" || m === "mixt") return "indexat";
    if (m === "fix24h" || (periods.every((x) => x != null) && new Set(periods).size === 1)) return "fix24h";
    if (m === "periodes" || PERIOD_PRICE_KEYS.some(has)) return "periodes";
    return m === "desconegut" ? "desconegut" : "periodes";
  };
  const [mode, setMode] = useState<PriceMode>(detect);
  const str = (k: string) => (byKey.get(k)?.value == null ? "" : String(byKey.get(k)!.value).replace(".", ","));
  const [vals, setVals] = useState<Record<string, string>>(() => ({ ...Object.fromEntries([...BASE_KEYS, ...PERIOD_PRICE_KEYS, ...BAND_KEYS, ...TAIL_KEYS, "serviceFeeEur"].map((k) => [k, str(k)])), [FLAT_KEY]: str("energyPrice.P1") }));
  // període de facturació detectat (editable) i tipus de titular (només es demana si el lector no l'ha pogut assegurar)
  const iso = (k: string) => { const v = byKey.get(k)?.value; return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ""; };
  const [dates, setDates] = useState({ periodFrom: iso("periodFrom"), periodTo: iso("periodTo") });
  const kindField = byKey.get("customerKind");
  const askKind = !kindField || kindField.value == null || kindField.status === "per_revisar";
  const [kind, setKind] = useState<"particular" | "empresa">(kindField?.value === "empresa" ? "empresa" : "particular");
  const hasService = byKey.get("serviceFeeEur")?.value != null;
  const [busy, setBusy] = useState(false);
  const unit = (k: string) => (k === "annualKwh" ? L.units.kwh : k === "energyDiscountPct" ? "%" : (L.units as Record<string, string>)[k.split(".")[0]] ?? "");
  const tariff = byKey.get("accessTariff")?.value;
  const tail = hasService ? [...TAIL_KEYS, "serviceFeeEur"] : [...TAIL_KEYS];
  const shown = [...BASE_KEYS, ...ENERGY_KEYS[mode], ...tail];
  const num = (k: string) => { const v = (vals[k] ?? "").trim().replace(",", "."); const x = v === "" ? null : Number(v); return x != null && Number.isFinite(x) ? x : null; };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const values: Record<string, number | string | null> = {};
    for (const k of [...BASE_KEYS, ...tail]) values[k] = num(k);
    values.periodFrom = dates.periodFrom || null;
    values.periodTo = dates.periodTo || null;
    if (askKind) values.customerKind = kind;
    // només s'envien els preus de la modalitat triada; els de les altres modalitats s'envien buits perquè no es barregin
    for (const k of PERIOD_PRICE_KEYS) values[k] = mode === "fix24h" ? num(FLAT_KEY) : mode === "periodes" || mode === "indexat" ? num(k) : null;
    for (const k of BAND_KEYS) values[k] = mode === "hores_promocionades" ? num(k) : null;
    try { onDone(await api.confirm(session, values)); } catch (err) { onError(err); } finally { setBusy(false); }
  };
  // 2.0TD: etiquetes amb el nom de la franja (punta, pla, vall); sis períodes: etiqueta genèrica «… P1…P6»
  const label = (k: string) => {
    const [kind, p] = k.split(".P");
    const tpl = nE === 6 && p ? (L.fieldTpl as Record<string, string>)[kind] : undefined;
    return tpl ? tpl.replace("{n}", p) : (L.fields as Record<string, string>)[k] ?? k;
  };
  const missing = ENERGY_KEYS[mode].some((k) => num(k) == null) || periodKeys("powerPrice", nP).some((k) => num(k) == null);
  const eur2 = (k: string) => { const v = byKey.get(k)?.value; return typeof v === "number" && v > 0 ? v.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null; };
  const limits = [eur2("reactiveEur") ? L.limits.reactive.replace("{eur}", eur2("reactiveEur")!) : null, eur2("excessPowerEur") ? L.limits.excess.replace("{eur}", eur2("excessPowerEur")!) : null].filter((x): x is string => !!x);
  return (
    <form className="s-live s-live__panel" onSubmit={submit} noValidate data-price-mode={mode} data-periods={`${nE}/${nP}`}>
      <h3 ref={headRef} tabIndex={-1}>{L.confirmTitle}</h3>
      <p>{L.confirmText}</p>
      <dl className="s-live__meta">
        {tariff ? <div><dt>{L.fields.accessTariff}</dt><dd className="s-measure">{String(tariff)}</dd></div> : null}
        {st.cupsMasked ? <div><dt>{L.cups}</dt><dd className="s-measure">{st.cupsMasked}</dd></div> : null}
      </dl>
      <div className="s-field s-live__mode">
        <label htmlFor="sev-priceMode">{L.mode.label}</label>
        <select id="sev-priceMode" className="s-input" value={mode} onChange={(e) => setMode(e.target.value as PriceMode)} aria-describedby="sev-priceMode-h">
          {MODES.map((m) => <option key={m} value={m}>{nE === 6 && m === "periodes" ? L.mode.periods6 : L.mode.options[m]}</option>)}
        </select>
        <span id="sev-priceMode-h" className="s-field__hint">{L.mode.hint}</span>
      </div>
      {L.mode.notes[mode] ? <p className="s-live__note" data-mode-note>{L.mode.notes[mode]}</p> : null}
      {st.sips ? (
        <p className="s-live__note" role="status" data-sips={st.sips.status}>
          {(st.sips.status === "ok" ? L.sips.ok : st.sips.status === "total" ? L.sips.total : L.sips.fallback)
            .replace("{kwh}", st.sips.annualKwh == null ? "—" : st.sips.annualKwh.toLocaleString("ca-ES"))
            .replace("{from}", st.sips.from ? st.sips.from.split("-").reverse().join("/") : "—").replace("{to}", st.sips.to ? st.sips.to.split("-").reverse().join("/") : "—")}
        </p>
      ) : null}
      {st.notice && L.notice[st.notice] ? <p className="s-live__note s-live__note--warn" role="status" data-notice={st.notice}>{L.notice[st.notice]}</p> : null}
      <div className="s-live__grid">
        {(["periodFrom", "periodTo"] as const).map((k) => (
          <div key={k} className="s-field" data-invalid={st.notice ? "" : undefined}>
            <label htmlFor={`sev-${k}`}>{label(k)}</label>
            <input id={`sev-${k}`} type="date" className="s-input" value={dates[k]} onChange={(e) => setDates({ ...dates, [k]: e.target.value })} />
          </div>
        ))}
        {askKind ? (
          <div className="s-field" data-invalid="">
            <label htmlFor="sev-customerKind">{label("customerKind")}</label>
            <select id="sev-customerKind" className="s-input" value={kind} onChange={(e) => setKind(e.target.value as "particular" | "empresa")} aria-describedby="sev-customerKind-h">
              <option value="particular">{L.kind.particular}</option>
              <option value="empresa">{L.kind.empresa}</option>
            </select>
            <span id="sev-customerKind-h" className="s-field__hint">{L.kind.hint}</span>
          </div>
        ) : null}
        {shown.map((k) => {
          const f: PublicField | undefined = byKey.get(k === FLAT_KEY ? "energyPrice.P1" : k);
          const check = f?.status === "per_revisar" || (k === "days" && !!st.notice);
          return (
            <div key={k} className="s-field" data-invalid={check ? "" : undefined}>
              <label htmlFor={`sev-${k}`}>{label(k)} <span className="s-field__opt">({unit(k)})</span></label>
              <input id={`sev-${k}`} className="s-input" inputMode="decimal" value={vals[k] ?? ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} aria-describedby={check ? `sev-${k}-c` : undefined} />
              {check ? <span id={`sev-${k}-c`} className="s-field__hint">{L.toCheck}</span> : null}
            </div>
          );
        })}
      </div>
      {limits.map((x) => <p key={x} className="s-live__note" data-limit>{x}</p>)}
      {missing && mode !== "desconegut" ? <p className="s-live__note">{L.missingPrices}</p> : null}
      <button type="submit" className="s-btn s-btn--primary" disabled={busy} aria-busy={busy || undefined}>{busy ? <><span className="s-spin" aria-hidden="true" />{t.common.sending}</> : L.confirm}</button>
    </form>
  );
}

/* ------------------------------------------------------------------ resultat */
/** Comptador: de 0 al valor en ~0,9 s amb desacceleració. Amb moviment reduït (o sense JS d'animació) mostra el valor final. */
function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target <= 0) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** «Permanència: 12 mesos» → «12 mesos» (l'etiqueta ja la posa la targeta). */
const stripLabel = (s: string) => s.replace(/^\s*perman[eè]n[cs]ia\s*:\s*/i, "").trim();

function Result({ t, o, headRef, locale, cta }: { t: Dictionary; o: Extract<Outcome, { kind: "resultat" }>; headRef: React.RefObject<HTMLHeadingElement | null>; locale: Locale; cta: React.ReactNode }) {
  const L = t.savenergy.live;
  const tag = locale === "es" ? "es-ES" : "ca-ES";
  const eur = (n: number) => n.toLocaleString(tag, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const pct = (n: number) => `${n.toLocaleString(tag, { maximumFractionDigits: 1 })} %`;
  const best = o.alternatives[0];
  const counted = useCountUp(Math.round(best.saving));
  const estimate = o.basis === "anualitzat";
  return (
    <div className="s-live__result">
      <section className="s-res" aria-labelledby="s-res-title">
        <div className="s-res__top">
          <h3 id="s-res-title" ref={headRef} tabIndex={-1} className="s-res__kicker">{o.stale ? L.stale.title : L.heroTitle}</h3>
          {o.stale ? <span className="s-res__tag s-res__tag--warn">{L.stale.tag}</span> : estimate ? <span className="s-res__tag">{L.orientative}</span> : null}
          {o.variable ? <span className="s-res__tag">{L.variable.tag}</span> : null}
        </div>
        {o.stale ? <p className="s-res__warn" role="note" data-stale>{L.stale.warning}</p> : null}
        <p className="s-res__figure">
          <span className="s-res__num" aria-hidden="true">{eur(counted)}</span>
          <span className="sr-only">{eur(best.saving)}</span>
          <span className="s-res__unit">{o.stale ? L.stale.saving : L.heroSaving}</span>
        </p>
        <ul className="s-res__facts">
          <li><b>{eur(best.savingMonthly)}</b> {L.lessPerMonth}</li>
          <li><b>{pct(best.savingPct)}</b> {L.pctSaving}</li>
        </ul>
        <dl className="s-res__costs">
          <div><dt>{L.currentCostShort}</dt><dd>{eur(o.current.annualCost)}{L.perYear}</dd></div>
          <div><dt>{L.newCostShort}</dt><dd>{eur(best.annualCost)}{L.perYear}</dd></div>
        </dl>
        {o.variable ? <p className="s-res__variable" data-variable>{L.variable.note}</p> : null}
        {o.consumption && L.sips.source[o.consumption.kind] ? (
          <p className="s-res__variable" data-consumption={o.consumption.kind}>
            <b>{L.sips.source.title}:</b> {L.sips.source[o.consumption.kind]}{o.consumption.from && o.consumption.to ? ` (${o.consumption.from.split("-").reverse().join("/")} – ${o.consumption.to.split("-").reverse().join("/")})` : ""}.
          </p>
        ) : null}
      </section>

      <ol className="s-offers" aria-label={L.offersLabel}>
        {o.alternatives.map((a, i) => {
          const ratio = Math.max(4, Math.min(100, (a.annualCost / o.current.annualCost) * 100));
          const guarantee = a.priceGuaranteeMonths ? L.months.replace("{m}", String(a.priceGuaranteeMonths)) : L.notStated;
          // condicions secundàries: sense repetir la garantia de preu ni la permanència que ja són a la targeta
          const extra = [...new Set(a.conditions)].filter((c) => !/garanti/i.test(c) && !/^\s*perman/i.test(c));
          return (
            <li key={a.rank} className="s-offer" data-best={i === 0 || undefined}>
              {i === 0 ? <span className="s-offer__badge">{L.bestBadge}</span> : null}
              <p className="s-offer__name">{a.label}{a.product ? <span> · {a.product}</span> : null}</p>
              <p className="s-offer__saving"><b>{eur(a.saving)}</b><span>{L.savingPerYear}</span></p>
              <p className="s-offer__sub"><span>{eur(a.savingMonthly)} {L.lessPerMonth}</span><span className="s-offer__pct">−{pct(a.savingPct)}</span></p>
              <div className="s-offer__bars" role="img" aria-label={`${L.currentCostShort}: ${eur(o.current.annualCost)}${L.perYear}. ${L.newCostShort}: ${eur(a.annualCost)}${L.perYear}.`}>
                <div className="s-offer__bar"><span>{L.barNow}</span><i style={{ width: "100%" }} /><em>{eur(o.current.annualCost)}</em></div>
                <div className="s-offer__bar" data-new><span>{L.barNew}</span><i style={{ width: `${ratio}%` }} /><em>{eur(a.annualCost)}</em></div>
              </div>
              <p className="s-offer__cost">{L.newCost}: <b>{eur(a.annualCost)}</b>{L.perYear} · {eur(a.monthlyCost)}{L.perMonth}</p>
              <dl className="s-offer__facts">
                <div><dt>{L.tariffType}</dt><dd>{L.contract[a.contractType] ?? a.contractType}</dd></div>
                <div><dt>{L.permanence}</dt><dd>{stripLabel(a.permanence)}</dd></div>
                <div><dt>{L.priceGuarantee}</dt><dd>{guarantee}</dd></div>
              </dl>
              {extra.length ? (
                <details className="s-offer__more">
                  <summary>{L.seeConditions}</summary>
                  <ul>{extra.map((c) => <li key={c}>{c}</li>)}</ul>
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>

      {cta}
      {estimate ? <p className="s-live__note s-live__note--key">{L.orientativeText}</p> : null}
      {o.supplierDisplay === "anonim" ? <p className="s-live__note">{L.anonNote}</p> : null}
      {o.hypotheses.length ? (
        <details className="s-live__hyp"><summary>{L.hypotheses}</summary><ul>{o.hypotheses.map((h) => <li key={h}>{h}</li>)}</ul></details>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ sol·licitud de l'oferta (lead al CRM, no a Formspree) */
function Contact({ t, session, onDone, onBack, headRef }: { t: Dictionary; session: Session; onDone: () => void; onBack: () => void; headRef: React.RefObject<HTMLHeadingElement | null> }) {
  const L = t.savenergy.live;
  const [f, setF] = useState({ name: "", phone: "", email: "", contact: false, commercial: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  const honey = useRef<HTMLInputElement>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const phone = f.phone.replace(/[\s.-]/g, "");
    const next: Record<string, string> = {};
    if (f.name.trim().length < 2) next.name = L.errName;
    if (!(PHONE.test(phone) || EMAIL.test(f.email.trim()))) next.phone = L.errContact;
    if (!f.contact) next.contact = L.errContactConsent;
    setErr(next);
    if (Object.keys(next).length) return;
    setBusy(true); setSendErr(null);
    try {
      await api.lead(session, { idempotencyKey: key, name: f.name.trim(), phone: PHONE.test(phone) ? phone : "", email: EMAIL.test(f.email.trim()) ? f.email.trim().toLowerCase() : "", acceptCommercial: f.commercial, website: honey.current?.value ?? "" });
      track("savenergy_live_lead");
      onDone();
    } catch (e2) {
      setSendErr(e2 instanceof SavError && e2.code === "sessio_caducada" ? L.errors.sessio_caducada : t.send.error);
    } finally { setBusy(false); }
  };
  return (
    <form className="s-live s-live__panel s-form" onSubmit={submit} noValidate>
      <h3 ref={headRef} tabIndex={-1}>{L.contactTitle}</h3>
      <p>{L.contactText}</p>
      <div className="s-field" data-invalid={err.name ? "" : undefined}>
        <label htmlFor="sev-name">{L.name}</label>
        <input id="sev-name" className="s-input" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={err.name ? true : undefined} />
        {err.name ? <span className="s-field__err" role="alert">{err.name}</span> : null}
      </div>
      <div className="s-form__row">
        <div className="s-field" data-invalid={err.phone ? "" : undefined}>
          <label htmlFor="sev-phone">{L.phone}</label>
          <input id="sev-phone" className="s-input" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} aria-invalid={err.phone ? true : undefined} />
        </div>
        <div className="s-field">
          <label htmlFor="sev-email">{L.email}</label>
          <input id="sev-email" className="s-input" type="email" autoComplete="email" spellCheck={false} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
      </div>
      {err.phone ? <span className="s-field__err" role="alert">{err.phone}</span> : null}
      <div className="s-consent">
        <label className="s-check" data-invalid={err.contact ? "" : undefined}>
          <input type="checkbox" checked={f.contact} onChange={(e) => setF({ ...f, contact: e.target.checked })} />
          <span>{L.consentContact} <a href={t.footer.legalLinks[1].href} target="_blank" rel="noopener">{L.privacyLink}</a>.</span>
        </label>
        {err.contact ? <span className="s-field__err" role="alert">{err.contact}</span> : null}
        <label className="s-check">
          <input type="checkbox" checked={f.commercial} onChange={(e) => setF({ ...f, commercial: e.target.checked })} />
          <span>{L.consentCommercial}</span>
        </label>
      </div>
      <div className="s-hp" aria-hidden="true"><label>Website<input ref={honey} type="text" tabIndex={-1} autoComplete="off" defaultValue="" /></label></div>
      {sendErr ? <div className="s-senderr" role="alert"><p>{sendErr}</p></div> : null}
      <div className="s-row">
        <button type="submit" className="s-btn s-btn--primary" disabled={busy} aria-busy={busy || undefined}>{busy ? <><span className="s-spin" aria-hidden="true" />{t.common.sending}</> : sendErr ? t.send.retry : L.send}</button>
        <button type="button" className="s-textbtn" onClick={onBack}>{t.common.close}</button>
      </div>
    </form>
  );
}
