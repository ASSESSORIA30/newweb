"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { brand, evidence, EVIDENCE_NOTE, faqs, offices, services, steps, testimonials } from "@/lib/content";
import { DEMO_LABEL, demoEstimate, sampleBill } from "@/lib/bill-demo";
import { useBillAnalysis } from "@/lib/useBillAnalysis";
import { useDropTarget } from "@/lib/useDropTarget";
import { Counter } from "@/components/Counter";
import { SmoothScroll } from "@/components/SmoothScroll";

/* ------------------------------------------------------------------ */
/* Intake: one quiet control that morphs through its states            */
/* ------------------------------------------------------------------ */

function Intake({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLButtonElement>(null);
  const { state, analyzeFile, analyzeSample, reset, stages } = useBillAnalysis(850);
  const { over, bind } = useDropTarget(analyzeFile);

  return (
    <div className="b-intake" data-tone={tone} data-status={state.status} data-over={over || undefined} {...bind}>
      <div className="b-intake__face" aria-live="polite">
        {state.status === "idle" || state.status === "error" ? (
          <div className="b-intake__row" key="idle">
            <span className="b-intake__hint">
              {state.status === "error" ? (
                <span role="alert">{state.message}</span>
              ) : (
                <>Deixa aquí la factura de llum o gas</>
              )}
            </span>
            <button ref={pickRef} type="button" className="b-btn b-btn--accent" onClick={() => inputRef.current?.click()}>
              Tria la factura
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
          </div>
        ) : null}
        {state.status === "reading" ? (
          <div className="b-intake__row" key={`r${state.stage}`}>
            <span className="b-intake__progress" style={{ ["--p" as string]: (state.stage + 1) / stages.length }} aria-hidden="true" />
            <span className="b-intake__stage">{stages[state.stage]}…</span>
          </div>
        ) : null}
        {state.status === "done" ? (
          <div className="b-intake__row" key="done">
            <span className="b-intake__result">
              <b>
                {demoEstimate.min}–{demoEstimate.max} {demoEstimate.unit}
              </b>
              <small>Estimació de mostra · no és una oferta</small>
            </span>
            <a href="#contacte" className="b-btn b-btn--accent">
              Vull l’estudi complet
            </a>
          </div>
        ) : null}
      </div>
      <div className="b-intake__under">
        {state.status === "done" ? (
          <button
            type="button"
            className="b-link"
            onClick={() => {
              reset();
              requestAnimationFrame(() => pickRef.current?.focus());
            }}
          >
            Analitza’n una altra
          </button>
        ) : (
          <button type="button" className="b-link" onClick={analyzeSample} disabled={state.status === "reading"}>
            Prova amb una factura d’exemple
          </button>
        )}
        <span>{DEMO_LABEL}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="b-nav" data-solid={solid || undefined}>
      <a href="#top" className="b-logo" translate="no">
        Assessoria 3.0
      </a>
      <nav aria-label="Principal">
        <a href="#savenergy">SavEnergy IA</a>
        <a href="#serveis">Serveis</a>
        <a href="#oficines">Oficines</a>
        <a href="#contacte">Contacte</a>
      </nav>
      <a href="#analitza" className="b-btn b-btn--accent b-btn--sm">
        Analitza la factura
      </a>
    </header>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".b-hero__title", { type: "words,chars", mask: "chars" });
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(split.chars, { yPercent: 105, duration: 1.2, stagger: { each: 0.035, ease: "power2.in" } }, 0.2)
          .from(".b-hero__sub", { opacity: 0, y: 12, filter: "blur(6px)", duration: 1 }, 0.75)
          .from(".b-hero .b-intake", { opacity: 0, y: 16, scale: 0.98, duration: 1 }, 0.9);
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} id="top" className="b-hero" aria-labelledby="b-hero-title">
      <h1 id="b-hero-title" className="b-hero__title">
        L’estalvi és ara.
      </h1>
      <p className="b-hero__sub">
        Puja la factura de llum o gas. <span>SavEnergy IA</span> la llegeix, la compara amb més de 30
        comercialitzadores i et diu quant pots estalviar.
      </p>
      <div id="analitza" className="b-hero__intake">
        <Intake />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The product shot: the bill turns in space, is read, then explodes  */
/* into the three layers SavEnergy IA works with.                     */
/* ------------------------------------------------------------------ */

function Exploded() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".b-explode__stage", start: "top top", end: "+=2800", pin: true, scrub: 0.8 },
        });
        tl.fromTo(
          ".b-layers",
          { rotateX: 62, rotateZ: -18, y: 220, scale: 0.78 },
          { rotateX: 0, rotateZ: 0, y: 0, scale: 1, duration: 2, ease: "power2.out" },
          0,
        )
          .fromTo(".b-layer[data-l='1'], .b-layer[data-l='2']", { z: 0, opacity: 0 }, { z: 0, opacity: 0, duration: 0.01 }, 0)
          .fromTo(".b-layer__tag", { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
          .fromTo(".b-explode__cap[data-i='1']", { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
          .fromTo(".b-explode__cap[data-i='0']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
          .fromTo(".b-sheet__scan", { top: "0%", opacity: 1 }, { top: "100%", duration: 1.6 }, 2)
          .to(".b-sheet__scan", { opacity: 0, duration: 0.2 }, 3.6)
          .to(".b-explode__cap[data-i='0']", { opacity: 0, y: -20, duration: 0.5 }, 3.4)
          .to(".b-layers", { rotateX: 52, rotateZ: -24, scale: 0.86, duration: 1.4, ease: "power2.inOut" }, 3.6)
          .to(".b-layer[data-l='1']", { z: 120, opacity: 1, duration: 1.2, ease: "power2.inOut" }, 4.2)
          .to(".b-layer[data-l='2']", { z: 240, opacity: 1, duration: 1.2, ease: "power2.inOut" }, 4.4)
          .to(".b-layer__tag", { opacity: 1, duration: 0.5, stagger: 0.25 }, 5)
          .fromTo(".b-explode__cap[data-i='1']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 5)
          .to({}, { duration: 0.8 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="savenergy" className="b-explode" aria-labelledby="b-explode-title">
      <div className="b-explode__stage">
        <h2 id="b-explode-title" className="sr-only">
          Com llegeix la factura SavEnergy IA
        </h2>
        <div className="b-explode__caps">
          <p className="b-explode__cap" data-i="0">
            <strong>Llegeix cada línia.</strong> Tarifa, potència contractada, consum i franges horàries, extrets de la
            teva factura en segons.
          </p>
          <p className="b-explode__cap" data-i="1">
            <strong>Compara amb el mercat.</strong> El teu perfil de consum, contrastat amb les ofertes de més de 30
            comercialitzadores.
          </p>
        </div>
        <div className="b-scene" aria-hidden="true">
          <div className="b-layers">
            <div className="b-layer b-sheet" data-l="0">
              <div className="b-sheet__head">
                <span>Factura d’electricitat</span>
                <span>Exemple</span>
              </div>
              <div className="b-sheet__lines">
                {[72, 48, 64, 0, 86, 40, 70, 58, 0, 80, 52, 66, 44].map((w, i) =>
                  w ? <i key={i} style={{ width: `${w}%` }} /> : <hr key={i} />,
                )}
              </div>
              <span className="b-sheet__scan" />
              <span className="b-layer__tag">La factura</span>
            </div>
            <div className="b-layer b-layer--data" data-l="1">
              <dl>
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
              <span className="b-layer__tag">Dades llegides</span>
            </div>
            <div className="b-layer b-layer--market" data-l="2">
              <div className="b-market">
                {Array.from({ length: 30 }, (_, i) => (
                  <i key={i} style={{ height: `${30 + ((i * 37) % 60)}%` }} data-best={i === 21 || undefined} />
                ))}
              </div>
              <span className="b-layer__tag">+30 comercialitzadores</span>
            </div>
          </div>
        </div>
        <p className="b-explode__note">Factura d’exemple amb dades sintètiques. {DEMO_LABEL}.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Specimen() {
  return (
    <section className="b-specimen" aria-labelledby="b-spec-title">
      <h2 id="b-spec-title" className="b-h2">
        Resultats que es poden comptar.
      </h2>
      <p className="b-pending">{EVIDENCE_NOTE}</p>
      <dl className="b-specimen__list">
        {evidence.map((e, i) => (
          <div key={e.label} className="b-specimen__item" data-size={i}>
            <dd>
              <Counter value={e.value} prefix={e.prefix} suffix={e.suffix} duration={2} />
            </dd>
            <dt>{e.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".b-manifesto p", { type: "words" });
        gsap.fromTo(
          split.words,
          { color: "#6b716d" },
          {
            color: "#121412",
            stagger: 0.08,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true },
          },
        );
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} className="b-manifesto">
      <p>
        Llum, gas, fibra, alarma, assegurança. Revisem totes les teves factures cada any, perquè no tornis a pagar de més
        sense saber-ho. I si trobem una opció millor, el canvi el fem nosaltres.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Chapters() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>(".b-chapters__track")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".b-chapters__pin",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(".b-chapters__bar i", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: ".b-chapters__pin", start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        gsap.utils.toArray<HTMLElement>(".b-chapter__name").forEach((el) => {
          gsap.from(el, {
            xPercent: 18,
            ease: "none",
            scrollTrigger: { trigger: el, containerAnimation: tween, start: "left right", end: "left 30%", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="serveis" className="b-chapters" aria-labelledby="b-chapters-title">
      <div className="b-chapters__pin">
        <div className="b-chapters__head">
          <h2 id="b-chapters-title" className="b-h2">
            Un assessor per a tot el que pagues cada mes.
          </h2>
          <div className="b-chapters__bar" aria-hidden="true">
            <i />
          </div>
        </div>
        <div className="b-chapters__track">
          {services.map((s) => (
            <article key={s.id} className="b-chapter" aria-labelledby={`b-ch-${s.id}`}>
              <h3 id={`b-ch-${s.id}`} className="b-chapter__name">
                {s.name}
              </h3>
              <div className="b-chapter__body">
                <p>{s.lead}</p>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <a href="#contacte" className="b-link b-link--arrowless">
                  Demana un estudi de {s.name.toLowerCase()}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Steps() {
  return (
    <section className="b-steps" aria-labelledby="b-steps-title">
      <h2 id="b-steps-title" className="b-h2">
        Tres passos. Cap paperassa.
      </h2>
      <ol>
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="b-steps__n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Voices() {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  return (
    <section className="b-voices" aria-labelledby="b-voices-title" aria-roledescription="carrusel">
      <h2 id="b-voices-title" className="sr-only">
        Clients que ja estalvien
      </h2>
      <figure className="b-voices__fig" key={i} aria-live="polite">
        <blockquote>
          <p>“{t.quote}”</p>
        </blockquote>
        <figcaption>
          {t.name}, {t.city} · estalvi de {t.saving}
          <span className="b-pending b-pending--dark">{EVIDENCE_NOTE}</span>
        </figcaption>
      </figure>
      <div className="b-voices__nav" role="group" aria-label="Testimonis">
        {testimonials.map((x, n) => (
          <button
            key={x.name}
            type="button"
            aria-pressed={n === i}
            aria-label={`Testimoni de ${x.name}, ${x.city}`}
            onClick={() => setI(n)}
          >
            <span>{x.city}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Offices() {
  return (
    <section id="oficines" className="b-offices" aria-labelledby="b-off-title">
      <h2 id="b-off-title" className="b-h2">
        Quatre oficines. Un tracte de tu a tu.
      </h2>
      <ul>
        {offices.map((o) => (
          <li key={o.name}>
            <h3>{o.city}</h3>
            <p>
              {o.name}
              <br />
              {o.street}, {o.zip}
            </p>
            <a href={`tel:${o.tel}`}>{o.phone}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Faq() {
  return (
    <section className="b-faq" aria-labelledby="b-faq-title">
      <h2 id="b-faq-title" className="b-h2">
        Preguntes freqüents
      </h2>
      <div>
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Close() {
  return (
    <section id="contacte" className="b-close" aria-labelledby="b-close-title">
      <h2 id="b-close-title" className="b-close__title">
        Paga només el que toca.
      </h2>
      <p className="b-close__sub">Estudi gratuït i sense compromís. Et responem en menys de 24 hores.</p>
      <Intake />
      <p className="b-close__links">
        <a href={`mailto:${brand.email}`}>{brand.email}</a>
        <a href={brand.whatsapp.href}>WhatsApp {brand.whatsapp.label}</a>
      </p>
      <footer className="b-footer">
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

export function ConceptB() {
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return (
    <div className="cb">
      <a className="skip-link" href="#main-b">
        Vés al contingut
      </a>
      <SmoothScroll />
      <Nav />
      <main id="main-b">
        <Hero />
        <Exploded />
        <Specimen />
        <Manifesto />
        <Chapters />
        <Steps />
        <Voices />
        <Offices />
        <Faq />
        <Close />
      </main>
    </div>
  );
}

