"use client";

export type SavMode = "upload" | "estimate" | "advisor";
export const SAV_EVENT = "a30:savenergy-mode";

/** Lets any entry point (hero dock, close) open the comparator in a given mode. */
export function openSavEnergy(mode: SavMode) {
  window.dispatchEvent(new CustomEvent<SavMode>(SAV_EVENT, { detail: mode }));
}
