"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "../i18n/ca";
import { serviceCatalog, type ServiceKey } from "../data/company";
import { ServiceVisual } from "../visuals/ServiceVisual";
import { track } from "../lead/tracking";

type Active = Exclude<ServiceKey, "autoconsum">;

export function Services({ t }: { t: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const keys = serviceCatalog.filter((s) => s.active).map((s) => s.key as Active);
  const [active, setActive] = useState<Active>(keys[0]);

  // Desktop: the row crossing the middle of the viewport becomes active.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".s-svc__row");
        rows.forEach((row) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (s) => s.isActive && setActive(row.dataset.key as Active),
          }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="serveis" className="s-svc" aria-labelledby="s-svc-title">
      <div className="s-wrap s-svc__head">
        <h2 id="s-svc-title" className="s-h2">
          {t.services.title}
        </h2>
        <p className="s-lede">{t.services.lede}</p>
      </div>
      <div className="s-wrap s-svc__grid">
        <ol className="s-svc__list">
          {keys.map((k, i) => {
            const s = t.services.items[k];
            const on = active === k;
            return (
              <li key={k} className="s-svc__row" data-key={k} data-on={on || undefined} onPointerEnter={() => setActive(k)}>
                <div className="s-svc__title">
                  <span className="s-measure s-svc__n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.name}</h3>
                </div>
                <div className="s-svc__body">
                  <p>{s.short}</p>
                  <ul>
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <a
                    href="#contacte"
                    className="s-link"
                    onFocus={() => setActive(k)}
                    onClick={() => track("service_cta", { service: k })}
                  >
                    {t.services.cta}: {s.name.toLowerCase()}
                  </a>
                </div>
                <ServiceVisual id={k} className="s-svc__mini" active={on} />
              </li>
            );
          })}
        </ol>
        <div className="s-svc__stage" aria-hidden="true">
          <div className="s-svc__frame">
            <div className="s-grat s-grat--panel" />
            {keys.map((k) => (
              <div key={k} className="s-svc__visual" data-on={active === k || undefined}>
                <ServiceVisual id={k} active={active === k} />
              </div>
            ))}
            <p className="s-svc__caption">{t.services.items[active].name}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
