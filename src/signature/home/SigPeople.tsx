"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/site/i18n/ca";
import { track } from "@/site/lead/tracking";

const SIZES = "(max-width: 900px) 100vw, 62vw";
const set = (ext: string) => [720, 1080, 1448].map((w) => `/signature/office/lleida-${w}.${ext} ${w}w`).join(", ");

/**
 * The human counterpoint: the Lleida office, large and editorial. On scroll the frame opens and the
 * photograph recovers its colour (a greyscale twin fades out: opacity only, no animated filter); once
 * in colour it stays in colour. Parallax is a few percent. Reduced motion: final state, no movement.
 * The photograph itself is untouched; the warm, slightly desaturated grade is CSS.
 */
export function SigPeople({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const p = t.people;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const frame = root.current!.querySelector<HTMLElement>(".g-people__frame")!;
        const mono = root.current!.querySelector<HTMLElement>(".g-people__mono")!;
        const reveal = gsap.timeline({ paused: true });
        reveal
          .fromTo(frame, { clipPath: "inset(10% 8% 10% 8% round 40px 40px 40px 40px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px 0px 0px 28px)", ease: "none", duration: 1 }, 0)
          .fromTo(mono, { opacity: 1 }, { opacity: 0, ease: "none", duration: 1 }, 0)
          .fromTo(".g-people__copy > *", { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5, stagger: 0.08 }, 0.25);
        let done = false;
        const st = ScrollTrigger.create({
          trigger: frame,
          start: "top 92%",
          end: "center 55%",
          scrub: 0.6,
          onUpdate: (s) => {
            if (done) return;
            reveal.progress(s.progress);
            // Once it has reached full colour it stays there, whatever the scroll direction.
            if (s.progress > 0.995) {
              done = true;
              reveal.progress(1);
              st.disable(false);
            }
          },
        });
        gsap.fromTo(
          ".g-people__img",
          { yPercent: -4 },
          { yPercent: 4, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const picture = (cls: string, alt: string) => (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={SIZES} />
      <source type="image/webp" srcSet={set("webp")} sizes={SIZES} />
      <img className={cls} src="/signature/office/lleida-1080.webp" alt={alt} width={1448} height={1086} loading="lazy" decoding="async" />
    </picture>
  );

  return (
    <section ref={root} className="g-people" aria-labelledby="g-people-title">
      <div className="g-people__grid">
        <div className="g-people__copy">
          <p className="g-people__kicker">{p.kicker}</p>
          <h2 id="g-people-title" className="g-people__title">
            {p.title}
          </h2>
          <p className="g-people__text">{p.text}</p>
          <a href="#contacte" className="g-btn g-btn--brand" onClick={() => track("people_cta")}>
            {p.cta}
          </a>
        </div>
        <figure className="g-people__fig">
          <div className="g-people__frame">
            <div className="g-people__layer">{picture("g-people__img g-people__color", p.alt)}</div>
            <div className="g-people__layer g-people__mono" aria-hidden="true">
              {picture("g-people__img g-people__grey", "")}
            </div>
            <span className="g-people__tint" aria-hidden="true" />
          </div>
          <figcaption>
            <span className="g-people__place">{p.caption}</span>
            <span className="g-people__ai">{p.aiNote}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
