"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Chapter transition: the incoming chapter opens like an aperture (rounded inset mask → full
 * bleed) as it scrolls in, so the page reads as one continuous shot rather than stacked blocks.
 */
export function SigReveal({ children, tone }: { children: React.ReactNode; tone: "light" | "night" }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { clipPath: "inset(6% 5% 0% 5% round 48px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 15%", scrub: true },
          },
        );
        // No transform on this wrapper: it would break the pinned (position: fixed) chapters inside.
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="g-reveal" data-tone-wrap={tone} data-tone={tone === "night" ? "navy" : undefined}>
      {children}
    </div>
  );
}
