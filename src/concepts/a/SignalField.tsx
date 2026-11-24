"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";

/**
 * Hero field for Concept A: a receding bank of waveform traces computed in a vertex shader.
 * "Untriggered" (noisy) on load, it locks into a clean signal over ~2.4s and as the visitor scrolls.
 * - three.js is loaded on demand (keeps it out of the first JS chunk)
 * - renders only while visible and the tab is active
 * - reduced motion: one locked, static frame
 */
type Props = { className?: string; lead: string; dim: string; blend: "add" | "normal" };

export function SignalField({ className, lead, dim, blend }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Live handles into the scene so palette changes can retint it without rebuilding.
  const sceneRef = useRef<{
    lead: import("three").Color;
    dim: import("three").Color;
    material: import("three").ShaderMaterial;
    THREE: typeof import("three");
  } | null>(null);
  const colorsRef = useRef({ lead, dim, blend });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.matchMedia("(max-width: 767px)").matches;
      const ROWS = small ? 26 : 44;
      const POINTS = small ? 120 : 220;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 2.2, 9.5);
      camera.lookAt(0, 0, -2);

      const uniforms = {
        uTime: { value: 0 },
        uChaos: { value: reduce ? 0 : 1 },
        uPulse: { value: 0 },
        uColor: { value: new THREE.Color(colorsRef.current.lead) },
        uDim: { value: new THREE.Color(colorsRef.current.dim) },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: colorsRef.current.blend === "add" ? THREE.AdditiveBlending : THREE.NormalBlending,
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uChaos;
          uniform float uPulse;
          attribute float aRow;
          varying float vRow;
          varying float vX;
          float wave(float x, float z, float t) {
            float env = exp(-pow(x * 0.42, 2.0));
            float clean = sin(x * 2.1 + t * 0.9 + z * 0.55) * 0.55 * env
                        + sin(x * 0.7 - t * 0.35 + z * 0.2) * 0.25;
            float noise = sin(x * 7.13 + t * 3.3 + z * 1.71) * 0.42
                        + sin(x * 13.7 - t * 5.1 + z * 2.37) * 0.26
                        + sin(x * 23.9 + t * 7.7 - z * 0.9) * 0.14;
            float spike = exp(-pow((x - (fract(t * 0.07 + z * 0.013) * 16.0 - 8.0)) * 2.4, 2.0)) * uPulse;
            return clean + noise * uChaos * (0.6 + env) + spike;
          }
          void main() {
            vec3 p = position;
            p.y += wave(p.x, p.z, uTime);
            vRow = aRow;
            vX = p.x;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform vec3 uDim;
          varying float vRow;
          varying float vX;
          void main() {
            float lead = step(vRow, 0.5);
            float depthFade = 1.0 - smoothstep(0.0, 1.0, vRow / ${ROWS.toFixed(1)});
            float edge = 1.0 - smoothstep(5.5, 8.5, abs(vX));
            vec3 col = mix(uDim, uColor, lead + (1.0 - lead) * 0.18);
            float a = (lead * 0.95 + (1.0 - lead) * 0.32 * depthFade) * edge;
            gl_FragColor = vec4(col, a);
          }
        `,
      });

      sceneRef.current = { lead: uniforms.uColor.value, dim: uniforms.uDim.value, material, THREE };

      const group = new THREE.Group();
      for (let r = 0; r < ROWS; r++) {
        const positions = new Float32Array(POINTS * 3);
        const rows = new Float32Array(POINTS);
        const z = -r * 0.42;
        for (let i = 0; i < POINTS; i++) {
          positions[i * 3] = (i / (POINTS - 1)) * 18 - 9;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = z;
          rows[i] = r;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aRow", new THREE.BufferAttribute(rows, 1));
        group.add(new THREE.Line(geo, material));
      }
      scene.add(group);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.fov = camera.aspect < 0.8 ? 48 : 32;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // Pointer parallax: decorative, so it gets an eased follow (quickTo), fine pointers only.
      const rig = { x: 0, y: 0 };
      const toX = gsap.quickTo(rig, "x", { duration: 1.2, ease: "power3.out" });
      const toY = gsap.quickTo(rig, "y", { duration: 1.2, ease: "power3.out" });
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onMove = (e: PointerEvent) => {
        toX((e.clientX / window.innerWidth - 0.5) * 1.1);
        toY((e.clientY / window.innerHeight - 0.5) * 0.5);
      };
      if (fine && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

      // Scroll: dolly in and keep locking the signal.
      const scroll = { p: 0 };
      const st = reduce
        ? null
        : ScrollTrigger.create({
            trigger: host,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => (scroll.p = self.progress),
          });

      // The one authored moment: noise → locked trace.
      const intro = reduce
        ? null
        : gsap
            .timeline({ delay: 0.25 })
            .to(uniforms.uChaos, { value: 0.12, duration: 2.4, ease: "expo.out" })
            .to(uniforms.uPulse, { value: 1, duration: 1.2, ease: "power2.out" }, 0.9);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
      io.observe(host);

      const t0 = performance.now();
      const render = () => {
        const t = (performance.now() - t0) / 1000;
        uniforms.uTime.value = t;
        camera.position.x = rig.x;
        camera.position.y = 2.2 - rig.y + scroll.p * -0.9;
        camera.position.z = 9.5 - scroll.p * 3.2;
        camera.lookAt(rig.x * 0.3, -scroll.p * 0.6, -2);
        renderer.render(scene, camera);
      };
      const tick = () => {
        if (visible && !document.hidden && !isMotionPaused()) render();
      };

      if (reduce) {
        render();
      } else {
        gsap.ticker.add(tick);
      }

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
    })();

    return () => {
      disposed = true;
      sceneRef.current = null;
      cleanup();
    };
  }, []);

  // Palette change: tween both trace colours; switch blending for light grounds
  // (additive light disappears on white).
  useEffect(() => {
    // Keep the latest palette for a scene that is still loading three.js.
    colorsRef.current = { lead, dim, blend };
    const s = sceneRef.current;
    if (!s) return;
    const { THREE, material } = s;
    const wantBlend = blend === "add" ? THREE.AdditiveBlending : THREE.NormalBlending;
    if (material.blending !== wantBlend) {
      material.blending = wantBlend;
      material.needsUpdate = true;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const to = (c: import("three").Color, hex: string) => {
      const target = new THREE.Color(hex);
      return gsap.to(c, { r: target.r, g: target.g, b: target.b, duration: reduce ? 0.15 : 0.6, ease: "expo.out", overwrite: true });
    };
    const a = to(s.lead, lead);
    const b = to(s.dim, dim);
    return () => {
      a.kill();
      b.kill();
    };
  }, [lead, dim, blend]);

  return <div ref={hostRef} className={className} />;
}
