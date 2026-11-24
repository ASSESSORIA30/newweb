"use client";

import { useCallback, useState } from "react";

/** Drag-and-drop wiring for a file target. Keyboard/tap users use the visible file button instead. */
export function useDropTarget(onFile: (file: File | undefined) => void) {
  const [over, setOver] = useState(false);
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setOver(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setOver(false);
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setOver(false);
      onFile(e.dataTransfer.files?.[0]);
    },
    [onFile],
  );
  return { over, bind: { onDragOver, onDragLeave, onDrop } };
}
