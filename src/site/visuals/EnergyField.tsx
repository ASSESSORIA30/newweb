"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";

type Tier = "off" | "low" | "high";

/** Device tier: skip WebGL on Save-Data / very low memory; thin it out on modest devices and phones. */
function deviceTier(): Tier {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return "off";
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return "off";
  const small = window.matchMedia("(max-width: 767px)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  return small || cores <= 4 ? "low" : "high";
}

/**
 * A3 Corporate energy field. A bank of waveform traces computed in a vertex shader:
 * noise settles into one locked blue trace, then the camera dollies with scroll.
 * three.js is fetched after first paint (idle), never during LCP.
 */
export function EnergyField({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const tier = deviceTier();
    if (tier === "off") {
      host.dataset.fallback = "static";
      return;
    }
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ROWS = tier === "high" ? 40 : 24;
      const POINTS = tier === "high" ? 220 : 120;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === "high" ? 2 : 1.5));
      renderer.setClearColor(0xffffff, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      const uniforms = {
        uTime: { value: 0 },
        uChaos: { value: reduce ? 0.1 : 1 },
        uPulse: { value: reduce ? 1 : 0 },
        uLead: { value: new THREE.Color("#2458FF") },
        uDim: { value: new THREE.Color("#84B9FF") },
        uRows: { value: ROWS },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uChaos;
          uniform float uPulse;
          attribute float aRow;
          varying float vRow;
          varying float vX;
          void main() {
            vec3 p = position;
            float x = p.x; float z = p.z; float t = uTime;
            float env = exp(-pow(x * 0.36, 2.0));
            float clean = sin(x * 1.8 + t * 0.7 + z * 0.5) * 0.5 * env + sin(x * 0.6 - t * 0.28 + z * 0.18) * 0.22;
            float noise = sin(x * 7.1 + t * 3.1 + z * 1.7) * 0.4 + sin(x * 13.7 - t * 4.7 + z * 2.3) * 0.24 + sin(x * 23.9 + t * 7.3 - z * 0.9) * 0.12;
            float sweep = fract(t * 0.06 + z * 0.011) * 18.0 - 9.0;
            float spike = exp(-pow((x - sweep) * 2.2, 2.0)) * uPulse * 0.8;
            p.y += clean + noise * uChaos * (0.55 + env) + spike;
            vRow = aRow;
            vX = p.x;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uLead;
          uniform vec3 uDim;
          uniform float uRows;
          varying float vRow;
          varying float vX;
          void main() {
            float lead = step(vRow, 0.5);
            float depth = 1.0 - smoothstep(0.0, 1.0, vRow / uRows);
            float edge = 1.0 - smoothstep(5.0, 9.0, abs(vX));
            vec3 col = mix(uDim, uLead, lead);
            float a = (lead * 0.95 + (1.0 - lead) * 0.5 * depth) * edge;
            gl_FragColor = vec4(col, a);
          }
        `,
      });

      const group = new THREE.Group();
      for (let r = 0; r < ROWS; r++) {
        const positions = new Float32Array(POINTS * 3);
        const rows = new Float32Array(POINTS);
        for (let i = 0; i < POINTS; i++) {
          positions[i * 3] = (i / (POINTS - 1)) * 18 - 9;
          positions[i * 3 + 2] = -r * 0.42;
          rows[i] = r;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aRow", new THREE.BufferAttribute(rows, 1));
        group.add(new THREE.Line(geo, material));
      }
      // The lead trace is drawn three times, 1px apart, for a confident 2–3px stroke.
      const leadGeo = (group.children[0] as import("three").Line).geometry;
      for (const dy of [-0.012, 0.012]) {
        const l = new THREE.Line(leadGeo, material);
        l.position.y = dy;
        group.add(l);
      }
      scene.add(group);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.fov = camera.aspect < 0.8 ? 46 : 30;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const rig = { x: 0, y: 0 };
      const toX = gsap.quickTo(rig, "x", { duration: 1.4, ease: "power3.out" });
      const toY = gsap.quickTo(rig, "y", { duration: 1.4, ease: "power3.out" });
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onMove = (e: PointerEvent) => {
        toX((e.clientX / window.innerWidth - 0.5) * 0.9);
        toY((e.clientY / window.innerHeight - 0.5) * 0.4);
      };
      if (fine && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

      const scroll = { p: 0 };
      const st = reduce
        ? null
        : ScrollTrigger.create({ trigger: host, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => (scroll.p = s.progress) });

      const intro = reduce
        ? null
        : gsap
            .timeline({ delay: 0.1 })
            .to(uniforms.uChaos, { value: 0.1, duration: 2.4, ease: "expo.out" })
            .to(uniforms.uPulse, { value: 1, duration: 1.4, ease: "power2.out" }, 1);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      const t0 = performance.now();
      const render = () => {
        uniforms.uTime.value = reduce ? 6 : (performance.now() - t0) / 1000;
        camera.position.set(rig.x, 2.4 - rig.y - scroll.p * 0.9, 10 - scroll.p * 3.4);
        camera.lookAt(rig.x * 0.3, -scroll.p * 0.6, -2.5);
        renderer.render(scene, camera);
      };
      const tick = () => {
        if (visible && !document.hidden && !isMotionPaused()) render();
      };
      render();
      host.dataset.ready = "true"; // CSS fades the canvas in
      if (!reduce) gsap.ticker.add(tick);

      cleanup = () => {
        gsap.ticker.remove(tick);
        intro?.kill();
        st?.kill();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        group.children.forEach((c) => (c as import("three").Line).geometry.dispose());
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Defer the 3D work until the browser is idle after first paint.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => void start(), { timeout: 1200 }) : window.setTimeout(() => void start(), 300);

    return () => {
      disposed = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(id as number);
      else clearTimeout(id as number);
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className={className} />;
}
