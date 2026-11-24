"use client";

import { useEffect, useState } from "react";
import { setMotionPaused } from "@/lib/motion";

export function MotionToggle({ className }: { className?: string }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => () => setMotionPaused(false), []);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={paused}
      onClick={() => {
        setPaused((p) => {
          setMotionPaused(!p);
          return !p;
        });
      }}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true" width="12" height="12">
        {paused ? <path d="M3 2 L10 6 L3 10 Z" fill="currentColor" /> : <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" />}
      </svg>
      {paused ? "Reprèn l’animació" : "Atura l’animació"}
    </button>
  );
}
