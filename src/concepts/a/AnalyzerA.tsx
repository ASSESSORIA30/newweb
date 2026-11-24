"use client";

import { useId, useRef } from "react";
import { useBillAnalysis } from "@/lib/useBillAnalysis";
import { useDropTarget } from "@/lib/useDropTarget";
import { DEMO_LABEL, demoEstimate } from "@/lib/bill-demo";

/** SavEnergy IA intake, set into the graticule like an instrument input. */
export function AnalyzerA({ id }: { id?: string }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLButtonElement>(null);
  const { state, analyzeFile, analyzeSample, reset, stages } = useBillAnalysis();
  const { over, bind } = useDropTarget(analyzeFile);

  return (
    <div id={id} className="a-intake" data-over={over || undefined} data-status={state.status} {...bind}>
      <div className="a-intake__head">
        <span className="a-mono a-intake__ch">IN</span>
        <span>SavEnergy IA</span>
        <span className="a-intake__state" data-armed={state.status === "reading" || undefined}>
          {state.status === "reading" ? "Llegint" : state.status === "done" ? "Llest" : "Preparat"}
        </span>
      </div>

      <div className="a-intake__body" aria-live="polite">
        {state.status === "idle" || state.status === "error" ? (
          <>
            <p className="a-intake__title">Puja la factura de llum o gas</p>
            <p className="a-intake__hint">Arrossega-la aquí o tria el fitxer. PDF, JPG o PNG.</p>
            {state.status === "error" ? (
              <p className="a-intake__error" role="alert">
                {state.message}
              </p>
            ) : null}
            <div className="a-intake__actions">
              <button
                ref={pickRef}
                type="button"
                className="a-btn a-btn--solid"
                onClick={() => inputRef.current?.click()}
              >
                Tria la factura
              </button>
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                tabIndex={-1}
                aria-label="Factura de llum o gas"
                accept="application/pdf,image/*"
                className="sr-only"
                onChange={(e) => {
                  analyzeFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button type="button" className="a-btn a-btn--ghost" onClick={analyzeSample}>
                Prova amb una d’exemple
              </button>
            </div>
          </>
        ) : null}

        {state.status === "reading" ? (
          <ol className="a-stages">
            {stages.map((s, i) => (
              <li key={s} data-state={i < state.stage ? "done" : i === state.stage ? "now" : "next"}>
                <span className="a-mono">{String(i + 1).padStart(2, "0")}</span>
                {s}
                {i === state.stage ? "…" : ""}
              </li>
            ))}
          </ol>
        ) : null}

        {state.status === "done" ? (
          <div className="a-result">
            <p className="a-result__label">Estalvi estimat</p>
            <p className="a-result__value">
              <span className="a-mono">
                {demoEstimate.min}–{demoEstimate.max}
              </span>{" "}
              {demoEstimate.unit}
            </p>
            <p className="a-demo">{DEMO_LABEL}. Xifra de mostra, no és una oferta.</p>
            <div className="a-intake__actions">
              <a href="#contacte" className="a-btn a-btn--solid">
                Demana l’estudi complet
              </a>
              <button
                type="button"
                className="a-btn a-btn--ghost"
                onClick={() => {
                  reset();
                  requestAnimationFrame(() => pickRef.current?.focus());
                }}
              >
                Analitza’n una altra
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <p className="a-intake__foot">En aquest prototip el fitxer no surt del teu navegador.</p>
    </div>
  );
}
