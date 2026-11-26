"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "../i18n/ca";

const R = 150;
const C = 2 * Math.PI * R;
const node = (i: number) => {
  const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
  return [200 + Math.cos(a) * R, 200 + Math.sin(a) * R];
};

export function Process({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const p = t.process;

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      const setStep = (i: number) => el.setAttribute("data-step", String(i));
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".s-proc__stage",
            start: "top top",
            end: "+=2400",
            pin: true,
            scrub: 0.6,
            onUpdate: (s) => setStep(Math.min(4, Math.floor(s.progress * 5.2))),
          },
        });
        // The ring draws to each node in turn; the last segment closes the loop on step 1.
        tl.fromTo(".s-proc__arc", { strokeDashoffset: C }, { strokeDashoffset: 0, duration: 5 }, 0).fromTo(
          ".s-proc__runner",
          { rotate: 0 },
          { rotate: 360, duration: 5, svgOrigin: "200 200" },
          0,
        );
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        setStep(4);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="com-treballem" className="s-proc" data-step="0" aria-labelledby="s-proc-title">
      <div className="s-proc__stage">
        <div className="s-wrap s-proc__grid">
          <div className="s-proc__copy">
            <h2 id="s-proc-title" className="s-h2">
              {p.title}
            </h2>
            <p className="s-lede">{p.lede}</p>
            <ol className="s-proc__list">
              {p.steps.map((s, i) => (
                <li key={s.t} data-i={i}>
                  <span className="s-measure">{i + 1}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="s-proc__ring" aria-hidden="true">
            <svg viewBox="0 0 400 400">
              <circle cx="200" cy="200" r={R} className="s-proc__track" />
              <circle
                cx="200"
                cy="200"
                r={R}
                className="s-proc__arc"
                strokeDasharray={C}
                strokeDashoffset={0}
                transform="rotate(-90 200 200)"
              />
              <g className="s-proc__runner">
                <circle cx="200" cy={200 - R} r="7" className="s-proc__dot" />
              </g>
              {p.steps.map((s, i) => {
                const [x, y] = node(i);
                return (
                  <g key={s.t} className="s-proc__node" data-i={i}>
                    <circle cx={x} cy={y} r="20" />
                    <text x={x} y={y + 5} textAnchor="middle">
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="s-proc__center">
              {p.steps.map((s, i) => (
                <p key={s.t} data-i={i}>
                  {s.t}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
