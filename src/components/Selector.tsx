"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useRef, useState } from "react";
import { concepts } from "@/lib/concepts";

function Preview({ href, device, title }: { href: string; device: "desktop" | "mobile"; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const W = device === "desktop" ? 1440 : 390;
  const H = device === "desktop" ? 900 : 844;
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);
  return (
    <div ref={box} className="sel-preview" data-device={device} style={{ aspectRatio: `${W} / ${H}` }}>
      <iframe
        src={href}
        title={`Previsualització: ${title}`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function Selector() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  return (
    <>
      <div className="sel-toolbar">
        <div role="radiogroup" aria-label="Dispositiu de previsualització" className="sel-seg">
          {(["desktop", "mobile"] as const).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={device === d} onClick={() => setDevice(d)}>
              {d === "desktop" ? "Escriptori" : "Mòbil"}
            </button>
          ))}
        </div>
        <p>Les previsualitzacions són les pàgines reals en execució. Obre cada proposta per navegar-la a pantalla completa.</p>
      </div>
      <ol className="sel-grid" data-device={device}>
        {concepts.map((c) => (
          <li key={c.key} className="sel-card">
            <Preview key={device} href={c.href} device={device} title={c.name} />
            <div className="sel-card__body">
              <div className="sel-card__title">
                <ViewTransition name={`concept-key-${c.key}`} share="morph" default="none">
                  <span className="sel-key">{c.key}</span>
                </ViewTransition>
                <h2>
                  <Link href={c.href} transitionTypes={["nav-forward"]} className="sel-stretch">
                    {c.name}
                  </Link>
                </h2>
              </div>
              <p>{c.thesis}</p>
              <ul className="sel-swatches" aria-label="Paleta">
                {c.swatches.map((s) => (
                  <li key={s} style={{ background: s }} title={s} />
                ))}
              </ul>
              <span className="sel-open" aria-hidden="true">
                Obre la proposta
              </span>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
