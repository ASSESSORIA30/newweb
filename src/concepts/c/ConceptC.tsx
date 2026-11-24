"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { brand, evidence, EVIDENCE_NOTE, faqs, offices, services, steps, testimonials } from "@/lib/content";
import { DEMO_LABEL, demoEstimate, sampleBill } from "@/lib/bill-demo";
import { useBillAnalysis } from "@/lib/useBillAnalysis";
import { useDropTarget } from "@/lib/useDropTarget";
import { Counter } from "@/components/Counter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Ribbons } from "./Ribbons";
import { MotionToggle } from "@/components/MotionToggle";

/* Illustrative 24h load shapes (synthetic, labelled in the UI). */
const PROFILES = {
  llar: [0.3, 0.25, 0.22, 0.2, 0.2, 0.25, 0.45, 0.7, 0.6, 0.4, 0.35, 0.38, 0.5, 0.55, 0.45, 0.4, 0.45, 0.6, 0.8, 0.95, 1, 0.85, 0.6, 0.4],
  empresa: [0.15, 0.12, 0.12, 0.12, 0.12, 0.15, 0.3, 0.6, 0.85, 0.95, 1, 0.98, 0.9, 0.92, 0.97, 0.95, 0.85, 0.6, 0.35, 0.25, 0.2, 0.18, 0.16, 0.15],
} as const;
type Segment = keyof typeof PROFILES;

function profilePath(p: readonly number[], w = 320, h = 120) {
  const pts = p.map((v, i) => [(i / (p.length - 1)) * w, h - 8 - v * (h - 24)] as const);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="c-header">
      <a href="#top" className="c-logo" translate="no">
        <span className="c-logo__mark" aria-hidden="true" />
        Assessoria 3.0
      </a>
      <nav aria-label="Principal">
        <a href="#savenergy">SavEnergy IA</a>
        <a href="#serveis">Serveis</a>
        <a href="#clients">Clients</a>
        <a href="#oficines">Oficines</a>
      </nav>
      <a href="#contacte" className="c-btn c-btn--ink c-btn--sm">
        Parla amb un assessor
      </a>
    </header>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  const root = useRef<HTMLElement>(null);
  const [segment, setSegment] = useState<Segment>("llar");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLButtonElement>(null);
  const { state, analyzeFile, analyzeSample, reset, stages } = useBillAnalysis(800);
  const { over, bind } = useDropTarget(analyzeFile);
  const chartRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  // Chart morphs with the same seed as the ribbons.
  useEffect(() => {
    const from = { ...PROFILES[segment === "llar" ? "empresa" : "llar"] } as Record<number, number>;
    const cur = { ...from };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const apply = () => {
      const arr = Array.from({ length: 24 }, (_, i) => cur[i]);
      const d = profilePath(arr);
      chartRef.current?.setAttribute("d", d);
      areaRef.current?.setAttribute("d", `${d} L320 120 L0 120 Z`);
    };
    const tw = gsap.to(cur, {
      ...Object.fromEntries(PROFILES[segment].map((v, i) => [i, v])),
      duration: reduce ? 0 : 0.9,
      ease: "expo.inOut",
      onUpdate: apply,
      onComplete: apply,
    });
    return () => {
      tw.kill();
    };
  }, [segment]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".c-hero__title", { type: "words", mask: "words" });
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(split.words, { yPercent: 100, duration: 1, stagger: { each: 0.06, ease: "power1.in" } }, 0.1)
          .from(".c-hero__lede", { opacity: 0, y: 10, duration: 0.8 }, 0.45)
          .from(".c-hero__controls", { opacity: 0, y: 14, duration: 0.8 }, 0.6)
          .from(".c-panel", { opacity: 0, y: 40, rotateX: -12, transformOrigin: "50% 100%", duration: 1.2 }, 0.5);
        gsap.to(".c-panel", {
          y: -60,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="c-hero" aria-labelledby="c-hero-title">
      <Ribbons profile={PROFILES[segment] as unknown as number[]} className="c-hero__ribbons" />
      <div className="c-hero__copy">
        <h1 id="c-hero-title" className="c-hero__title">
          Menys factura. La mateixa energia.
        </h1>
        <p className="c-hero__lede">
          SavEnergy IA llegeix la teva factura de llum o gas, la compara amb més de 30 comercialitzadores i et proposa
          l’opció que s’ajusta a com consumeixes. L’estudi és gratuït.
        </p>
        <div className="c-hero__controls" id="analitza">
          <div role="radiogroup" aria-label="Tipus de client" className="c-seg">
            {(["llar", "empresa"] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={segment === s}
                onClick={() => setSegment(s)}
                className="c-seg__opt"
              >
                {s === "llar" ? "Llar" : "Empresa"}
              </button>
            ))}
            <span className="c-seg__thumb" data-pos={segment} aria-hidden="true" />
          </div>
          <div className="c-drop" data-over={over || undefined} {...bind}>
            <button
              ref={pickRef}
              type="button"
              className="c-btn c-btn--accent"
              onClick={() => inputRef.current?.click()}
              disabled={state.status === "reading"}
            >
              Puja la factura
            </button>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              tabIndex={-1}
              aria-label="Factura de llum o gas"
              accept="application/pdf,image/*"
              className="sr-only"
              onChange={(e) => {
                analyzeFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button type="button" className="c-textbtn" onClick={analyzeSample} disabled={state.status === "reading"}>
              Prova amb una d’exemple
            </button>
          </div>
        </div>
      </div>

      <MotionToggle className="c-motion" />
      <aside className="c-panel" aria-label="SavEnergy IA" aria-live="polite">
        <div className="c-panel__bar">
          <span className="c-panel__dot" data-state={state.status} aria-hidden="true" />
          <strong>SavEnergy IA</strong>
          <span className="c-panel__seg">{segment === "llar" ? "Llar" : "Empresa"}</span>
        </div>
        <div className="c-panel__chart">
          <div className="c-panel__chart-head">
            <span>Perfil horari de consum</span>
            <span className="c-tag">il·lustratiu</span>
          </div>
          <svg viewBox="0 0 320 120" aria-hidden="true">
            <defs>
              <linearGradient id="c-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#18d680" stopOpacity="0.35" />
                <stop offset="1" stopColor="#18d680" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[30, 60, 90].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} className="c-panel__grid" />
            ))}
            <path ref={areaRef} fill="url(#c-area)" />
            <path ref={chartRef} className="c-panel__line" />
          </svg>
          <div className="c-panel__axis" aria-hidden="true">
            <span>0 h</span>
            <span>6 h</span>
            <span>12 h</span>
            <span>18 h</span>
            <span>24 h</span>
          </div>
        </div>
        <div className="c-panel__status">
          {state.status === "idle" ? (
            <p className="c-panel__idle">Puja una factura o prova l’exemple per veure l’anàlisi.</p>
          ) : null}
          {state.status === "error" ? (
            <p className="c-panel__error" role="alert">
              {state.message}
            </p>
          ) : null}
          {state.status === "reading" ? (
            <ul className="c-panel__stages">
              {stages.map((s, i) => (
                <li key={s} data-state={i < state.stage ? "done" : i === state.stage ? "now" : "next"}>
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
          {state.status === "done" ? (
            <div className="c-panel__result">
              <span>Estalvi estimat</span>
              <b>
                {demoEstimate.min}–{demoEstimate.max} {demoEstimate.unit}
              </b>
              <div className="c-panel__actions">
                <a href="#contacte" className="c-btn c-btn--ink c-btn--sm">
                  Vull l’estudi complet
                </a>
                <button
                  type="button"
                  className="c-textbtn"
                  onClick={() => {
                    reset();
                    requestAnimationFrame(() => pickRef.current?.focus());
                  }}
                >
                  Una altra factura
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <p className="c-panel__foot">{DEMO_LABEL}. El fitxer no surt del navegador.</p>
      </aside>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Engine() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".c-engine__flow", start: "top 72%", end: "bottom 60%", scrub: 0.6 },
        });
        tl.from(".c-module", { y: 60, opacity: 0, stagger: 0.25, duration: 0.6, ease: "power3.out" })
          .fromTo(".c-engine__wire", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.2, ease: "none" }, 0.3)
          .from(".c-rank i", { scaleY: 0, transformOrigin: "bottom", stagger: 0.015, duration: 0.3 }, 0.7);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="savenergy" className="c-engine" aria-labelledby="c-engine-title">
      <div className="c-engine__inner">
        <div className="c-engine__head">
          <h2 id="c-engine-title" className="c-h2">
            Com funciona SavEnergy IA
          </h2>
          <p>
            Tres mòduls treballen sobre la teva factura. En la propera fase es connectaran al nostre CRM: el lector de
            factures, el motor de comparatives i el catàleg de tarifes actualitzat.
          </p>
        </div>
        <div className="c-engine__flow">
          <svg className="c-engine__wires" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
            <path className="c-engine__wire" pathLength={1} d="M170 20 H 500" />
            <path className="c-engine__wire" pathLength={1} d="M500 20 H 830" />
          </svg>
          <article className="c-module">
            <h3>Lector de factures</h3>
            <p>Extreu tarifa, potència, consum i període de qualsevol factura en PDF o foto.</p>
            <dl className="c-fields">
              <div>
                <dt>Consum</dt>
                <dd>{sampleBill.consumption} kWh</dd>
              </div>
              <div>
                <dt>Potència</dt>
                <dd>{sampleBill.power.toLocaleString("ca-ES")} kW</dd>
              </div>
              <div>
                <dt>Període</dt>
                <dd>{sampleBill.period}</dd>
              </div>
            </dl>
          </article>
          <article className="c-module">
            <h3>Anàlisi del perfil</h3>
            <p>Reparteix el consum per franges i detecta potència contractada de més.</p>
            <div className="c-split">
              {sampleBill.periods.map((p) => (
                <div key={p.label} style={{ flexGrow: p.share }}>
                  <span>{p.label}</span>
                  <b>{Math.round(p.share * 100)}%</b>
                </div>
              ))}
            </div>
          </article>
          <article className="c-module">
            <h3>Motor de comparatives</h3>
            <p>Contrasta el teu perfil amb les ofertes de més de 30 comercialitzadores.</p>
            <div className="c-rank" aria-hidden="true">
              {Array.from({ length: 30 }, (_, i) => (
                <i key={i} style={{ height: `${92 - i * 2.6}%` }} data-best={i === 29 || undefined} />
              ))}
            </div>
          </article>
        </div>
        <p className="c-note">Valors de la factura d’exemple. {DEMO_LABEL}.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Proof() {
  return (
    <section className="c-proof" aria-label="Resultats">
      <dl>
        {evidence.map((e) => (
          <div key={e.label}>
            <dd>
              <Counter value={e.value} prefix={e.prefix} suffix={e.suffix} />
            </dd>
            <dt>{e.label}</dt>
          </div>
        ))}
      </dl>
      <p className="c-pending">{EVIDENCE_NOTE}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Network() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".c-branch",
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: { trigger: ".c-net", start: "top 75%", end: "center 55%", scrub: 0.5 },
          },
        );
        const pulses: gsap.core.Tween[] = [];
        gsap.utils.toArray<SVGCircleElement>(".c-pulse").forEach((dot, i) => {
          const path = root.current!.querySelector<SVGPathElement>(`#c-branch-${i}`)!;
          const len = path.getTotalLength();
          const o = { t: 0 };
          const tw = gsap.to(o, {
            t: 1,
            duration: 2.6,
            delay: i * 0.37,
            repeat: -1,
            repeatDelay: 1.4,
            ease: "power1.inOut",
            onUpdate: () => {
              const p = path.getPointAtLength(o.t * len);
              dot.setAttribute("cx", String(p.x));
              dot.setAttribute("cy", String(p.y));
              dot.setAttribute("opacity", String(Math.sin(o.t * Math.PI)));
            },
          });
          pulses.push(tw);
        });
        const onMotion = (e: Event) => {
          const paused = (e as CustomEvent<{ paused: boolean }>).detail.paused;
          pulses.forEach((t) => (paused ? t.pause() : t.resume()));
        };
        window.addEventListener("motionchange", onMotion);
        return () => window.removeEventListener("motionchange", onMotion);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Branch endpoints (viewBox 1000×420), source at left-centre.
  const ends = [70, 150, 230, 310, 390];
  return (
    <section ref={root} id="serveis" className="c-network" aria-labelledby="c-net-title">
      <div className="c-network__head">
        <h2 id="c-net-title" className="c-h2">
          Una assessoria, totes les teves factures
        </h2>
        <p>Revisem cada subministrament cada any. Quan surt una opció millor, ho gestionem nosaltres.</p>
      </div>
      <div className="c-net">
        <svg className="c-net__svg" viewBox="0 0 1000 460" aria-hidden="true">
          {ends.map((y, i) => (
            <path
              key={y}
              id={`c-branch-${i}`}
              className="c-branch"
              data-on={active === services[i].id || undefined}
              pathLength={1}
              d={`M 120 230 C 330 230, 330 ${y}, 520 ${y}`}
            />
          ))}
          {ends.map((y) => (
            <circle key={`p${y}`} className="c-pulse" r="4" cx="120" cy="230" opacity="0" />
          ))}
        </svg>
        <div className="c-net__source">
          <span className="c-logo__mark" aria-hidden="true" />
          La teva factura
        </div>
        <ul className="c-net__list">
          {services.map((s, i) => (
            <li
              key={s.id}
              style={{ ["--y" as string]: `${(ends[i] / 460) * 100}%` }}
              data-on={active === s.id || undefined}
              onPointerEnter={() => setActive(s.id)} onPointerLeave={() => setActive(null)}>
              <a href="#contacte" onFocus={() => setActive(s.id)} onBlur={() => setActive(null)}>
                <h3>{s.name}</h3>
                <p>{s.short}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Steps() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".c-steps__fill",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 70%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} className="c-steps" aria-labelledby="c-steps-title">
      <h2 id="c-steps-title" className="c-h2">
        En marxa en tres passos
      </h2>
      <div className="c-steps__rail" aria-hidden="true">
        <i className="c-steps__fill" />
      </div>
      <ol>
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="c-steps__n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Clients() {
  return (
    <section id="clients" className="c-clients" aria-labelledby="c-clients-title">
      <h2 id="c-clients-title" className="c-h2">
        El que diuen els nostres clients
      </h2>
      <p className="c-pending c-pending--center">{EVIDENCE_NOTE}</p>
      <div className="c-clients__grid">
        {testimonials.map((t, i) => (
          <figure key={t.name} data-i={i}>
            <b className="c-clients__save">−{t.saving}</b>
            <blockquote>
              <p>“{t.quote}”</p>
            </blockquote>
            <figcaption>
              {t.name} · {t.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Offices() {
  return (
    <section id="oficines" className="c-offices" aria-labelledby="c-off-title">
      <div>
        <h2 id="c-off-title" className="c-h2">
          A prop teu, a tot Catalunya
        </h2>
        <div className="c-faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <ul className="c-offices__list">
        {offices.map((o) => (
          <li key={o.name}>
            <span>{o.name}</span>
            <strong>{o.city}</strong>
            <p>
              {o.street}, {o.zip}
            </p>
            <a href={`tel:${o.tel}`}>{o.phone}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Close() {
  return (
    <section id="contacte" className="c-close" aria-labelledby="c-close-title">
      <Ribbons profile={PROFILES.llar as unknown as number[]} className="c-close__ribbons" />
      <div className="c-close__inner">
        <h2 id="c-close-title" className="c-close__title">
          {brand.tagline}
        </h2>
        <p>Envia’ns la factura i et responem en menys de 24 hores. Sense cost i sense compromís.</p>
        <div className="c-close__actions">
          <a href="#analitza" className="c-btn c-btn--accent">
            Analitza la factura
          </a>
          <a href={brand.whatsapp.href} className="c-btn c-btn--line">
            WhatsApp {brand.whatsapp.label}
          </a>
          <a href={`mailto:${brand.email}`} className="c-textbtn c-textbtn--light">
            {brand.email}
          </a>
        </div>
      </div>
      <footer className="c-footer">
        <span translate="no">© 2026 Assessoria 3.0</span>
        <span>
          <a href="#">Privacitat</a>
          <a href="#">Avís legal</a>
          <a href="#">Galetes</a>
        </span>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function ConceptC() {
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return (
    <div className="cc">
      <a className="skip-link" href="#main-c">
        Vés al contingut
      </a>
      <SmoothScroll />
      <Header />
      <main id="main-c">
        <Hero />
        <Engine />
        <Proof />
        <Network />
        <Steps />
        <Clients />
        <Offices />
        <Close />
      </main>
    </div>
  );
}
