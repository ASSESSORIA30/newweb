"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/site/i18n/ca";
import type { Locale } from "@/site/i18n/config";
import { SavConsole } from "@/site/home/SavEnergy";

/** Layout offset of `el` inside `root` (ignores transforms, so it is stable while the bill rotates). */
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

const OFFERS = [0.92, 0.84, 0.97, 0.76, 0.88, 0.69, 0.81, 0.73, 0.95, 0.64, 0.86, 0.78, 0.71, 0.9];
const BEST = 9; // the shortest bar: the best fit (illustrative, no figures)

/**
 * SavEnergy IA as one continuous shot: a physical bill is presented, scanned, its data lifts off,
 * turns into charts, and the charts resolve into an anonymous comparison. Pinned + scrubbed ≥1024px;
 * a calm static sequence on phones and under reduced motion.
 */
export function SigSavEnergy({ t, locale }: { t: Dictionary; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const s = t.savenergy.scan;
  const g = t.sig;

  useGSAP(
    () => {
      const el = root.current!;
      const stage = el.querySelector<HTMLElement>(".g-sav__stage")!;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const setPhase = (p: number) => el.setAttribute("data-phase", String(p));
        const rows = gsap.utils.toArray<HTMLElement>(".g-bill__row", el);
        const data = gsap.utils.toArray<HTMLElement>(".g-datum", el);
        const slots = gsap.utils.toArray<HTMLElement>(".g-slot", el);

        // Each datum starts exactly on its row and flies to its chart slot.
        const from = (i: number) => offsetIn(rows[i], stage);
        const to = (i: number) => offsetIn(slots[Math.min(i, slots.length - 1)], stage);

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
              setPhase(p < 0.16 ? 0 : p < 0.42 ? 1 : p < 0.6 ? 2 : p < 0.78 ? 3 : 4);
            },
          },
        });

        // Hidden until their act: charts, chart fills, comparison.
        tl.set(".g-chart", { opacity: 0, y: 14 }, 0)
          .set([".g-gauge__fill", ".g-gauge__peak", ".g-energy__bar"], { scaleX: 0 }, 0)
          .set(".g-periods i", { scaleY: 0 }, 0)
          .set(".g-compare", { opacity: 0, y: 40 }, 0);
        // 1 · Present: the sheet arrives turning, then settles flat for reading.
        tl.fromTo(".g-bill", { rotateX: 32, rotateY: -36, rotateZ: 7, y: 160, scale: 0.86 }, { rotateX: 9, rotateY: -16, rotateZ: 2, y: 0, scale: 1, duration: 1.4, ease: "power2.out" }, 0)
          .fromTo(".g-bill__sheen", { xPercent: -120 }, { xPercent: 120, duration: 2.2 }, 0)
          .to(".g-bill", { rotateX: 0, rotateY: 0, rotateZ: 0, duration: 0.8, ease: "power2.inOut" }, 1.4)
          // 2 · Scan: the glass scanner sweeps, each concept lights as it is read.
          .fromTo(".g-scanner", { yPercent: -20, opacity: 0 }, { opacity: 1, duration: 0.2 }, 2.2)
          .fromTo(".g-scanner", { top: "0%" }, { top: "100%", duration: 2.4 }, 2.2)
          .to(".g-scanner", { opacity: 0, duration: 0.25 }, 4.5);
        rows.forEach((r, i) => tl.fromTo(r, { "--hl": 0 }, { "--hl": 1, duration: 0.25 }, 2.5 + i * 0.4));

        // 3 · Separate: the data lifts off the document and travels to the instrument column.
        data.forEach((d, i) => {
          tl.fromTo(
            d,
            { x: () => from(i).x, y: () => from(i).y, opacity: 0, scale: 1, rotateY: 0, z: 0 },
            { opacity: 1, z: 60, scale: 1.04, duration: 0.25, ease: "power2.out" },
            4.6 + i * 0.12,
          ).to(d, { x: () => to(i).x, y: () => to(i).y + i * 0, z: 0, scale: 1, duration: 0.9, ease: "power3.inOut" }, 4.95 + i * 0.12);
          tl.to(rows[i], { "--hl": 0.25, opacity: 0.45, duration: 0.4 }, 4.7 + i * 0.12);
        });
        tl.to(".g-bill", { rotateY: 18, x: -40, scale: 0.94, duration: 1, ease: "power2.inOut" }, 4.8);

        // 4 · Transform: data cards resolve into charts.
        tl.to(data, { opacity: 0, scale: 0.96, filter: "blur(4px)", duration: 0.4 }, 6.6)
          .fromTo(".g-chart", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.12, ease: "power2.out" }, 6.6)
          .fromTo(".g-gauge__fill", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 6.8)
          .fromTo(".g-gauge__peak", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 7.0)
          .fromTo(".g-energy__bar", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 6.9)
          .fromTo(".g-periods i", { scaleY: 0 }, { scaleY: 1, duration: 0.45, stagger: 0.1, ease: "power2.out" }, 7.0);

        // 5 · Compare: the bill recedes; the charts converge into an anonymous comparison.
        tl.to(".g-bill", { opacity: 0.18, x: -120, rotateY: 28, scale: 0.86, duration: 1, ease: "power2.inOut" }, 8)
          .to(".g-charts", { opacity: 0, y: -30, scale: 0.96, duration: 0.6, ease: "power2.in" }, 8)
          .fromTo(".g-compare", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 8.3)
          .fromTo(".g-compare__bar", { scaleY: 0 }, { scaleY: 1, duration: 0.7, stagger: 0.04, ease: "power2.out" }, 8.4)
          .fromTo(".g-compare__best", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 9.3)
          .to({}, { duration: 0.8 });
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
      <div className="s-wrap g-sav__head">
        <h2 id="g-sav-title" className="g-display">
          {g.savTitle}
        </h2>
        <p className="g-lede">{t.savenergy.lede}</p>
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
              </div>
              <span className="g-bill__sheen" aria-hidden="true" />
              <span className="g-scanner" aria-hidden="true">
                <i />
              </span>
            </div>
          </div>

          <div className="g-sav__out">
            <div className="g-charts">
              <div className="g-chart g-slot">
                <p>{g.chartPower}</p>
                <div className="g-gauge">
                  <i className="g-gauge__fill" />
                  <i className="g-gauge__peak" style={{ width: `${(3.1 / 4.6) * 100}%` }} />
                </div>
                <div className="g-chart__legend s-measure">
                  <span>{s.doc.peak} {s.doc.peakValue}</span>
                  <span>4,6 kW</span>
                </div>
              </div>
              <div className="g-chart g-slot">
                <p>{g.chartEnergy}</p>
                <div className="g-energy">
                  <i className="g-energy__bar" />
                </div>
                <div className="g-chart__legend s-measure">
                  <span>{s.doc.periodValue}</span>
                  <span>312 kWh</span>
                </div>
              </div>
              <div className="g-chart g-slot">
                <p>{g.chartPeriods}</p>
                <div className="g-periods">
                  {[34, 29, 37].map((v, i) => (
                    <i key={i} style={{ height: `${v * 2.2}%` }} data-peak={i === 0 || undefined}>
                      <span className="s-measure">P{i + 1}</span>
                    </i>
                  ))}
                </div>
              </div>
            </div>

            {/* Data cards: they lift off the bill rows and land on the chart slots. */}
            {s.concepts.slice(0, 3).map((c, i) => (
              <div key={c.k} className="g-datum" aria-hidden="true">
                <span>{c.label}</span>
                <b className="s-measure">{values[i]}</b>
              </div>
            ))}

            <div className="g-compare">
              <div className="g-compare__head">
                <p>{g.compareTitle}</p>
                <span className="s-sim">{t.common.simulation}</span>
              </div>
              <div className="g-compare__bars" aria-hidden="true">
                {OFFERS.map((h, i) => (
                  <i key={i} className="g-compare__bar" data-best={i === BEST || undefined} style={{ height: `${h * 100}%` }} />
                ))}
              </div>
              <p className="g-compare__best">{g.compareBest}</p>
              <p className="g-compare__note">{g.compareNote}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="s-wrap g-sav__console">
        <h3 className="g-sav__console-title">{g.consoleTitle}</h3>
        <SavConsole t={t} locale={locale} className="s-console g-console" />
      </div>
    </section>
  );
}
