"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/site/i18n/ca";

/**
 * The ring returns as the yearly cycle. Scroll turns it; inside it the five verbs replace one
 * another with a mask wipe and a width change on the variable axis. The last verb closes the loop.
 */
export function SigProcess({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const p = t.process;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".g-proc__ring",
          { rotate: -30 },
          { rotate: 330, ease: "none", scrollTrigger: { trigger: ".g-proc__track", start: "top top", end: "bottom bottom", scrub: 0.6 } },
        );
      });
      const st = ScrollTrigger.create({
        trigger: ".g-proc__track",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => setStep(Math.min(4, Math.floor(s.progress * 5))),
      });
      return () => {
        st.kill();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="com-treballem" className="g-proc" data-tone="navy" aria-labelledby="g-proc-title">
      <div className="g-proc__track">
        <div className="g-proc__stage">
          <div className="g-proc__copy">
            <h2 id="g-proc-title" className="g-display g-display--light g-proc__title">
              {p.title}
            </h2>
            <p className="g-lede g-lede--light">{p.lede}</p>
          </div>
          <div className="g-proc__orbit" aria-hidden="true">
            <img className="g-proc__ring" src="/signature/ring-light.webp" alt="" width={620} height={620} loading="lazy" />
            <div className="g-proc__verbs">
              {p.steps.map((s, i) => (
                <span key={s.t} data-on={i === step || undefined}>
                  {s.t}
                </span>
              ))}
            </div>
          </div>
          <ol className="g-proc__steps">
            {p.steps.map((s, i) => (
              <li key={s.t} data-on={i === step || undefined}>
                <span className="s-measure">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
