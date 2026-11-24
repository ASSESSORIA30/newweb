"use client";

import { useRef, useState } from "react";
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
  // Keyboard-initiated switches are instant (no slide, no panel entrance).
  const [instant, setInstant] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = t.audiences;
  const data = who === "home" ? a.home : a.business;
  const order: Who[] = ["home", "business"];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    setInstant(true);
    const n = (i + 1) % 2;
    setWho(order[n]);
    tabs.current[n]?.focus();
  };

  return (
    <section id="particulars-empreses" className="s-aud" aria-labelledby="s-aud-title">
      <div className="s-wrap">
        <div className="s-aud__head">
          <h2 id="s-aud-title" className="s-h2">
            {a.title}
          </h2>
          <div role="tablist" aria-label={a.switchLabel} className="s-seg s-seg--two" data-pos={order.indexOf(who)} data-instant={instant || undefined}>
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
                aria-controls="s-aud-panel"
                tabIndex={who === k ? 0 : -1}
                onClick={() => {
                  setInstant(false);
                  setWho(k);
                }}
                onKeyDown={(e) => onKey(e, i)}
              >
                {k === "home" ? a.home.tab : a.business.tab}
              </button>
            ))}
            <span className="s-seg__thumb" aria-hidden="true" />
          </div>
        </div>
        <div id="s-aud-panel" role="tabpanel" aria-labelledby={`s-aud-t-${who}`} className="s-aud__panel" data-who={who} data-instant={instant || undefined} key={who}>
          <div className="s-aud__lead">
            <h3>{data.title}</h3>
            <p>{data.lede}</p>
            <Diagram who={who} />
            <a href="#contacte" className="s-btn s-btn--primary" onClick={() => track("audience_cta", { who })}>
              {data.cta}
            </a>
          </div>
          <ul className="s-aud__list">
            {data.items.map((it) => (
              <li key={it.t}>
                <h4>{it.t}</h4>
                <p>{it.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
