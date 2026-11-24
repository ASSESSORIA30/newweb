"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Strong ease-out (Emil Kowalski): cubic-bezier(0.23, 1, 0.32, 1) ≈ expo.out family.
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
