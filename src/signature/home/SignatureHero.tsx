"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MotionToggle } from "@/components/MotionToggle";
import type { Dictionary } from "@/site/i18n/ca";
import { RingScene } from "../visuals/RingScene";
import { openSavEnergy } from "./savenergyBus";

export function SignatureHero({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  // Scroll: copy dissolves (blur + lift) as the camera dives into the ring; the light of the
  // next chapter opens from the ring's centre and floods the frame.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
        });
        tl.to(".g-hero__copy", { yPercent: -18, opacity: 0, filter: "blur(10px)", duration: 0.35 }, 0)
          .to(".g-hero__dock", { y: 40, opacity: 0, duration: 0.2 }, 0)
          // The aperture opens from the ring's centre with a crisp edge; the next title is already in it.
          .fromTo(".g-hero__light", { "--r": "0vmax" }, { "--r": "150vmax", duration: 0.42, ease: "power2.in" }, 0.56)
          .fromTo(".g-hero__next", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }, 0.8);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="g-hero" data-fly data-tone="navy" data-ready={ready || undefined} aria-labelledby="g-hero-title">
      <div className="g-hero__stage">
        <div className="g-hero__poster" aria-hidden="true" />
        <RingScene className="g-hero__scene" onReady={() => setReady(true)} />
        <div className="g-hero__light" aria-hidden="true">
          <div className="g-hero__next">
            <p className="g-display">{t.sig.savTitle}</p>
            <p className="g-lede">{t.savenergy.lede}</p>
          </div>
        </div>
        <div className="g-hero__copy">
          <h1 id="g-hero-title" className="g-hero__title">
            <span className="g-hero__a">
              <span className="g-in">{t.hero.title}</span>
            </span>{" "}
            <span className="g-hero__b">
              <span className="g-in">{t.hero.titleB}</span>
            </span>
          </h1>
          <div className="g-hero__aside">
            <p className="g-hero__sub">{t.hero.subtitle}</p>
            <div className="g-hero__actions">
              <a href="#savenergy" className="g-btn g-btn--light" onClick={() => openSavEnergy("upload")}>
                {t.hero.primary}
              </a>
              <a href="#serveis" className="g-btn g-btn--glass">
                {t.hero.secondary}
              </a>
            </div>
          </div>
        </div>
        <nav className="g-hero__dock" aria-label="SavEnergy IA">
          <span className="g-hero__dock-name" translate="no">
            SavEnergy IA
          </span>
          {(["upload", "estimate", "advisor"] as const).map((m) => (
            <a key={m} href="#savenergy-console" onClick={() => openSavEnergy(m)}>
              {t.savenergy.modes[m]}
            </a>
          ))}
          <MotionToggle className="g-hero__motion" labels={{ pause: t.common.pauseMotion, resume: t.common.resumeMotion }} />
        </nav>
      </div>
    </section>
  );
}
