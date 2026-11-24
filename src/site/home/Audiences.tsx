"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import { track } from "../lead/tracking";

type Who = "home" | "business";

/** Home: one meter. Business: many supply points read together. The drawing says the difference. */
function Diagram({ who }: { who: Who }) {
  if (who === "home") {
    return (
      <svg viewBox="0 0 320 200" className="s-aud__svg" aria-hidden="true">
        <path d="M60 120 L160 50 L260 120 V180 H60 Z" className="s-aud__house" />
        <circle cx="160" cy="135" r="26" className="s-aud__meter" />
        <path d="M160 135 L176 122" className="s-aud__needle" />
        <path d="M20 180 H300" className="s-aud__ground" />
      </svg>
    );
  }
  const pts = [
    [50, 70], [120, 40], [200, 60], [270, 45], [80, 150], [160, 130], [240, 155],
  ];
  return (
    <svg viewBox="0 0 320 200" className="s-aud__svg" aria-hidden="true">
      {pts.map(([x, y], i) => (
        <path key={`l${i}`} d={`M${x} ${y} L160 100`} className="s-aud__link" />
      ))}
      {pts.map(([x, y], i) => (
        <rect key={`r${i}`} x={x - 9} y={y - 9} width="18" height="18" rx="4" className="s-aud__site" />
      ))}
      <circle cx="160" cy="100" r="16" className="s-aud__hub" />
    </svg>
  );
}

export function Audiences({ t }: { t: Dictionary }) {
  const [who, setWho] = useState<Who>("home");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = t.audiences;
  const data = who === "home" ? a.home : a.business;
  const order: Who[] = ["home", "business"];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
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
          <div role="tablist" aria-label={a.switchLabel} className="s-seg s-seg--two" data-pos={order.indexOf(who)}>
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
                onClick={() => setWho(k)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {k === "home" ? a.home.tab : a.business.tab}
              </button>
            ))}
            <span className="s-seg__thumb" aria-hidden="true" />
          </div>
        </div>
        <div id="s-aud-panel" role="tabpanel" aria-labelledby={`s-aud-t-${who}`} className="s-aud__panel" data-who={who} key={who}>
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
