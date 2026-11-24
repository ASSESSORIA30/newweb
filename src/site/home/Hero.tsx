"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { MotionToggle } from "@/components/MotionToggle";
import type { Dictionary } from "../i18n/ca";
import { EnergyField } from "../visuals/EnergyField";

export function Hero({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Lead: the headline rises line by line out of its mask. Support follows; nothing else moves.
        const split = SplitText.create(".s-hero__title", { type: "lines", mask: "lines" });
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(split.lines, { yPercent: 108, duration: 1.15, stagger: 0.12 }, 0.1)
          .from(".s-hero__sub", { opacity: 0, y: 12, duration: 0.9 }, 0.5)
          .from(".s-hero__actions > *", { opacity: 0, y: 10, duration: 0.8, stagger: 0.07 }, 0.62)
          .from(".s-hero__meta", { opacity: 0, duration: 0.8 }, 0.9);
        // Exit: copy lifts and fades as the field dollies in.
        gsap.to(".s-hero__copy", {
          yPercent: -14,
          opacity: 0.15,
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
    <section ref={root} className="s-hero" aria-labelledby="s-hero-title">
      <EnergyField className="s-hero__field" />
      <div className="s-grat" aria-hidden="true" />
      <div className="s-wrap s-hero__inner">
        <div className="s-hero__copy">
          <h1 id="s-hero-title" className="s-hero__title">
            {t.hero.title}
          </h1>
          <p className="s-hero__sub">{t.hero.subtitle}</p>
          <div className="s-hero__actions">
            <a href="#savenergy" className="s-btn s-btn--primary">
              {t.hero.primary}
            </a>
            <a href="#serveis" className="s-btn s-btn--secondary">
              {t.hero.secondary}
            </a>
          </div>
        </div>
        <div className="s-hero__meta">
          <p>{t.hero.offices}</p>
          <MotionToggle className="s-motion" labels={{ pause: t.common.pauseMotion, resume: t.common.resumeMotion }} />
        </div>
      </div>
    </section>
  );
}
