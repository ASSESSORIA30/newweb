"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Web fonts change line metrics; recompute scroll trigger positions once they settle. */
export function RefreshOnFonts() {
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return null;
}
