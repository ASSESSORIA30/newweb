"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/site/i18n/ca";
import type { Locale } from "@/site/i18n/config";
import { SavConsole } from "@/site/home/SavEnergy";

/** Layout offset of `el` inside `root` (ignores transforms, so it is stable while the bill turns). */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

const OFFERS = [0.92, 0.84, 0.97, 0.76, 0.88, 0.69, 0.81, 0.73, 0.95, 0.62, 0.86, 0.78, 0.71, 0.9];
const BEST = 9; // shortest bar = best fit (illustrative, no figures)
const LETTERS = "ABCDEFGHIJKLMN";

/**
 * SavEnergy IA as one continuous shot: a physical bill turns into view, is scanned (each line
 * lifts in depth as it is read), its data travels on curves into chart marks, and the charts
 * resolve into an anonymised comparison. Pinned + scrubbed ≥1024px; a calm sequence elsewhere.
 */
export function SigSavEnergy({ t, locale }: { t: Dictionary; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const s = t.savenergy.scan;
  const g = t.sig;
  const { lede, ledeHighlight } = t.savenergy;
  const highlightAt = lede.indexOf(ledeHighlight);

  useGSAP(
    () => {
      const el = root.current!;
      const stage = el.querySelector<HTMLElement>(".g-sav__stage")!;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const setPhase = (p: number) => el.setAttribute("data-phase", String(p));
        const rows = gsap.utils.toArray<HTMLElement>(".g-bill__row", el);
        const data = gsap.utils.toArray<HTMLElement>(".g-datum", el);
        const marks = gsap.utils.toArray<HTMLElement>(".g-mark", el);
        const from = (i: number) => offsetIn(rows[i], stage);
        const to = (i: number) => offsetIn(marks[i], stage);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".g-sav__track",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              setPhase(p < 0.15 ? 0 : p < 0.42 ? 1 : p < 0.6 ? 2 : p < 0.76 ? 3 : 4);
            },
          },
        });
        tl.set(".g-chart", { opacity: 0, y: 16 }, 0)
          .set([".g-gauge__fill", ".g-gauge__peak", ".g-energy__bar"], { scaleX: 0 }, 0)
          .set(".g-periods i", { scaleY: 0 }, 0)
          .set(".g-compare", { autoAlpha: 0, y: 40 }, 0)
          .set(".g-compare__bar", { scaleY: 0 }, 0);

        // 1 · Present: the sheet turns into view (a real turn, not a tilt), then faces us.
        tl.fromTo(".g-bill", { rotateX: 38, rotateY: -62, rotateZ: 10, y: 180, scale: 0.82 }, { rotateX: 12, rotateY: -28, rotateZ: 3, y: 0, scale: 1, duration: 1.5, ease: "power2.out" }, 0)
          .fromTo(".g-bill__sheen", { xPercent: -140 }, { xPercent: 140, duration: 2.4 }, 0)
          .to(".g-bill", { rotateX: 4, rotateY: -8, rotateZ: 0, duration: 0.9, ease: "power2.inOut" }, 1.5)
          // 2 · Scan: the glass scanner sweeps; each line lifts off the page as it is read.
          .fromTo(".g-scanner", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 2.3)
          .fromTo(".g-scanner", { top: "0%" }, { top: "100%", duration: 2.4 }, 2.3)
          .to(".g-scanner", { opacity: 0, duration: 0.25 }, 4.6)
          .to(".g-bill", { rotateX: 0, rotateY: 0, duration: 0.8, ease: "power2.inOut" }, 2.4);
        rows.forEach((r, i) => {
          tl.fromTo(r, { "--hl": 0, z: 0 }, { "--hl": 1, z: 34, duration: 0.3, ease: "power2.out" }, 2.6 + i * 0.4);
        });

        // 3 · Separate: the three key lines leave the document on curved paths (x and y eased
        // differently) and land on the marks of the charts they will become.
        data.forEach((d, i) => {
          const at = 4.8 + i * 0.16;
          tl.fromTo(d, { x: () => from(i).x, y: () => from(i).y, autoAlpha: 0, scale: 1 }, { autoAlpha: 1, duration: 0.2 }, at)
            .to(d, { x: () => to(i).x, duration: 1.1, ease: "power2.inOut" }, at + 0.15)
            .to(d, { y: () => to(i).y, duration: 1.1, ease: "power3.out" }, at + 0.15)
            .to(rows[i], { "--hl": 0.2, z: 0, opacity: 0.4, duration: 0.4 }, at);
        });
        tl.to(".g-bill", { rotateY: 22, x: -50, scale: 0.92, duration: 1.1, ease: "power2.inOut" }, 4.9);

        // 4 · Transform: each card collapses into its mark while the chart grows out of it.
        tl.to(".g-chart", { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }, 6.3);
        data.forEach((d, i) => {
          tl.to(d, { scaleY: 0.12, scaleX: 0.6, autoAlpha: 0, duration: 0.45, ease: "power3.in" }, 6.5 + i * 0.12);
        });
        tl.to(".g-gauge__fill", { scaleX: 1, duration: 0.6, ease: "power2.out" }, 6.6)
          .to(".g-gauge__peak", { scaleX: 1, duration: 0.6, ease: "power2.out" }, 6.8)
          .to(".g-energy__bar", { scaleX: 1, duration: 0.6, ease: "power2.out" }, 6.7)
          .to(".g-periods i", { scaleY: 1, duration: 0.45, stagger: 0.1, ease: "power2.out" }, 6.8);

        // 5 · Compare: exits first (charts, bill), then the comparison takes the stage.
        tl.to(".g-charts", { opacity: 0, x: 40, duration: 0.45, ease: "power2.in" }, 7.9)
          .to(".g-bill", { opacity: 0.12, x: -160, rotateY: 34, scale: 0.84, duration: 0.8, ease: "power2.inOut" }, 7.9)
          .to(".g-compare", { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }, 8.45)
          .to(".g-compare__bar", { scaleY: 1, duration: 0.7, stagger: 0.035, ease: "power2.out" }, 8.6)
          .fromTo(".g-compare__best", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 9.4)
          .to({}, { duration: 0.9 });
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        el.setAttribute("data-phase", "4");
        el.setAttribute("data-static", "");
        return () => el.removeAttribute("data-static");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const values = [s.concepts[0].value, s.concepts[1].value, s.concepts[2].value];

  return (
    <section ref={root} id="savenergy" className="g-sav" data-phase="0" aria-labelledby="g-sav-title">
      {/* Same composition as the light that opens at the end of the hero: a match cut. */}
      <div className="g-sav__open">
        <h2 id="g-sav-title" className="g-display">
          {g.savTitle}
        </h2>
        <p className="g-lede">
          {highlightAt < 0 ? lede : (
            <>
              {lede.slice(0, highlightAt)}
              <strong className="g-sav__highlight">{ledeHighlight}</strong>
              {lede.slice(highlightAt + ledeHighlight.length)}
            </>
          )}
        </p>
      </div>

      <div className="g-sav__track">
        <div className="g-sav__stage">
          <ol className="g-sav__phases">
            {g.phases.map((p, i) => (
              <li key={p.t} data-i={i}>
                <span className="s-measure">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>

          <div className="g-sav__object">
            <div className="g-bill-shadow" aria-hidden="true" />
            <div className="g-bill" role="img" aria-label={s.billTag}>
              <span className="g-bill__layer" aria-hidden="true" />
              <div className="g-bill__face">
                <div className="g-bill__head">
                  <div>
                    <strong>{s.billTitle}</strong>
                    <span>{s.doc.issuer}</span>
                  </div>
                  <span className="g-bill__tag">{s.billTag}</span>
                </div>
                <dl className="g-bill__meta">
                  <div>
                    <dt>{s.doc.cups}</dt>
                    <dd className="s-measure">{s.doc.cupsValue}</dd>
                  </div>
                  <div>
                    <dt>{s.doc.period}</dt>
                    <dd className="s-measure">{s.doc.periodValue}</dd>
                  </div>
                </dl>
                <div className="g-bill__rows">
                  {s.concepts.map((c, i) => (
                    <div key={c.k} className="g-bill__row">
                      <span className="s-measure g-bill__n">{i + 1}</span>
                      <span>{c.label}</span>
                      <b className="s-measure">{c.value}</b>
                    </div>
                  ))}
                </div>
                <table className="g-bill__table">
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
                <span className="g-bill__sheen" aria-hidden="true" />
              </div>
              <span className="g-scanner" aria-hidden="true">
                <i />
              </span>
            </div>
          </div>

          <div className="g-sav__out">
            <div className="g-charts">
              <div className="g-chart">
                <p>{g.chartPower}</p>
                <div className="g-gauge g-mark">
                  <i className="g-gauge__fill" />
                  <i className="g-gauge__peak" style={{ width: `${(3.1 / 4.6) * 100}%` }} />
                </div>
                <div className="g-chart__legend s-measure">
                  <span>
                    {s.doc.peak} {s.doc.peakValue}
                  </span>
                  <span>4,6 kW</span>
                </div>
              </div>
              <div className="g-chart">
                <p>{g.chartEnergy}</p>
                <div className="g-energy g-mark">
                  <i className="g-energy__bar" />
                </div>
                <div className="g-chart__legend s-measure">
                  <span>{s.doc.periodValue}</span>
                  <span>312 kWh</span>
                </div>
              </div>
              <div className="g-chart">
                <p>{g.chartPeriods}</p>
                <div className="g-periods g-mark">
                  {[34, 29, 37].map((v, i) => (
                    <i key={i} style={{ height: `${v * 2.2}%` }} data-peak={i === 0 || undefined}>
                      <span className="s-measure">P{i + 1}</span>
                    </i>
                  ))}
                </div>
              </div>
            </div>
            {s.concepts.slice(0, 3).map((c, i) => (
              <div key={c.k} className="g-datum" aria-hidden="true">
                <span>{c.label}</span>
                <b className="s-measure">{values[i]}</b>
              </div>
            ))}
          </div>

          <div className="g-compare">
            <div className="g-compare__head">
              <p>{g.compareTitle}</p>
              <span className="s-sim">{t.common.simulation}</span>
            </div>
            <div className="g-compare__chart">
              <div className="g-compare__bars" aria-hidden="true">
                {OFFERS.map((h, i) => (
                  <div key={i} className="g-compare__col" data-best={i === BEST || undefined}>
                    <i className="g-compare__bar" style={{ height: `${h * 100}%` }} />
                    <span className="s-measure">{LETTERS[i]}</span>
                  </div>
                ))}
              </div>
              <p className="g-compare__axis">{g.compareAnon}</p>
            </div>
            <p className="g-compare__best">
              <span className="g-compare__dot" aria-hidden="true" /> {g.compareBest}
            </p>
            <p className="g-compare__note">{g.compareNote}</p>
          </div>
        </div>
      </div>

      <div className="s-wrap g-sav__console" id="savenergy-console" tabIndex={-1}>
        <h3 className="g-sav__console-title">{g.consoleTitle}</h3>
        <SavConsole t={t} locale={locale} className="s-console g-console" anchorId={null} />
      </div>
    </section>
  );
}
