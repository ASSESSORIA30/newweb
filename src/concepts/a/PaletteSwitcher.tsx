"use client";

import { useEffect, useRef, useState } from "react";
import { palettes, type PaletteId } from "./palettes";

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="a-swatch" aria-hidden="true">
      <i style={{ background: colors[0] }} />
      <i style={{ background: colors[1] }} />
      <i style={{ background: colors[2] }} />
    </span>
  );
}

/**
 * Radio group of colour worlds. Arrow keys move and select, like a native radio set.
 * On phones it folds into one swatch button so it never covers the page's primary action.
 */
export function PaletteSwitcher({ value, onChange }: { value: PaletteId; onChange: (id: PaletteId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const current = palettes.find((p) => p.id === value)!;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = palettes.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(palettes[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div ref={rootRef} className="a-palette" data-open={open || undefined} translate="no">
      <button
        ref={toggleRef}
        type="button"
        className="a-palette__toggle"
        aria-expanded={open}
        aria-controls="a-palette-group"
        aria-label={`Paleta: ${current.code} ${current.name}. Canvia la paleta`}
        onClick={() => setOpen((v) => !v)}
      >
        <Swatch colors={current.swatch} />
      </button>
      <div id="a-palette-group" className="a-palette__group" role="radiogroup" aria-label="Paleta de colors">
        <span className="a-palette__label" aria-hidden="true">
          {current.code} · <b>{current.name}</b>
        </span>
        {palettes.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={p.id === value}
            aria-label={`${p.code} ${p.name}`}
            title={`${p.code} · ${p.name}`}
            tabIndex={p.id === value ? 0 : -1}
            onClick={() => onChange(p.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <Swatch colors={p.swatch} />
          </button>
        ))}
      </div>
    </div>
  );
}
