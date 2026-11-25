"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useBillAnalysis } from "@/lib/useBillAnalysis";
import { useDropTarget } from "@/lib/useDropTarget";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { company } from "../data/company";
import { track } from "../lead/tracking";
import { Consent, Field, FormDone, Honeypot, SubmitRow, useLeadForm } from "../ui/forms";
import { requestStudy } from "../lead/intent";

type Mode = "upload" | "estimate" | "advisor";

/* ------------------------------------------------------------------ */
/* The cinematic scan: a sample bill is read, its concepts identified,  */
/* opportunities flagged. Pinned + scrubbed on desktop.                */
/* ------------------------------------------------------------------ */

function Scan({ t }: { t: Dictionary }) {
  const root = useRef<HTMLDivElement>(null);
  const s = t.savenergy.scan;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = root.current!;
        const setPhase = (p: number) => el.setAttribute("data-phase", String(p));
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=2600",
            pin: true,
            scrub: 0.7,
            onUpdate: (self) => setPhase(self.progress < 0.38 ? 0 : self.progress < 0.7 ? 1 : 2),
          },
        });
        tl.fromTo(".s-bill", { rotateX: 16, rotateY: -14, y: 40, scale: 0.94 }, { rotateX: 0, rotateY: 0, y: 0, scale: 1, duration: 1, ease: "power2.out" }, 0)
          .fromTo(".s-bill__scan", { top: "0%", opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.3)
          .to(".s-bill__scan", { top: "100%", duration: 2.6 }, 0.3)
          .to(".s-bill__scan", { opacity: 0, duration: 0.2 }, 2.9);
        gsap.utils.toArray<HTMLElement>(".s-bill__concept").forEach((row, i) => {
          tl.fromTo(row, { "--hl": 0 }, { "--hl": 1, duration: 0.3 }, 0.6 + i * 0.45);
          tl.fromTo(`.s-chip[data-i="${i}"]`, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, 0.7 + i * 0.45);
        });
        tl.fromTo(".s-finding", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.25, ease: "power2.out" }, 3.2)
          .fromTo(".s-bill__flag", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.25, ease: "power2.out" }, 3.2)
          .to({}, { duration: 0.6 });
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        root.current?.setAttribute("data-phase", "2");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="s-scan" data-phase="0">
      <div className="s-wrap s-scan__grid">
        <ol className="s-scan__steps">
          {s.steps.map((st, i) => (
            <li key={st.title} data-i={i}>
              <span className="s-measure">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <figure className="s-bill-wrap">
          <div className="s-bill" role="img" aria-label={s.billTag}>
            <div className="s-bill__head">
              <div>
                <strong>{s.billTitle}</strong>
                <span className="s-bill__issuer">{s.doc.issuer}</span>
              </div>
              <span className="s-bill__tag">{s.billTag}</span>
            </div>
            <dl className="s-bill__meta">
              <div>
                <dt>{s.doc.cups}</dt>
                <dd className="s-measure">{s.doc.cupsValue}</dd>
              </div>
              <div>
                <dt>{s.doc.period}</dt>
                <dd className="s-measure">{s.doc.periodValue}</dd>
              </div>
              <div>
                <dt>{s.doc.tariff}</dt>
                <dd className="s-measure">{s.doc.tariffValue}</dd>
              </div>
            </dl>
            <div className="s-bill__concepts">
              {s.concepts.map((c, i) => (
                <div key={c.k} className="s-bill__concept" data-k={c.k}>
                  <span className="s-bill__n s-measure">{i + 1}</span>
                  <span>{c.label}</span>
                  <b className="s-measure">{c.value}</b>
                  {i === 0 || i === 2 ? <span className="s-bill__flag" aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
            <table className="s-bill__table">
              <thead>
                <tr>
                  {s.doc.table.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.doc.rows.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row">{r[0]}</th>
                    <td className="s-measure">{r[1]}</td>
                    <td className="s-measure">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <span className="s-bill__scan" aria-hidden="true" />
          </div>
          <figcaption className="s-sim-note">{t.common.simulationNote}</figcaption>
        </figure>

        <div className="s-scan__out">
          <div className="s-readouts">
            <p className="s-readouts__title">{s.readTitle}</p>
            <ul className="s-chips">
              <li className="s-chip" data-i="0">
                <span>{s.concepts[0].label}</span>
                <b className="s-measure">{s.concepts[0].value}</b>
                <span className="s-gauge" aria-hidden="true">
                  <i style={{ width: "100%" }} />
                  <i className="s-gauge__peak" style={{ width: `${(3.1 / 4.6) * 100}%` }} />
                </span>
                <small>
                  {s.doc.peak} <span className="s-measure">{s.doc.peakValue}</span>
                </small>
              </li>
              <li className="s-chip" data-i="1">
                <span>{s.concepts[1].label}</span>
                <b className="s-measure">{s.concepts[1].value}</b>
              </li>
              <li className="s-chip" data-i="2">
                <span>{s.concepts[2].label}</span>
                <span className="s-bars" aria-hidden="true">
                  {[34, 29, 37].map((v, i) => (
                    <i key={i} style={{ height: `${v * 2}%` }} data-peak={i === 0 || undefined} />
                  ))}
                </span>
                <b className="s-measure">{s.concepts[2].value}</b>
              </li>
              <li className="s-chip" data-i="3">
                <span>{s.concepts[3].label}</span>
                <b className="s-measure">{s.concepts[3].value}</b>
              </li>
              <li className="s-chip" data-i="4">
                <span>{s.concepts[4].label}</span>
                <b className="s-measure">{s.concepts[4].value}</b>
              </li>
            </ul>
          </div>
          <div className="s-findings">
            <p className="s-findings__title">
              {s.findingsTitle} <span className="s-sim">{t.common.simulation}</span>
            </p>
            <ul>
              {s.findings.map((f) => (
                <li key={f} className="s-finding">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function UploadPanel({ t }: { t: Dictionary }) {
  const u = t.savenergy.upload;
  const inputRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLButtonElement>(null);
  const { state, analyzeFile, analyzeSample, reset } = useBillAnalysis(850);
  const { over, bind } = useDropTarget(analyzeFile);
  const inputId = useId();
  const errorText = state.status === "error" ? (state.message.includes("10 MB") ? u.errSize : u.errType) : null;

  return (
    <div className="s-drop" data-over={over || undefined} data-status={state.status} {...bind} aria-live="polite">
      {state.status === "idle" || state.status === "error" ? (
        <div className="s-drop__idle">
          <svg viewBox="0 0 48 60" aria-hidden="true" className="s-drop__doc">
            <path d="M6 2h26l12 12v42a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <path d="M32 2v12h12M12 26h24M12 34h18M12 42h22" />
          </svg>
          <h3>{u.title}</h3>
          <p>{u.hint}</p>
          {errorText ? (
            <p className="s-field__err" role="alert">
              {errorText}
            </p>
          ) : null}
          <div className="s-row">
            <button
              ref={pickRef}
              type="button"
              className="s-btn s-btn--primary"
              onClick={() => {
                track("savenergy_upload_click");
                inputRef.current?.click();
              }}
            >
              {u.choose}
            </button>
            <span className="s-drop__or">{u.drop}</span>
          </div>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            tabIndex={-1}
            aria-label={u.title}
            accept="application/pdf,image/*"
            className="sr-only"
            onChange={(e) => {
              analyzeFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button type="button" className="s-textbtn" onClick={analyzeSample}>
            {u.sample}
          </button>
        </div>
      ) : null}
      {state.status === "reading" ? (
        <ol className="s-stages">
          {u.stages.map((st, i) => (
            <li key={st} data-state={i < state.stage ? "done" : i === state.stage ? "now" : "next"}>
              <span className="s-stages__mark" aria-hidden="true" />
              {st}
              {i === state.stage ? "…" : ""}
            </li>
          ))}
        </ol>
      ) : null}
      {state.status === "done" ? (
        <div className="s-drop__done">
          <span className="s-sim">{t.common.simulation}</span>
          <h3>{u.doneTitle}</h3>
          <p>{u.doneText}</p>
          <ul className="s-drop__found">
            {t.savenergy.scan.findings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="s-row">
            <a href="#contacte" className="s-btn s-btn--primary" onClick={() => {
                track("savenergy_request_study");
                requestStudy();
              }}>
              {u.request}
            </a>
            <button
              type="button"
              className="s-textbtn"
              onClick={() => {
                reset();
                requestAnimationFrame(() => pickRef.current?.focus());
              }}
            >
              {u.again}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EstimatePanel({ t, locale }: { t: Dictionary; locale: Locale }) {
  const e = t.savenergy.estimate;
  const [who, setWho] = useState<"home" | "business">("home");
  const [supply, setSupply] = useState<"light" | "gas" | "both">("light");
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ spend: number } | null>(null);
  const spendId = useId();
  const cpId = useId();

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const spend = Number(String(fd.get("spend")).replace(",", "."));
    if (!Number.isFinite(spend) || spend < 10 || spend > 100000) {
      setErr(e.errSpend);
      ev.currentTarget.querySelector<HTMLInputElement>('[name="spend"]')?.focus();
      return;
    }
    setErr(null);
    setResult({ spend });
    track("savenergy_estimate", { who, supply });
  };

  return (
    <form className="s-estimate" onSubmit={onSubmit} noValidate>
      <div className="s-estimate__form">
        <fieldset className="s-choice">
          <legend>{e.who}</legend>
          {(["home", "business"] as const).map((k) => (
            <label key={k} data-on={who === k || undefined}>
              <input type="radio" name="who" value={k} checked={who === k} onChange={() => setWho(k)} />
              {k === "home" ? e.home : e.business}
            </label>
          ))}
        </fieldset>
        <fieldset className="s-choice">
          <legend>{e.supply}</legend>
          {(["light", "gas", "both"] as const).map((k) => (
            <label key={k} data-on={supply === k || undefined}>
              <input type="radio" name="supply" value={k} checked={supply === k} onChange={() => setSupply(k)} />
              {e.supplies[k]}
            </label>
          ))}
        </fieldset>
        <div className="s-field" data-invalid={err ? "" : undefined}>
          <label htmlFor={spendId}>{e.spend}</label>
          <div className="s-affix">
            <input
              id={spendId}
              name="spend"
              className="s-input"
              inputMode="decimal"
              autoComplete="off"
              placeholder="120"
              aria-invalid={err ? true : undefined}
              aria-describedby={`${spendId}-h${err ? ` ${spendId}-e` : ""}`}
            />
            <span aria-hidden="true">€ / mes</span>
          </div>
          <span id={`${spendId}-h`} className="s-field__hint">
            {e.spendHint}
          </span>
          {err ? (
            <span id={`${spendId}-e`} className="s-field__err" role="alert">
              {err}
            </span>
          ) : null}
        </div>
        <div className="s-field">
          <label htmlFor={cpId}>
            {e.postcode} <span className="s-field__opt">({t.common.optional})</span>
          </label>
          <input id={cpId} name="postcode" className="s-input" inputMode="numeric" autoComplete="postal-code" placeholder="25001" maxLength={5} />
        </div>
        <button type="submit" className="s-btn s-btn--primary">
          {e.submit}
        </button>
      </div>
      <div className="s-estimate__out" aria-live="polite" data-ready={result ? "" : undefined}>
        <p className="s-estimate__label">{e.resultTitle}</p>
        <p className="s-estimate__value">
          <span className="s-measure">— €</span>
        </p>
        <p className="s-estimate__pending">
          <span className="s-sim">{t.common.simulation}</span> {e.resultPending}
        </p>
        <p className="s-estimate__text">{e.resultText}</p>
        {result ? (
          <a href="#contacte" className="s-btn s-btn--secondary" onClick={() => {
            track("savenergy_estimate_to_advisor");
            requestStudy(supply === "gas" ? "Gas" : supply === "both" ? (locale === "es" ? "Varios servicios" : "Diversos serveis") : locale === "es" ? "Electricidad" : "Electricitat");
          }}>
            {e.resultCta}
          </a>
        ) : null}
      </div>
    </form>
  );
}

function AdvisorPanel({ t, locale }: { t: Dictionary; locale: Locale }) {
  const a = t.savenergy.advisor;
  const { onSubmit, errors, status, sendError, reset } = useLeadForm({
    kind: "callback",
    locale,
    t,
    rules: { name: "required", phone: "phone" },
    map: (d) => {
      const g = (k: string) => String(d.get(k) ?? "").trim();
      return {
        contact: { name: g("name"), phone: g("phone").replace(/[\s.-]/g, ""), service: locale === "es" ? "Asesoramiento" : "Assessorament" },
        details: [[a.when, g("when")]],
      };
    },
  });
  return (
    <div className="s-advisor">
      <div className="s-advisor__direct">
        <a href={company.whatsapp.href} className="s-btn s-btn--primary" onClick={() => track("whatsapp_click", { from: "savenergy" })}>
          {a.whatsapp} · {company.whatsapp.label}
        </a>
        <p className="s-advisor__call">{a.call}</p>
        <ul>
          {company.offices.map((o) => (
            <li key={o.id}>
              <span>{o.city}</span>
              <a href={`tel:${o.tel}`} className="s-measure" onClick={() => track("phone_click", { office: o.id })}>
                {o.phone}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {status === "done" ? (
        <FormDone text={a.done} t={t} onAgain={reset} />
      ) : (
        <form className="s-advisor__form" onSubmit={onSubmit} noValidate>
          <p className="s-advisor__q">{a.callback}</p>
          <Honeypot />
          <Field t={t} label={a.name} name="name" autoComplete="name" error={errors.name} />
          <Field t={t} label={a.phone} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="600 000 000…" error={errors.phone} />
          <Field t={t} label={a.when} name="when" as="select" options={a.whenOptions} optional />
          <Consent t={t} error={errors.privacy} privacyHref={t.footer.legalLinks[1].href} legalHref={t.footer.legalLinks[0].href} />
          <SubmitRow t={t} label={a.submit} status={status} sendError={sendError} className="s-btn s-btn--primary" />
        </form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** The three entry modes. Listens to the SavEnergy bus so any CTA can open it in a given mode. */
export function SavConsole({ t, locale, className = "s-console" }: { t: Dictionary; locale: Locale; className?: string }) {
  const [mode, setMode] = useState<Mode>("upload");
  const [instant, setInstant] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const modes: Mode[] = ["upload", "estimate", "advisor"];
  const base = useId();

  useEffect(() => {
    const on = (e: Event) => {
      setInstant(true);
      setMode((e as CustomEvent<Mode>).detail);
    };
    window.addEventListener("a30:savenergy-mode", on);
    return () => window.removeEventListener("a30:savenergy-mode", on);
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % 3;
    if (e.key === "ArrowLeft") n = (i + 2) % 3;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = 2;
    if (n < 0) return;
    e.preventDefault();
    setInstant(true);
    setMode(modes[n]);
    tabs.current[n]?.focus();
  };

  return (
    <div className={className} id="savenergy-console">
      <div className="s-console__bar">
        <p className="s-console__label" id={`${base}-l`}>
          {t.savenergy.modesLabel}
        </p>
        <div role="tablist" aria-labelledby={`${base}-l`} className="s-seg" data-pos={modes.indexOf(mode)} data-instant={instant || undefined}>
          {modes.map((m, i) => (
            <button
              key={m}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-t-${m}`}
              aria-selected={mode === m}
              aria-controls={`${base}-p`}
              tabIndex={mode === m ? 0 : -1}
              onClick={() => {
                setInstant(false);
                setMode(m);
              }}
              onKeyDown={(e) => onKey(e, i)}
            >
              {t.savenergy.modes[m]}
            </button>
          ))}
          <span className="s-seg__thumb" aria-hidden="true" />
        </div>
      </div>
      <div id={`${base}-p`} role="tabpanel" aria-labelledby={`${base}-t-${mode}`} className="s-console__panel" data-instant={instant || undefined} key={mode}>
        {mode === "upload" ? <UploadPanel t={t} /> : null}
        {mode === "estimate" ? <EstimatePanel t={t} locale={locale} /> : null}
        {mode === "advisor" ? <AdvisorPanel t={t} locale={locale} /> : null}
      </div>
      <p className="s-console__foot">{t.common.simulationNote}</p>
    </div>
  );
}

export function SavEnergy({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="savenergy" className="s-savenergy" aria-labelledby="s-sav-title">
      <div className="s-wrap s-savenergy__head">
        <h2 id="s-sav-title" className="s-h2">
          {t.savenergy.title}
        </h2>
        <p className="s-lede">{t.savenergy.lede}</p>
      </div>
      <Scan t={t} />
      <div className="s-wrap">
        <SavConsole t={t} locale={locale} />
      </div>
    </section>
  );
}
