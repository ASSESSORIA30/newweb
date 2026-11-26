"use client";

import { useEffect } from "react";

/**
 * Chapter heads below the fold widen into place (variable width axis 58% → 90%) as they enter.
 * Only elements not yet on screen are armed, so nothing visible ever flickers.
 */
export function Widen() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".sig .s-h2, .sig .g-svc .g-display, .sig .s-close__title")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -18% 0px" },
    );
    els.forEach((el) => {
      el.dataset.widen = "";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
