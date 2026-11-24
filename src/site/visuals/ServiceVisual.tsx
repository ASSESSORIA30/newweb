"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";
import type { ServiceKey } from "../data/company";

const W = 600;
const H = 440;

type Draw = (svg: SVGSVGElement, t: number) => void;

const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");

/** One authored visual per service, drawn from the same material: hairlines, one blue lead, sky support. */
const draws: Record<Exclude<ServiceKey, "autoconsum">, Draw> = {
  // Alternating current on a measured grid: the phase drifts, the envelope breathes.
  electricitat(svg, t) {
    const lead: [number, number][] = [];
    const ghost: [number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const x = (i / 160) * W;
      const ph = (i / 160) * Math.PI * 6;
      lead.push([x, H / 2 - Math.sin(ph + t * 1.6) * 110]);
      ghost.push([x, H / 2 - Math.sin(ph + t * 1.6 - 0.9) * 70]);
    }
    svg.querySelector('[data-p="a"]')!.setAttribute("d", line(lead));
    svg.querySelector('[data-p="b"]')!.setAttribute("d", line(ghost));
  },
  // Laminar flow: parallel streamlines, faster in the centre of the pipe.
  gas(svg, t) {
    svg.querySelectorAll<SVGPathElement>("[data-s]").forEach((p, k) => {
      const n = 9;
      const off = (k - (n - 1) / 2) / ((n - 1) / 2);
      const speed = 1 - off * off * 0.7;
      const pts: [number, number][] = [];
      for (let i = 0; i <= 80; i++) {
        const x = (i / 80) * W;
        pts.push([x, H / 2 + off * 150 + Math.sin(x / 70 - t * speed * 1.4 + k) * (16 * (1 - Math.abs(off)) + 3)]);
      }
      p.setAttribute("d", line(pts));
    });
  },
  // Packets travelling down a line: square pulses moving right.
  telecomunicacions(svg, t) {
    const pts: [number, number][] = [];
    const base = H / 2 + 40;
    for (let i = 0; i <= 300; i++) {
      const x = (i / 300) * W;
      const u = ((x / W) * 12 - t * 1.2) % 1;
      const on = ((u + 1) % 1) < 0.35 && Math.sin(x / 47 - t) > -0.2;
      pts.push([x, on ? base - 120 : base]);
    }
    svg.querySelector('[data-p="a"]')!.setAttribute("d", line(pts));
    svg.querySelectorAll<SVGCircleElement>("[data-dot]").forEach((c, k) => {
      const x = ((t * 90 + k * 140) % (W + 40)) - 20;
      c.setAttribute("cx", x.toFixed(1));
    });
  },
  // Radar sweep: a rotating sector over rings; a contact lights when crossed.
  alarmes(svg, t) {
    const a = (t * 0.9) % (Math.PI * 2);
    const cx = W / 2;
    const cy = H / 2;
    const r = 170;
    svg.querySelector('[data-p="a"]')!.setAttribute("d", `M${cx} ${cy} L${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`);
    const sweep = `M${cx} ${cy} L${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} A${r} ${r} 0 0 0 ${cx + Math.cos(a - 0.7) * r} ${cy + Math.sin(a - 0.7) * r} Z`;
    svg.querySelector('[data-p="b"]')!.setAttribute("d", sweep);
    const blipA = 5.3;
    const d = (a - blipA + Math.PI * 2) % (Math.PI * 2);
    svg.querySelector("[data-dot]")!.setAttribute("opacity", String(Math.max(0, 1 - d / 2.2)));
  },
  // Protective arcs: nested domes that breathe slightly out of phase.
  assegurances(svg, t) {
    svg.querySelectorAll<SVGPathElement>("[data-s]").forEach((p, k) => {
      const r = 60 + k * 34 + Math.sin(t * 1.1 - k * 0.5) * 4;
      const cx = W / 2;
      const cy = H / 2 + 120;
      p.setAttribute("d", `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`);
    });
  },
};

function Scene({ id }: { id: Exclude<ServiceKey, "autoconsum"> }) {
  switch (id) {
    case "electricitat":
      return (
        <>
          <path data-p="b" className="sv-sky" />
          <path data-p="a" className="sv-lead" />
        </>
      );
    case "gas":
      return (
        <>
          {Array.from({ length: 9 }, (_, k) => (
            <path key={k} data-s={k} className={k === 4 ? "sv-lead" : "sv-sky"} />
          ))}
        </>
      );
    case "telecomunicacions":
      return (
        <>
          <path data-p="a" className="sv-lead" />
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} data-dot={k} cy={H / 2 + 120} r="4" className="sv-dot" />
          ))}
        </>
      );
    case "alarmes":
      return (
        <>
          {[60, 110, 170].map((r) => (
            <circle key={r} cx={W / 2} cy={H / 2} r={r} className="sv-ring" />
          ))}
          <path data-p="b" className="sv-sweep" />
          <path data-p="a" className="sv-lead" />
          <circle data-dot cx={W / 2 + Math.cos(5.3) * 110} cy={H / 2 + Math.sin(5.3) * 110} r="6" className="sv-blip" />
        </>
      );
    case "assegurances":
      return (
        <>
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} data-s={k} className={k === 2 ? "sv-lead" : "sv-sky"} />
          ))}
          <line x1="80" x2={W - 80} y1={H / 2 + 120} y2={H / 2 + 120} className="sv-ring" />
        </>
      );
  }
}

export function ServiceVisual({ id, active = true, className }: { id: Exclude<ServiceKey, "autoconsum">; active?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const draw = draws[id];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 2;
    draw(svg, t);
    if (reduce) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(svg);
    const tick = (_: number, dt: number) => {
      if (!visible || !activeRef.current || document.hidden || isMotionPaused()) return;
      t += dt / 1000;
      draw(svg, t);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [id]);

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <Scene id={id} />
    </svg>
  );
}
