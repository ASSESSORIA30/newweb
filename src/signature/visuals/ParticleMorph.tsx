"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";

/**
 * One material, five forms. ~1400 particles morph between service formations driven by a
 * continuous value (0..4) from scroll: current lines → fluid → network → shield → orbits.
 */
type Formation = (i: number, n: number, t: number, w: number, h: number) => [number, number, number];

const TAU = Math.PI * 2;
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const NODES = Array.from({ length: 22 }, (_, k) => [0.14 + hash(k * 3.1) * 0.74, 0.16 + hash(k * 7.7) * 0.68]);
const EDGES: [number, number][] = [];
NODES.forEach((a, i) =>
  NODES.forEach((b, j) => {
    if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.24) EDGES.push([i, j]);
  }),
);

// Heater-shield outline sampled by arc length: flat top, straight flanks, curved to a point.
const SHIELD_PTS: [number, number][] = (() => {
  const raw: [number, number][] = [];
  const top = 0.2;
  for (let k = 0; k <= 20; k++) raw.push([0.3 + (k / 20) * 0.4, top + Math.sin((k / 20) * Math.PI) * 0.015]);
  for (let k = 1; k <= 12; k++) raw.push([0.7, top + (k / 12) * 0.22]);
  for (let k = 1; k <= 30; k++) {
    const a = (k / 30) * (Math.PI / 2);
    raw.push([0.5 + 0.2 * Math.cos(a), 0.42 + 0.42 * Math.sin(a)]);
  }
  for (let k = 1; k <= 30; k++) {
    const a = Math.PI / 2 + (k / 30) * (Math.PI / 2);
    raw.push([0.5 + 0.2 * Math.cos(a), 0.42 + 0.42 * Math.sin(a)]);
  }
  for (let k = 1; k <= 12; k++) raw.push([0.3, 0.42 - (k / 12) * 0.22]);
  // resample to equal arc length
  const len = [0];
  for (let k = 1; k < raw.length; k++) len.push(len[k - 1] + Math.hypot(raw[k][0] - raw[k - 1][0], raw[k][1] - raw[k - 1][1]));
  const total = len[len.length - 1];
  const out: [number, number][] = [];
  for (let k = 0; k < 240; k++) {
    const d = (k / 240) * total;
    let j = 1;
    while (j < len.length - 1 && len[j] < d) j++;
    const f = (d - len[j - 1]) / (len[j] - len[j - 1] || 1);
    out.push([raw[j - 1][0] + (raw[j][0] - raw[j - 1][0]) * f, raw[j - 1][1] + (raw[j][1] - raw[j - 1][1]) * f]);
  }
  return out;
})();
function shield(u: number): [number, number] {
  return SHIELD_PTS[Math.floor(((u % 1) + 1) % 1 * SHIELD_PTS.length) % SHIELD_PTS.length];
}

const forms: Formation[] = [
  // Electricity: six current lines, particles streaming left → right
  (i, n, t, w, h) => {
    const line = i % 6;
    const u = (hash(i) + t * (0.05 + (line % 3) * 0.015)) % 1;
    const y = 0.28 + line * 0.09 + Math.sin(u * TAU * 2 + line + t * 1.2) * 0.035;
    return [u * w, y * h, 0.55 + 0.45 * Math.sin(u * TAU * 3 - t * 4)];
  },
  // Gas: a flame plume — streams rise, twist and narrow as they burn
  (i, n, t, w, h) => {
    const life = (hash(i) + t * (0.12 + hash(i * 2) * 0.1)) % 1;
    const y = 0.86 - life * 0.68;
    const spread = 0.16 * Math.pow(1 - life, 0.8) + 0.015;
    const twist = Math.sin(life * 9 + t * 2.2 + hash(i * 3) * 6);
    const x = 0.5 + (hash(i * 5) - 0.5) * 2 * spread * 0.6 + twist * spread * 0.45;
    return [x * w, y * h, 0.45 + (1 - life) * 0.55];
  },
  // Telecom: particles clustered on nodes, some travelling along edges as packets
  (i, n, t, w, h) => {
    if (i % 3 === 0 && EDGES.length) {
      const [a, b] = EDGES[i % EDGES.length];
      const u = (hash(i) + t * 0.18) % 1;
      const x = NODES[a][0] + (NODES[b][0] - NODES[a][0]) * u;
      const y = NODES[a][1] + (NODES[b][1] - NODES[a][1]) * u;
      return [x * w, y * h, 1];
    }
    const node = NODES[i % NODES.length];
    const a = hash(i) * TAU + t * 0.8;
    const r = 0.006 + hash(i * 5) * 0.018;
    return [(node[0] + Math.cos(a) * r) * w, (node[1] + Math.sin(a) * r) * h, 0.55];
  },
  // Alarms: particles on a shield outline; a sweep lights what it passes
  (i, n, t, w, h) => {
    const u = hash(i);
    const [x, y] = shield(u);
    const inner = i % 4 === 0 ? 0.82 : 1;
    const cx = 0.5;
    const cy = 0.48;
    const px = cx + (x - cx) * inner;
    const py = cy + (y - cy) * inner;
    const ang = Math.atan2(py - cy, px - cx);
    const sweep = (t * 1.4) % TAU;
    const d = ((sweep - ang + TAU * 2) % TAU) / TAU;
    return [px * w, py * h, 0.35 + Math.max(0, 1 - d * 5) * 0.9];
  },
  // Insurance: three stable orbits around a still centre
  (i, n, t, w, h) => {
    const ring = i % 3;
    const r = 0.12 + ring * 0.1;
    const a = hash(i) * TAU + t * (0.22 - ring * 0.05);
    return [(0.5 + Math.cos(a) * r * 0.85) * w, (0.5 + Math.sin(a) * r) * h, 0.5 + ring * 0.15];
  },
];

export function ParticleMorph({ className, value }: { className?: string; value: { current: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const N = small ? 700 : 1400;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    let elapsed = reduce ? 6000 : 0;
    let last = performance.now();
    const ease = (x: number) => x * x * (3 - 2 * x);

    const draw = () => {
      const t = elapsed / 1000;
      const v = Math.max(0, Math.min(4, value.current));
      const a = Math.min(3, Math.floor(v));
      const m = ease(v - a);
      const fa = forms[a];
      const fb = forms[a + 1] ?? forms[a];
      ctx.clearRect(0, 0, w, h);

      // Structural strokes of the dominant form (fades with the morph)
      const wA = 1 - m;
      const wB = m;
      const strokes = (k: number, weight: number) => {
        if (weight < 0.02) return;
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 1;
        if (k === 2) {
          ctx.strokeStyle = `rgba(132,185,255,${0.16 * weight})`;
          ctx.beginPath();
          for (const [i, j] of EDGES) {
            ctx.moveTo(NODES[i][0] * w, NODES[i][1] * h);
            ctx.lineTo(NODES[j][0] * w, NODES[j][1] * h);
          }
          ctx.stroke();
          const wave = (t * 0.35) % 1;
          ctx.strokeStyle = `rgba(132,185,255,${0.35 * (1 - wave) * weight})`;
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.5, wave * Math.min(w, h) * 0.55, 0, TAU);
          ctx.stroke();
        }
        if (k === 3) {
          ctx.strokeStyle = `rgba(132,185,255,${0.22 * weight})`;
          ctx.beginPath();
          for (let s = 0; s <= 80; s++) {
            const [x, y] = shield(s / 80);
            if (s) ctx.lineTo(x * w, y * h);
            else ctx.moveTo(x * w, y * h);
          }
          ctx.closePath();
          ctx.stroke();
          const sweep = (t * 1.4) % TAU;
          const r = Math.min(w, h) * 0.42;
          const g = ctx.createRadialGradient(w * 0.5, h * 0.48, 0, w * 0.5, h * 0.48, r);
          g.addColorStop(0, `rgba(36,88,255,${0.18 * weight})`);
          g.addColorStop(1, "rgba(36,88,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(w * 0.5, h * 0.48);
          ctx.arc(w * 0.5, h * 0.48, r, sweep - 0.6, sweep);
          ctx.closePath();
          ctx.fill();
        }
        if (k === 4) {
          ctx.strokeStyle = `rgba(132,185,255,${0.18 * weight})`;
          for (const r of [0.12, 0.22, 0.32]) {
            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.5, r * 0.85 * w, r * h, 0, 0, TAU);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(255,255,255,${0.9 * weight})`;
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.5, 4, 0, TAU);
          ctx.fill();
        }
      };
      strokes(a, wA);
      strokes(a + 1, wB);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < N; i++) {
        const [x1, y1, b1] = fa(i, N, t, w, h);
        const [x2, y2, b2] = fb(i, N, t, w, h);
        // A gentle arc during the morph so particles travel, not slide.
        const arc = Math.sin(m * Math.PI) * (hash(i * 9) - 0.5) * 60;
        const x = x1 + (x2 - x1) * m + arc;
        const y = y1 + (y2 - y1) * m - arc * 0.6;
        const br = b1 + (b2 - b1) * m;
        const hot = br > 0.85;
        ctx.fillStyle = hot ? `rgba(234,243,255,${Math.min(1, br)})` : `rgba(132,185,255,${0.4 + br * 0.6})`;
        const s = hot ? 2.8 : 2;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    };

    let lastV = -1;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(now - last, 50);
      last = now;
      if (!visible || document.hidden) return;
      if (isMotionPaused() || reduce) {
        if (value.current !== lastV) {
          lastV = value.current;
          draw();
        }
        return;
      }
      elapsed += dt;
      draw();
    };
    draw();
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
    };
  }, [value]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
