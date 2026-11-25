"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/site/i18n/ca";
import { serviceCatalog, type ServiceKey } from "@/site/data/company";
import { track } from "@/site/lead/tracking";
import { ParticleMorph } from "../visuals/ParticleMorph";

type Active = Exclude<ServiceKey, "autoconsum">;

export function SigServices({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const [value] = useState(() => ({ current: 0 }));
  const keys = serviceCatalog.filter((s) => s.active).map((s) => s.key as Active);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: ".g-svc__track",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // Hold each form for a while, then morph: plateaus at 0,1,2,3,4.
          const raw = self.progress * (keys.length - 1);
          const base = Math.floor(raw);
          const f = raw - base;
          const shaped = base + gsap.utils.clamp(0, 1, (f - 0.35) / 0.45);
          gsap.to(value, { current: shaped, duration: 0.6, ease: "power3.out", overwrite: true });
          setActive(Math.min(keys.length - 1, Math.round(shaped)));
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const jump = (i: number) => {
    const track = root.current?.querySelector<HTMLElement>(".g-svc__track");
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const len = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (len * i) / (keys.length - 1) + 2, behavior: "smooth" });
  };

  const k = keys[active];
  const s = t.services.items[k];

  return (
    <section ref={root} id="serveis" className="g-svc" data-tone="navy" aria-labelledby="g-svc-title">
      <div className="s-wrap g-svc__head">
        <h2 id="g-svc-title" className="g-display g-display--light">
          {t.services.title}
        </h2>
        <p className="g-lede g-lede--light">{t.services.lede}</p>
      </div>
      <div className="g-svc__track">
        <div className="g-svc__stage">
          <ParticleMorph className="g-svc__canvas" value={value} />
          <div className="g-svc__copy">
            <ul className="g-svc__names" aria-label={t.services.title}>
              {keys.map((key, i) => (
                <li key={key} data-on={i === active || undefined}>
                  <button type="button" onClick={() => jump(i)} aria-current={i === active ? "true" : undefined}>
                    {t.services.items[key].name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="g-svc__detail" key={k} aria-live="polite">
              <p className="g-svc__short">{s.short}</p>
              <ul className="g-svc__points">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <a href="#contacte" className="g-btn g-btn--light" onClick={() => track("service_cta", { service: k })}>
                {t.services.cta}
              </a>
            </div>
          </div>
          <p className="g-svc__note" aria-hidden="true">
            {t.sig.servicesKicker}
          </p>
        </div>
      </div>
    </section>
  );
}
