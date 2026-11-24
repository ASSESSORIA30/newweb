"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analysisStages } from "./bill-demo";

export type AnalysisState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "reading"; stage: number; fileName: string }
  | { status: "done"; fileName: string };

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Simulated SavEnergy IA flow. The file never leaves the browser in this phase:
 * we only validate it locally and play the analysis stages.
 */
export function useBillAnalysis(stageMs = 900) {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const run = useCallback(
    (fileName: string) => {
      if (timer.current) clearTimeout(timer.current);
      let stage = 0;
      setState({ status: "reading", stage, fileName });
      const tick = () => {
        stage += 1;
        if (stage >= analysisStages.length) {
          setState({ status: "done", fileName });
          return;
        }
        setState({ status: "reading", stage, fileName });
        timer.current = setTimeout(tick, stageMs);
      };
      timer.current = setTimeout(tick, stageMs);
    },
    [stageMs],
  );

  const analyzeFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (file.type && !ACCEPTED.includes(file.type)) {
        setState({ status: "error", message: "Aquest format no es pot llegir. Puja la factura en PDF, JPG o PNG." });
        return;
      }
      if (file.size > MAX_BYTES) {
        setState({ status: "error", message: "El fitxer supera els 10 MB. Prova amb una foto més lleugera o el PDF original." });
        return;
      }
      run(file.name);
    },
    [run],
  );

  const analyzeSample = useCallback(() => run("factura-exemple.pdf"), [run]);
  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setState({ status: "idle" });
  }, []);

  return { state, analyzeFile, analyzeSample, reset, stages: analysisStages };
}
