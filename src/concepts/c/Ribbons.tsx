"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";

/**
 * Generative ribbon field for Concept C. The seed is a 24-hour consumption profile:
 * the same curve that draws the analysis chart bends every ribbon, so switching
 * Llar/Empresa reshapes the whole hero. Canvas 2D, paused off-screen, static under reduced motion.
 */
export function Ribbons({ profile, className }: { profile: number[]; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curve = useRef<number[]>([...profile]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(curve.current, {
      ...Object.fromEntries(profile.map((v, i) => [i, v])),
      duration: reduce ? 0 : 1.1,
      ease: "expo.inOut",
    });
  }, [profile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // Smooth sample of the 24-point profile at t ∈ [0,1].
    const sample = (t: number) => {
      const c = curve.current;
      const x = t * (c.length - 1);
      const i = Math.floor(x);
      const f = x - i;
      const a = c[Math.max(0, i)];
      const b = c[Math.min(c.length - 1, i + 1)];
      const s = f * f * (3 - 2 * f);
      return a + (b - a) * s;
    };

    const LINES = w < 700 ? 34 : 56;
    const STEPS = 90;
    const t0 = performance.now();

    const draw = () => {
      const time = reduce ? 4 : (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (let l = 0; l < LINES; l++) {
        const k = l / (LINES - 1);
        const twist = Math.sin(time * 0.35 + k * Math.PI * 1.6);
        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
          const t = s / STEPS;
          const x = -w * 0.05 + t * w * 1.1;
          const load = sample(t);
          const base = h * (0.86 - k * 0.05);
          const amp = h * 0.62 * (0.55 + 0.45 * twist);
          const wave = Math.sin(t * 6.2 + time * 0.6 + k * 2.4) * h * 0.025;
          const y = base - load * amp + wave + (k - 0.5) * h * 0.16 * Math.cos(t * 3 + time * 0.25);
          if (s) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(16, 122, 78, ${0.08 + k * 0.2})`);
        g.addColorStop(0.55, `rgba(24, 214, 128, ${0.3 + k * 0.5})`);
        g.addColorStop(1, `rgba(110, 230, 200, ${0.15 + k * 0.35})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
    };

    const tick = () => {
      if (visible && !document.hidden && !isMotionPaused()) draw();
    };
    if (reduce) {
      draw();
      const id = setInterval(draw, 200); // follow the profile tween without continuous motion
      return () => {
        clearInterval(id);
        ro.disconnect();
        io.disconnect();
      };
    }
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
