"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { formatNumber } from "@/lib/content";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
};

/**
 * Counts up once when scrolled into view. The final value is always in the DOM
 * (SSR + screen readers + reduced motion); only the visible digits animate.
 */
export function Counter({ value, prefix = "", suffix = "", className, duration = 1.6 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${formatNumber(value)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { n: 0 };
        el.textContent = `${prefix}0${suffix}`;
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              n: value,
              duration,
              ease: "expo.out",
              onUpdate: () => {
                el.textContent = `${prefix}${formatNumber(Math.round(obj.n))}${suffix}`;
              },
            }),
        });
        return () => {
          st.kill();
          el.textContent = final;
        };
      });
      return () => mm.revert();
    },
    { dependencies: [value] },
  );

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden="true" ref={ref}>
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
