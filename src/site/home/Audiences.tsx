"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import { track } from "../lead/tracking";

type Who = "home" | "business";

/**
 * Instrument language, not clip-art: a household reads as one 24h load curve (evening peak);
 * a business as several supply points stacked over the P1–P3 bands of the working day.
 */
const HOME = [0.3, 0.25, 0.22, 0.2, 0.2, 0.25, 0.45, 0.7, 0.6, 0.4, 0.35, 0.38, 0.5, 0.55, 0.45, 0.4, 0.45, 0.6, 0.8, 0.95, 1, 0.85, 0.6, 0.4];
const SITES = [
  [0.15, 0.12, 0.12, 0.12, 0.12, 0.15, 0.3, 0.6, 0.85, 0.95, 1, 0.98, 0.9, 0.92, 0.97, 0.95, 0.85, 0.6, 0.35, 0.25, 0.2, 0.18, 0.16, 0.15],
  [0.1, 0.1, 0.1, 0.1, 0.1, 0.12, 0.2, 0.45, 0.7, 0.75, 0.8, 0.78, 0.6, 0.62, 0.74, 0.72, 0.66, 0.4, 0.22, 0.16, 0.12, 0.1, 0.1, 0.1],
  [0.05, 0.05, 0.05, 0.05, 0.05, 0.06, 0.12, 0.3, 0.46, 0.5, 0.52, 0.5, 0.44, 0.46, 0.5, 0.48, 0.42, 0.26, 0.14, 0.1, 0.08, 0.06, 0.05, 0.05],
];
const W = 360;
const H = 200;
const path = (v: number[]) =>
  v.map((y, i) => `${i ? "L" : "M"}${((i / 23) * W).toFixed(1)} ${(H - 18 - y * (H - 44)).toFixed(1)}`).join("");

function Diagram({ who }: { who: Who }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="s-aud__svg" aria-hidden="true">
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={(i / 12) * W} x2={(i / 12) * W} y1="0" y2={H - 18} className="s-aud__grid" />
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={`h${f}`} x1="0" x2={W} y1={f * (H - 18)} y2={f * (H - 18)} className="s-aud__grid" />
      ))}
      {who === "business" ? (
        <>
          <rect x={(8 / 23) * W} width={(6 / 23) * W} y="0" height={H - 18} className="s-aud__band" />
          <rect x={(18 / 23) * W} width={(4 / 23) * W} y="0" height={H - 18} className="s-aud__band" />
          {SITES.map((v, i) => (
            <path key={i} d={path(v)} className={i === 0 ? "s-aud__lead" : "s-aud__sky"} />
          ))}
        </>
      ) : (
        <path d={path(HOME)} className="s-aud__lead" />
      )}
      {["0 h", "6 h", "12 h", "18 h", "24 h"].map((l, i) => (
        <text key={l} x={(i / 4) * (W - 22) + 2} y={H - 2} className="s-aud__axis">
          {l}
        </text>
      ))}
    </svg>
  );
}

export function Audiences({ t }: { t: Dictionary }) {
  const [who, setWho] = useState<Who>("home");
  // Keyboard-initiated switches are instant (no slide, no content transition).
  const [instant, setInstant] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const a = t.audiences;
  const order: Who[] = ["home", "business"];

  // The underline follows the active label: measured, then moved with transform only.
  useLayoutEffect(() => {
    const place = () => {
      const el = tabs.current[order.indexOf(who)];
      if (!el || !bar.current) return;
      bar.current.style.setProperty("--ix", `${el.offsetLeft}px`);
      bar.current.style.setProperty("--iw", `${el.offsetWidth}`);
    };
    place();
    const ro = new ResizeObserver(place);
    if (bar.current) ro.observe(bar.current);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who]);

  const select = (k: Who, viaKeyboard: boolean) => {
    if (k === who) return;
    setInstant(viaKeyboard);
    setWho(k);
    track("audience_switch", { who: k });
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const n = e.key === "Home" ? 0 : e.key === "End" ? 1 : (i + 1) % 2;
    select(order[n], true);
    tabs.current[n]?.focus();
  };

  return (
    <section id="particulars-empreses" className="s-aud" aria-labelledby="s-aud-title">
      <div className="s-wrap">
        <div className="s-aud__head">
          <h2 id="s-aud-title" className="s-h2">
            {a.title}
          </h2>
          <div ref={bar} role="tablist" aria-label={a.switchLabel} className="g-tabs" data-instant={instant || undefined}>
            {order.map((k, i) => (
              <button
                key={k}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`s-aud-t-${k}`}
                aria-selected={who === k}
                aria-controls={`s-aud-p-${k}`}
                tabIndex={who === k ? 0 : -1}
                onClick={(e) => select(k, e.detail === 0)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {k === "home" ? a.home.tab : a.business.tab}
              </button>
            ))}
            <span className="g-tabs__ink" aria-hidden="true" />
          </div>
        </div>
        {/* Both panels share one grid cell: the section keeps the height of the taller one, so switching never jumps. */}
        <div className="g-aud__stack" data-instant={instant || undefined}>
          {order.map((k) => {
            const data = k === "home" ? a.home : a.business;
            const on = who === k;
            return (
              <div
                key={k}
                id={`s-aud-p-${k}`}
                role="tabpanel"
                aria-labelledby={`s-aud-t-${k}`}
                className="s-aud__panel"
                data-on={on || undefined}
                inert={!on}
                aria-hidden={!on || undefined}
              >
                <div className="s-aud__lead">
                  <h3>{data.title}</h3>
                  <p>{data.lede}</p>
                  <Diagram who={k} />
                  <a href="#contacte" className="s-btn s-btn--primary" onClick={() => track("audience_cta", { who: k })}>
                    {data.cta}
                  </a>
                </div>
                <ul className="s-aud__list">
                  {data.items.map((it, n) => (
                    <li key={it.t} style={{ "--n": n } as React.CSSProperties}>
                      <h4>{it.t}</h4>
                      <p>{it.d}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
