"use client";

/** Page-wide pause for ambient loops (WCAG 2.2.2). Scroll-linked animation keeps working. */
export const isMotionPaused = () =>
  typeof document !== "undefined" && document.documentElement.dataset.motion === "paused";

export function setMotionPaused(paused: boolean) {
  document.documentElement.dataset.motion = paused ? "paused" : "running";
  window.dispatchEvent(new CustomEvent("motionchange", { detail: { paused } }));
}
