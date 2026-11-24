"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { brand, evidence, EVIDENCE_NOTE, faqs, offices, services, steps, testimonials, type ServiceId } from "@/lib/content";
import { DEMO_LABEL, demoEstimate, sampleBill } from "@/lib/bill-demo";
import { Counter } from "@/components/Counter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SignalField } from "./SignalField";
import { AnalyzerA } from "./AnalyzerA";
import { PaletteSwitcher } from "./PaletteSwitcher";
import { paletteById, palettes, type Palette, type PaletteId } from "./palettes";
import { MotionToggle } from "@/components/MotionToggle";
import { isMotionPaused } from "@/lib/motion";

/* ------------------------------------------------------------------ */
/* Service signatures: each service is a channel with its own waveform */
/* ------------------------------------------------------------------ */

type Wave = { freq: number; amp: number; square: number; spike: number; drift: number };
const signatures: Record<ServiceId, Wave> = {
  llum: { freq: 3, amp: 0.72, square: 0, spike: 0, drift: 1 },
  gas: { freq: 1.15, amp: 0.55, square: 0, spike: 0, drift: 0.45 },
  telecom: { freq: 5, amp: 0.6, square: 1, spike: 0, drift: 1.6 },
  alarmes: { freq: 0.5, amp: 0.06, square: 0, spike: 1, drift: 0.8 },
  assegurances: { freq: 0.8, amp: 0.18, square: 0, spike: 0, drift: 0.25 },
};

function wavePath(w: Wave, phase: number, width = 1000, height = 400, n = 220) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = t * width;
    const s = Math.sin(t * Math.PI * 2 * w.freq + phase);
    const sq = Math.tanh(s * 6);
    let y = (s * (1 - w.square) + sq * w.square) * w.amp;
    const spikeCenter = ((phase * 0.08) % 1 + 1) % 1;
    y += Math.exp(-Math.pow((t - spikeCenter) * 38, 2)) * 0.9 * w.spike;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${(height / 2 - y * height * 0.42).toFixed(1)}`;
  }
  return d;
}

function MiniTrace({ id }: { id: ServiceId }) {
  return (
    <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" className="a-minitrace">
      <path d={wavePath(signatures[id], 0.6, 1000, 400, 80)} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    ["#savenergy", "SavEnergy IA"],
    ["#serveis", "Serveis"],
    ["#com-funciona", "Com funciona"],
    ["#oficines", "Oficines"],
  ] as const;

  return (
    <header className="a-header" data-open={open || undefined}>
      <a href="#top" className="a-logo" aria-label="Assessoria 3.0, inici">
        <svg viewBox="0 0 40 20" aria-hidden="true">
          <path d="M1 10h7l3-8 5 16 4-12 3 4h16" />
        </svg>
        <span translate="no">Assessoria 3.0</span>
      </a>
      <nav aria-label="Principal" className="a-nav">
        {links.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="a-header__end">
        <span className="a-lang" aria-label="Idioma">
          <a href="#" aria-current="true">
            CA
          </a>
          <a href="#" lang="es">
            ES
          </a>
        </span>
        <a href="#analitza" className="a-btn a-btn--solid a-btn--sm">
          Analitza la factura
        </a>
        <button
          type="button"
          className="a-menu"
          aria-expanded={open}
          aria-controls="a-sheet"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Tanca el menú" : "Obre el menú"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <div id="a-sheet" className="a-sheet" hidden={!open}>
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a href="#contacte" onClick={() => setOpen(false)}>
          Contacte
        </a>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */

function Hero({ palette }: { palette: Palette }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".a-hero__title", { type: "lines", mask: "lines", linesClass: "a-line" });
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.11 }, 0.15)
          .from(".a-hero__lede", { opacity: 0, y: 10, filter: "blur(4px)", duration: 0.9 }, 0.45)
          .from(".a-hero .a-intake", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, 0.35)
          .from(".a-channels", { opacity: 0, duration: 0.8 }, 0.8);
        // Scroll exit: content lifts and dims while the field dollies in.
        gsap.to(".a-hero__copy", {
          yPercent: -18,
          opacity: 0.2,
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
    <section ref={root} className="a-hero" id="top" aria-labelledby="a-hero-title">
      <SignalField className="a-hero__field" lead={palette.fieldLead} dim={palette.fieldDim} blend={palette.fieldBlend} />
      <div className="a-graticule" aria-hidden="true" />
      <div className="a-hero__inner">
        <div className="a-hero__copy">
          <h1 id="a-hero-title" className="a-hero__title">
            Llegim la factura. Trobem l’estalvi.
          </h1>
          <p className="a-hero__lede">
            SavEnergy IA analitza la teva factura de llum o gas i la compara amb més de 30 comercialitzadores. L’estudi
            és gratuït i el canvi el gestionem nosaltres, per a llars i empreses.
          </p>
        </div>
        <div id="analitza" className="a-hero__intake">
          <AnalyzerA />
        </div>
      </div>
      <MotionToggle className="a-motion" />
      <ul className="a-channels" aria-label="Serveis">
        {services.map((s, i) => (
          <li key={s.id}>
            <a href={`#canal-${s.id}`}>
              <span className="a-mono">CH{i + 1}</span>
              <span>{s.name}</span>
              <MiniTrace id={s.id} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function BillReader() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".a-reader__stage",
            start: "top top",
            end: "+=2600",
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              const phase = self.progress < 0.36 ? 0 : self.progress < 0.68 ? 1 : 2;
              root.current?.setAttribute("data-phase", String(phase));
            },
          },
        });
        tl.fromTo(".a-bill", { rotateY: -18, rotateX: 8, z: -60 }, { rotateY: -6, rotateX: 4, z: 0, duration: 1 }, 0)
          .fromTo(".a-scan", { yPercent: 0, opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.2)
          .to(".a-scan", { top: "100%", duration: 2.4 }, 0.2)
          .from(".a-field", { opacity: 0.15, stagger: 0.45, duration: 0.3 }, 0.5)
          .from(".a-readout", { opacity: 0, x: 24, stagger: 0.45, duration: 0.4 }, 0.6)
          .from(".a-bars i", { scaleY: 0, transformOrigin: "bottom", stagger: 0.12, duration: 0.5 }, 1.8)
          .to(".a-scan", { opacity: 0, duration: 0.2 }, 2.7)
          .from(".a-compare__ticks i", { opacity: 0.12, stagger: 0.04, duration: 0.2 }, 2.9)
          .fromTo(".a-compare__trace", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6 }, 2.9)
          .from(".a-estimate", { opacity: 0, y: 16, duration: 0.6 }, 4.3)
          .to({}, { duration: 0.6 });
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        root.current?.setAttribute("data-phase", "2");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const phases = [
    { title: "Llegeix", text: "La IA extreu tarifa, potència contractada, consum i franges horàries directament de la factura." },
    { title: "Entén", text: "Detecta si pagues potència de més i com es reparteix el teu consum entre punta, pla i vall." },
    { title: "Compara", text: "Contrasta el teu perfil amb les ofertes de més de 30 comercialitzadores i calcula l’estalvi." },
  ];

  return (
    <section ref={root} id="savenergy" className="a-reader" data-phase="0" aria-labelledby="a-reader-title">
      <div className="a-reader__stage">
        <div className="a-graticule a-graticule--faint" aria-hidden="true" />
        <div className="a-reader__copy">
          <h2 id="a-reader-title" className="a-h2">
            SavEnergy IA llegeix cada línia de la factura
          </h2>
          <ol className="a-phases">
            {phases.map((p, i) => (
              <li key={p.title} data-i={i}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="a-reader__instrument">
          <figure className="a-bill-wrap">
            <div className="a-bill" aria-label="Factura d’exemple amb dades sintètiques" role="img">
              <div className="a-bill__top">
                <strong>Factura d’electricitat</strong>
                <span>Exemple · dades sintètiques</span>
              </div>
              <div className="a-bill__rows" aria-hidden="true">
                <i style={{ width: "62%" }} />
                <i style={{ width: "44%" }} />
                <i style={{ width: "70%" }} />
              </div>
              <div className="a-field" data-k="period">
                <span>Període</span>
                <b>{sampleBill.period}</b>
              </div>
              <div className="a-field" data-k="power">
                <span>Potència contractada</span>
                <b>{sampleBill.power.toLocaleString("ca-ES")} kW</b>
              </div>
              <div className="a-field" data-k="cons">
                <span>Consum</span>
                <b>{sampleBill.consumption} kWh</b>
              </div>
              <div className="a-field" data-k="split">
                <span>Franges</span>
                <b>P1 · P2 · P3</b>
              </div>
              <div className="a-bill__rows" aria-hidden="true">
                <i style={{ width: "80%" }} />
                <i style={{ width: "52%" }} />
                <i style={{ width: "66%" }} />
                <i style={{ width: "38%" }} />
              </div>
              <div className="a-scan" aria-hidden="true" />
            </div>
            <figcaption className="a-demo">Factura d’exemple. {DEMO_LABEL}.</figcaption>
          </figure>

          <div className="a-readouts">
            <div className="a-readout">
              <span>Consum</span>
              <b className="a-mono">{sampleBill.consumption} kWh</b>
            </div>
            <div className="a-readout">
              <span>Potència</span>
              <b className="a-mono">{sampleBill.power.toLocaleString("ca-ES")} kW</b>
            </div>
            <div className="a-readout">
              <span>Franges</span>
              <div className="a-bars" aria-label="Repartiment del consum per franges">
                {sampleBill.periods.map((p) => (
                  <div key={p.label}>
                    <i style={{ height: `${p.share * 160}%` }} />
                    <small className="a-mono">{p.label.split(" ")[0]}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="a-compare">
              <span>Comercialitzadores comparades</span>
              <div className="a-compare__ticks" aria-hidden="true">
                {Array.from({ length: 30 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
                <path
                  className="a-compare__trace"
                  pathLength={1}
                  d="M0 18 C 30 14, 45 40, 70 34 S 120 12, 150 30 S 210 50, 240 44 S 280 48, 300 52"
                />
              </svg>
            </div>
            <div className="a-estimate">
              <span>Estalvi estimat</span>
              <b>
                <span className="a-mono">
                  {demoEstimate.min}–{demoEstimate.max}
                </span>{" "}
                {demoEstimate.unit}
              </b>
              <small className="a-demo">Xifra de mostra · no és una oferta</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Evidence() {
  return (
    <section className="a-evidence" aria-labelledby="a-evidence-title">
      <h2 id="a-evidence-title" className="a-h2 a-evidence__title">
        Mesurat en factures reals
      </h2>
      <p className="a-demo a-evidence__note">{EVIDENCE_NOTE}</p>
      <dl className="a-log">
        {evidence.map((e) => (
          <div key={e.label} className="a-log__row">
            <dt>{e.label}</dt>
            <dd>
              <Counter value={e.value} prefix={e.prefix} suffix={e.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Channels() {
  const [active, setActive] = useState<ServiceId>("llum");
  const pathRef = useRef<SVGPathElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const wave = useRef<Wave>({ ...signatures.llum });
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const root = useRef<HTMLElement>(null);

  // Continuous drift while visible; morph between signatures on channel change.
  useGSAP(
    () => {
      let phase = 0;
      let visible = false;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const draw = () => {
        const d = wavePath(wave.current, phase);
        pathRef.current?.setAttribute("d", d);
        ghostRef.current?.setAttribute("d", d);
      };
      draw();
      if (reduce) return;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      if (root.current) io.observe(root.current);
      const tick = (_t: number, dt: number) => {
        if (!visible || isMotionPaused()) return;
        phase += (dt / 1000) * 1.6 * wave.current.drift;
        draw();
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
      };
    },
    { scope: root },
  );

  const select = useCallback((id: ServiceId) => {
    setActive(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(wave.current, { ...signatures[id], duration: reduce ? 0 : 0.6, ease: "expo.out", overwrite: true });
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = services.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    select(services[next].id);
    tabs.current[next]?.focus();
  };

  const svc = services.find((s) => s.id === active)!;
  const idx = services.findIndex((s) => s.id === active);

  return (
    <section ref={root} id="serveis" className="a-channels-sec" aria-labelledby="a-serveis-title">
      <div className="a-channels-sec__head">
        <h2 id="a-serveis-title" className="a-h2">
          Cinc subministraments, un sol assessor
        </h2>
        <p className="a-muted">
          Cada servei té el seu propi senyal. Tria’n un per veure què revisem i com t’ajudem a pagar menys.
        </p>
      </div>
      <div className="a-scope">
        <div role="tablist" aria-label="Serveis" aria-orientation="vertical" className="a-scope__tabs">
          {services.map((s, i) => (
            <button
              key={s.id}
              id={`canal-${s.id}`}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              type="button"
              aria-selected={s.id === active}
              aria-controls="a-scope-panel"
              tabIndex={s.id === active ? 0 : -1}
              onClick={() => select(s.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="a-mono">CH{i + 1}</span>
              {s.name}
            </button>
          ))}
        </div>
        <div className="a-scope__screen">
          <div className="a-graticule a-graticule--screen" aria-hidden="true" />
          <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" className="a-scope__wave">
            <path ref={ghostRef} className="a-scope__ghost" />
            <path ref={pathRef} className="a-scope__trace" />
          </svg>
          <div className="a-scope__meta a-mono" aria-hidden="true">
            <span>CH{idx + 1}</span>
            <span>{svc.name}</span>
            <span>Disparat</span>
          </div>
        </div>
        <div id="a-scope-panel" role="tabpanel" aria-labelledby={`canal-${svc.id}`} className="a-scope__panel" key={svc.id}>
          <h3>{svc.name}</h3>
          <p>{svc.lead}</p>
          <ul>
            {svc.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <a href="#contacte" className="a-btn a-btn--ghost">
            Demana un estudi de {svc.name.toLowerCase()}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Process() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".a-process__line",
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: ".a-process__track", start: "top 75%", end: "bottom 55%", scrub: 0.5 },
          },
        );
        gsap.utils.toArray<HTMLElement>(".a-step").forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 62%",
            onEnter: () => el.setAttribute("data-on", ""),
            onLeaveBack: () => el.removeAttribute("data-on"),
          });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.current?.querySelectorAll(".a-step").forEach((el) => el.setAttribute("data-on", ""));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="com-funciona" className="a-process" aria-labelledby="a-process-title">
      <h2 id="a-process-title" className="a-h2">
        De la factura a l’estalvi, en tres passos
      </h2>
      <div className="a-process__track">
        <svg className="a-process__svg" viewBox="0 0 10 300" preserveAspectRatio="none" aria-hidden="true">
          <path className="a-process__line" pathLength={1} d="M5 0 V300" />
        </svg>
        <ol>
          {steps.map((s, i) => (
            <li key={s.title} className="a-step">
              <span className="a-step__n a-mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Voices() {
  return (
    <section className="a-voices" aria-labelledby="a-voices-title">
      <h2 id="a-voices-title" className="a-h2">
        Clients que ja estalvien
      </h2>
      <p className="a-pending">{EVIDENCE_NOTE}</p>
      <ul className="a-voices__list">
        {testimonials.map((t) => (
          <li key={t.name}>
            <figure>
              <blockquote>
                <p>“{t.quote}”</p>
              </blockquote>
              <figcaption>
                <span>
                  {t.name}, {t.city}
                </span>
                <b className="a-mono">−{t.saving}</b>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Offices() {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <section id="oficines" className="a-offices" aria-labelledby="a-offices-title">
      <div className="a-offices__head">
        <h2 id="a-offices-title" className="a-h2">
          Persones de veritat, a prop teu
        </h2>
        <p className="a-muted">Quatre oficines a Catalunya. La IA llegeix la factura; el teu assessor t’acompanya en el canvi.</p>
      </div>
      <div className="a-offices__grid">
        <div className="a-plot" aria-hidden="true">
          <div className="a-graticule a-graticule--screen" />
          {offices.map((o) => (
            <span
              key={o.name}
              className="a-plot__pt"
              data-on={hover === o.name || undefined}
              style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%` }}
            >
              <i />
              <em>{o.city}</em>
            </span>
          ))}
        </div>
        <ul className="a-offices__list">
          {offices.map((o) => (
            <li key={o.name} onPointerEnter={() => setHover(o.name)} onPointerLeave={() => setHover(null)}>
              <h3>{o.name}</h3>
              <p>
                {o.street}
                <br />
                {o.zip}
              </p>
              <a href={`tel:${o.tel}`} className="a-mono" onFocus={() => setHover(o.name)} onBlur={() => setHover(null)}>
                {o.phone}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Faq() {
  return (
    <section className="a-faq" aria-labelledby="a-faq-title">
      <h2 id="a-faq-title" className="a-h2">
        Preguntes freqüents
      </h2>
      <div className="a-faq__list">
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <span aria-hidden="true" className="a-faq__icon" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Close() {
  return (
    <section id="contacte" className="a-close" aria-labelledby="a-close-title">
      <div className="a-graticule a-graticule--faint" aria-hidden="true" />
      <div className="a-close__copy">
        <p className="a-close__tag">{brand.tagline}</p>
        <h2 id="a-close-title" className="a-close__title">
          Envia’ns la factura. La resta la fem nosaltres.
        </h2>
        <p className="a-muted">
          Estudi gratuït, sense compromís. Et responem en menys de 24 hores per correu, telèfon o WhatsApp.
        </p>
        <div className="a-close__links">
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <a href={brand.whatsapp.href}>WhatsApp {brand.whatsapp.label}</a>
        </div>
      </div>
      <AnalyzerA />
    </section>
  );
}

function Footer() {
  return (
    <footer className="a-footer">
      <span translate="no">© 2026 Assessoria 3.0</span>
      <nav aria-label="Legal">
        <a href="#">Privacitat</a>
        <a href="#">Avís legal</a>
        <a href="#">Galetes</a>
      </nav>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

const isPaletteId = (v: string | null): v is PaletteId => !!v && palettes.some((p) => p.id === v);

// The URL (?paleta=a2) is the source of truth, so a palette can be shared as a link.
const PALETTE_EVENT = "a-palettechange";
const subscribePalette = (cb: () => void) => {
  window.addEventListener(PALETTE_EVENT, cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener(PALETTE_EVENT, cb);
    window.removeEventListener("popstate", cb);
  };
};
const readPalette = (): PaletteId => {
  const v = new URLSearchParams(window.location.search).get("paleta");
  return isPaletteId(v) ? v : "original";
};

export function ConceptA() {
  const paletteId = useSyncExternalStore(subscribePalette, readPalette, () => "original" as PaletteId);
  const [repaint, setRepaint] = useState(false);
  const palette = paletteById[paletteId];
  const repaintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fonts change line metrics: refresh trigger positions once they settle.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // The document behind the page (overscroll, scrollbar, browser chrome) follows the palette.
  useEffect(() => {
    const root = document.documentElement;
    const bg = palette.tokens.bg;
    root.style.background = bg;
    root.style.colorScheme = palette.scheme;
    root.style.setProperty("scrollbar-color", `${palette.tokens["line-solid"]} ${bg}`);
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = bg;
  }, [palette]);

  useEffect(
    () => () => {
      const root = document.documentElement;
      root.style.removeProperty("background");
      root.style.removeProperty("color-scheme");
      root.style.removeProperty("scrollbar-color");
      if (repaintTimer.current) clearTimeout(repaintTimer.current);
    },
    [],
  );

  const choosePalette = useCallback((id: PaletteId) => {
    setRepaint(true);
    if (repaintTimer.current) clearTimeout(repaintTimer.current);
    repaintTimer.current = setTimeout(() => setRepaint(false), 520);
    const url = new URL(window.location.href);
    if (id === "original") url.searchParams.delete("paleta");
    else url.searchParams.set("paleta", id);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(PALETTE_EVENT));
  }, []);

  const style = Object.fromEntries(
    Object.entries(palette.tokens).map(([k, v]) => [`--${k}`, v]),
  ) as React.CSSProperties;

  return (
    <div className="ca" data-palette={palette.id} data-scheme={palette.scheme} data-repaint={repaint || undefined} style={style}>
      <a className="skip-link" href="#main-a">
        Vés al contingut
      </a>
      <SmoothScroll />
      <Header />
      <main id="main-a">
        <Hero palette={palette} />
        <BillReader />
        <Evidence />
        <Channels />
        <Process />
        <Voices />
        <Offices />
        <Faq />
        <Close />
      </main>
      <Footer />
      <PaletteSwitcher value={paletteId} onChange={choosePalette} />
    </div>
  );
}
