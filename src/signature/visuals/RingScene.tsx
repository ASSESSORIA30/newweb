"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";

type Tier = "off" | "low" | "high";

function deviceTier(): Tier {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return "off";
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return "off";
  const small = window.matchMedia("(max-width: 767px)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  return small || cores <= 4 ? "low" : "high";
}

/* Seeded random so every visit draws the same symbol. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const FLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// Opaque so the glass ring refracts it. Chaos (left) is dim and flickering; after the ring the
// stream is steady and bright: energy put in order.
const FLOW_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uSpeed;
  uniform float uOrder;   // uv.x where the stream crosses the ring
  uniform vec3 uDeep;
  uniform vec3 uSky;
  uniform vec3 uHot;
  varying vec2 vUv;
  void main() {
    float x = vUv.x;
    float ordered = smoothstep(uOrder - 0.06, uOrder + 0.04, x);
    float p = fract(x * 2.2 - uTime * uSpeed + uSeed);
    float pulse = smoothstep(0.0, 0.025, p) * smoothstep(0.16, 0.025, p);
    float flicker = 0.55 + 0.45 * sin(uTime * 7.0 + x * 40.0 + uSeed * 10.0);
    vec3 base = mix(uDeep, uSky, mix(0.35 * flicker, 0.85, ordered));
    vec3 col = mix(base, uHot, pulse * mix(0.6, 1.0, ordered));
    float edge = smoothstep(0.0, 0.06, x) * smoothstep(1.0, 0.94, x);
    gl_FragColor = vec4(mix(uDeep, col, edge), 1.0);
  }
`;

export type RingHandle = { progress: (p: number) => void };

/**
 * The Assessoria 3.0 signature: a glass ring (the "0" of 3.0, the yearly cycle) that chaotic
 * energy passes through and leaves in order. Physical transmission + dispersion refract the
 * streams and the graticule behind it; a key light follows the cursor; scroll flies the camera
 * through the ring into the light of the next chapter.
 */
export function RingScene({ className, onReady }: { className?: string; onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const tier = deviceTier();
    if (tier === "off") {
      host.dataset.fallback = "poster";
      return;
    }
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const high = tier === "high";
      const small = window.matchMedia("(max-width: 767px)").matches;

      const renderer = new THREE.WebGLRenderer({ antialias: high, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, high ? 1.75 : 1.25));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      (renderer as unknown as { transmissionResolutionScale: number }).transmissionResolutionScale = high ? 0.8 : 0.5;
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#060d22");
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.9;

      const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 120);

      /* ---------- Backdrop: deep navy light pool + measured graticule (refracted by the ring) ---------- */
      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = 2048;
      bgCanvas.height = 1152;
      const g = bgCanvas.getContext("2d")!;
      const grad = g.createRadialGradient(1360, 520, 40, 1360, 520, 1100);
      grad.addColorStop(0, "#1d3a8a");
      grad.addColorStop(0.35, "#0f2257");
      grad.addColorStop(1, "#050b1c");
      g.fillStyle = grad;
      g.fillRect(0, 0, 2048, 1152);
      g.strokeStyle = "rgba(132,185,255,0.07)";
      g.lineWidth = 1;
      for (let x = 0; x <= 2048; x += 64) {
        g.beginPath();
        g.moveTo(x + 0.5, 0);
        g.lineTo(x + 0.5, 1152);
        g.stroke();
      }
      for (let y = 0; y <= 1152; y += 64) {
        g.beginPath();
        g.moveTo(0, y + 0.5);
        g.lineTo(2048, y + 0.5);
        g.stroke();
      }
      g.strokeStyle = "rgba(132,185,255,0.12)";
      for (const r of [180, 300, 460]) {
        g.beginPath();
        g.arc(1360, 520, r, 0, Math.PI * 2);
        g.stroke();
      }
      const bgTex = new THREE.CanvasTexture(bgCanvas);
      bgTex.colorSpace = THREE.SRGBColorSpace;
      const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(44, 24.75), new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false }));
      backdrop.position.set(0, 0, -9);
      scene.add(backdrop);

      /* ---------- The ring ---------- */
      const ringPos = small ? new THREE.Vector3(0.1, 3.3, 0) : new THREE.Vector3(3.4, 0.35, 0);
      const ringGeo = new THREE.TorusGeometry(2.05, 0.5, high ? 96 : 48, high ? 220 : 120);
      const ringMat = new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0.04,
        transmission: 1,
        thickness: 1.6,
        ior: 1.5,
        dispersion: high ? 0.9 : 0,
        attenuationColor: new THREE.Color("#9cc6ff"),
        attenuationDistance: 2.6,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 1,
        envMapIntensity: 1.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const ringRig = new THREE.Group();
      ringRig.position.copy(ringPos);
      ringRig.add(ring);
      if (small) ringRig.scale.setScalar(0.56);
      scene.add(ringRig);

      /* ---------- Energy streams: chaos in, order out ---------- */
      const rand = rng(30);
      const N = high ? 11 : 6;
      const flowMats: import("three").ShaderMaterial[] = [];
      const flows = new THREE.Group();
      for (let i = 0; i < N; i++) {
        const k = i / (N - 1) - 0.5;
        const orderedY = ringPos.y + k * 1.9 * (small ? 0.56 : 1);
        const pts = [
          new THREE.Vector3(-18, ringPos.y + (rand() - 0.5) * 12, -2 - rand() * 4),
          new THREE.Vector3(-10, ringPos.y + (rand() - 0.5) * 7, -1 + (rand() - 0.5) * 3),
          new THREE.Vector3(-4 + ringPos.x * 0.4, ringPos.y + (rand() - 0.5) * 3.2, (rand() - 0.5) * 2),
          new THREE.Vector3(ringPos.x - 0.6, orderedY + (rand() - 0.5) * 0.3, 0.1),
          new THREE.Vector3(ringPos.x + 0.6, orderedY, 0),
          new THREE.Vector3(ringPos.x + 5, orderedY, -0.2),
          new THREE.Vector3(22, orderedY, -0.4),
        ];
        const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
        const mat = new THREE.ShaderMaterial({
          vertexShader: FLOW_VERT,
          fragmentShader: FLOW_FRAG,
          uniforms: {
            uTime: { value: 0 },
            uSeed: { value: rand() },
            uSpeed: { value: 0.06 + rand() * 0.05 },
            uOrder: { value: 0.5 },
            uDeep: { value: new THREE.Color("#0b1a44") },
            uSky: { value: new THREE.Color(i % 3 === 0 ? "#2458ff" : "#84b9ff") },
            uHot: { value: new THREE.Color("#eaf3ff") },
          },
          toneMapped: false,
        });
        // Locate where the stream crosses the ring (uv.x) so the shader knows where order begins.
        let best = 0;
        let bestD = Infinity;
        for (let s = 0; s <= 200; s++) {
          const p = curve.getPointAt(s / 200);
          const d = Math.abs(p.x - ringPos.x);
          if (d < bestD) {
            bestD = d;
            best = s / 200;
          }
        }
        mat.uniforms.uOrder.value = best;
        flowMats.push(mat);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, high ? 420 : 220, 0.016 + rand() * 0.018, high ? 8 : 5, false), mat);
        flows.add(tube);
      }
      scene.add(flows);

      /* ---------- Light that follows the cursor ---------- */
      const key = new THREE.PointLight("#9fc4ff", 60, 30, 1.6);
      key.position.set(ringPos.x - 2, ringPos.y + 2, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight("#2458ff", 2.2);
      rim.position.set(6, -3, -4);
      scene.add(rim);

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      /* ---------- Interaction ---------- */
      const tilt = { x: 0, y: 0, lx: 0, ly: 0 };
      const tx = gsap.quickTo(tilt, "x", { duration: 1.6, ease: "power3.out" });
      const ty = gsap.quickTo(tilt, "y", { duration: 1.6, ease: "power3.out" });
      const lx = gsap.quickTo(tilt, "lx", { duration: 0.9, ease: "power3.out" });
      const ly = gsap.quickTo(tilt, "ly", { duration: 0.9, ease: "power3.out" });
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        tx(ny * 0.35);
        ty(nx * 0.5);
        lx(nx * 9);
        ly(-ny * 6);
      };
      if (fine && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

      /* ---------- Scroll: fly through the ring ---------- */
      const fly = { p: 0 };
      const camStart = new THREE.Vector3(0, 0, small ? 12.5 : 12);
      // The camera stops just inside the ring: its glass rim frames the light that opens from its centre.
      const camEnd = new THREE.Vector3(ringPos.x, ringPos.y, 1.15);
      const look = new THREE.Vector3();
      const st = reduce
        ? null
        : ScrollTrigger.create({
            trigger: host.closest("[data-fly]") ?? host,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (s) => (fly.p = s.progress),
          });

      /* ---------- Intro: the ring turns into frame while the streams settle ---------- */
      const intro = { spin: reduce ? 0 : -1.2, rise: reduce ? 0 : -0.6 };
      const introTl = reduce ? null : gsap.to(intro, { spin: 0, rise: 0, duration: 2.6, ease: "expo.out", delay: 0.05 });

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      let elapsed = 0;
      let last = performance.now();
      let lastFly = -1;
      const ease = (t: number) => t * t * (3 - 2 * t);
      const render = () => {
        const t = elapsed / 1000;
        for (const m of flowMats) m.uniforms.uTime.value = t;
        ring.rotation.x = 0.25 + tilt.x + intro.rise;
        ring.rotation.y = -0.55 + tilt.y + intro.spin + Math.sin(t * 0.25) * 0.08;
        ring.rotation.z = t * 0.06;
        ringRig.position.y = ringPos.y + Math.sin(t * 0.6) * 0.06;
        key.position.set(ringPos.x - 2 + tilt.lx, ringPos.y + 2 + tilt.ly, 4);
        // Flythrough: ease the camera into the ring and through it; the ring turns to face us first.
        const p = ease(Math.min(1, fly.p * 1.05));
        const face = Math.min(1, fly.p * 2.2);
        ring.rotation.x *= 1 - face;
        ring.rotation.y *= 1 - face;
        camera.position.lerpVectors(camStart, camEnd, p);
        look.set(ringPos.x * p, ringPos.y * p, -9);
        camera.lookAt(look);
        camera.fov = 34 + p * 18;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const tick = () => {
        const now = performance.now();
        const dt = Math.min(now - last, 50);
        last = now;
        if (!visible || document.hidden) return;
        if (isMotionPaused()) {
          if (fly.p !== lastFly) {
            lastFly = fly.p;
            render();
          }
          return;
        }
        elapsed += dt;
        render();
      };
      elapsed = reduce ? 4000 : 0;
      render();
      host.dataset.ready = "true";
      readyRef.current?.();
      if (!reduce) gsap.ticker.add(tick);
      else st?.kill();

      cleanup = () => {
        gsap.ticker.remove(tick);
        introTl?.kill();
        st?.kill();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        flows.children.forEach((c) => (c as import("three").Mesh).geometry.dispose());
        flowMats.forEach((m) => m.dispose());
        ringGeo.dispose();
        ringMat.dispose();
        bgTex.dispose();
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // The poster is already on screen; fetch the 3D after first paint.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(() => void start(), { timeout: 900 }) : window.setTimeout(() => void start(), 200));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("load", go);
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className={className} />;
}
