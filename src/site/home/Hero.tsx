"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MotionToggle } from "@/components/MotionToggle";
import type { Dictionary } from "../i18n/ca";
import { EnergyField } from "../visuals/EnergyField";

export function Hero({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);

  // Entrance is pure CSS (site.css: .s-hero__in and siblings): it starts on first paint,
  // survives a busy main thread during hydration and never replays. GSAP only drives the scroll exit.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".s-hero__copy", {
          yPercent: -14,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
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
            <span className="s-hero__a">
              <span className="s-hero__in">{t.hero.title}</span>
            </span>{" "}
            <span className="s-hero__b">
              <span className="s-hero__in">{t.hero.titleB}</span>
            </span>
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
