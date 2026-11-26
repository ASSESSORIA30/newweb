"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isMotionPaused } from "@/lib/motion";

type Tier = "off" | "low" | "high";

/** Device tier: skip WebGL on Save-Data / very low memory; thin it out (and 30 fps) on modest devices and phones. */
function deviceTier(): Tier {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return "off";
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return "off";
  const small = window.matchMedia("(max-width: 767px)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  return small || cores <= 4 ? "low" : "high";
}

/* ---------- minimal column-major mat4 helpers ---------- */
function perspective(fovyDeg: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan((fovyDeg * Math.PI) / 360);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function lookAt(eye: number[], center: number[], up = [0, 1, 0]) {
  let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
  let l = Math.hypot(zx, zy, zz);
  zx /= l; zy /= l; zz /= l;
  let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
  l = Math.hypot(xx, xy, xz);
  xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ]);
}

const VERT = `
attribute vec3 aPos;
attribute float aRow;
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uChaos;
uniform float uPulse;
uniform float uLift;
varying float vRow;
varying float vX;
void main() {
  vec3 p = aPos;
  float x = p.x; float z = p.z; float t = uTime;
  float env = exp(-pow(x * 0.36, 2.0));
  float clean = sin(x * 1.8 + t * 0.7 + z * 0.5) * 0.5 * env + sin(x * 0.6 - t * 0.28 + z * 0.18) * 0.22;
  float noise = sin(x * 7.1 + t * 3.1 + z * 1.7) * 0.4 + sin(x * 13.7 - t * 4.7 + z * 2.3) * 0.24 + sin(x * 23.9 + t * 7.3 - z * 0.9) * 0.12;
  float sweep = fract(t * 0.06 + z * 0.011) * 18.0 - 9.0;
  float spike = exp(-pow((x - sweep) * 2.2, 2.0)) * uPulse * 0.8;
  p.y += clean + noise * uChaos * (0.55 + env) + spike + uLift;
  vRow = aRow;
  vX = p.x;
  gl_Position = uProj * uView * vec4(p, 1.0);
}`;

const FRAG = `
precision mediump float;
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
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/**
 * A3 Corporate energy field. A bank of waveform traces computed in a vertex shader:
 * noise settles into one locked blue trace, then the camera dollies with scroll.
 * Raw WebGL (no 3D library): a few KB instead of a 700 KB chunk. Started at idle, after first paint.
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
    let cleanup = () => {};
    let disposed = false;

    const start = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" });
      if (!gl) {
        host.dataset.fallback = "static";
        return;
      }
      host.appendChild(canvas);

      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        canvas.remove();
        host.dataset.fallback = "static";
        return;
      }
      gl.useProgram(prog);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ROWS = tier === "high" ? 40 : 24;
      const POINTS = tier === "high" ? 220 : 120;
      const data = new Float32Array(ROWS * POINTS * 4);
      for (let r = 0; r < ROWS; r++) {
        for (let i = 0; i < POINTS; i++) {
          const o = (r * POINTS + i) * 4;
          data[o] = (i / (POINTS - 1)) * 18 - 9;
          data[o + 1] = 0;
          data[o + 2] = -r * 0.42;
          data[o + 3] = r;
        }
      }
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, "aPos");
      const aRow = gl.getAttribLocation(prog, "aRow");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(aRow);
      gl.vertexAttribPointer(aRow, 1, gl.FLOAT, false, 16, 12);

      const U = (n: string) => gl.getUniformLocation(prog, n);
      const uProj = U("uProj"), uView = U("uView"), uTime = U("uTime"), uChaos = U("uChaos"), uPulse = U("uPulse"), uLift = U("uLift");
      gl.uniform3fv(U("uLead"), hex("#2458FF"));
      gl.uniform3fv(U("uDim"), hex("#84B9FF"));
      gl.uniform1f(U("uRows"), ROWS);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(1, 1, 1, 0);

      const state = { chaos: reduce ? 0.1 : 1, pulse: reduce ? 1 : 0 };
      let aspect = 1;
      let fov = 30;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio, tier === "high" ? 2 : 1.5);
        const w = host.clientWidth;
        const h = host.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        aspect = w / Math.max(h, 1);
        fov = aspect < 0.8 ? 46 : 30;
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
            .to(state, { chaos: 0.1, duration: 2.4, ease: "expo.out" })
            .to(state, { pulse: 1, duration: 1.4, ease: "power2.out" }, 1);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      // Time advances only while the field is actually drawing, so pause / hidden tab / off-screen
      // resume exactly where they stopped.
      let elapsed = 0;
      let last = performance.now();
      let lastScroll = -1;
      const draw = () => {
        gl.uniformMatrix4fv(uProj, false, perspective(fov, aspect, 0.1, 100));
        gl.uniformMatrix4fv(uView, false, lookAt([rig.x, 2.4 - rig.y - scroll.p * 0.9, 10 - scroll.p * 3.4], [rig.x * 0.3, -scroll.p * 0.6, -2.5]));
        gl.uniform1f(uTime, reduce ? 6 : elapsed / 1000);
        gl.uniform1f(uChaos, state.chaos);
        gl.uniform1f(uPulse, state.pulse);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uLift, 0);
        for (let r = ROWS - 1; r >= 0; r--) gl.drawArrays(gl.LINE_STRIP, r * POINTS, POINTS);
        // The lead trace is drawn twice more, nudged, for a confident 2–3px stroke.
        for (const dy of [-0.012, 0.012]) {
          gl.uniform1f(uLift, dy);
          gl.drawArrays(gl.LINE_STRIP, 0, POINTS);
        }
      };

      let odd = false;
      const tick = () => {
        const now = performance.now();
        const dt = Math.min(now - last, 50);
        last = now;
        if (!visible || document.hidden) return;
        if (isMotionPaused()) {
          // Frozen in time, but the scroll-linked dolly keeps working.
          if (scroll.p !== lastScroll) {
            lastScroll = scroll.p;
            draw();
          }
          return;
        }
        elapsed += dt;
        odd = !odd;
        if (tier === "low" && odd) return; // 30 fps on modest devices
        draw();
      };
      draw();
      host.dataset.ready = "true";
      if (!reduce) gsap.ticker.add(tick);

      cleanup = () => {
        gsap.ticker.remove(tick);
        intro?.kill();
        st?.kill();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        canvas.remove();
      };
    };

    // After first paint: on phones wait for the load event as well, then an idle slot.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const idle = () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300));
    const afterLoad = () => (tier === "low" ? window.setTimeout(idle, 600) : idle());
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("load", afterLoad);
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className={className} />;
}
