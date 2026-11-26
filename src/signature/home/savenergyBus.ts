"use client";

export type SavMode = "upload" | "estimate" | "advisor";
export const SAV_EVENT = "a30:savenergy-mode";
export const SAV_CONSOLE_ID = "savenergy-console";

/** Lets any entry point (hero dock, close) open the comparator in a given mode. */
export function openSavEnergy(mode: SavMode) {
  window.dispatchEvent(new CustomEvent<SavMode>(SAV_EVENT, { detail: mode }));
}

/**
 * «Analitza la factura»: obre el comparador en el mode indicat i hi SALTA directament, sense recórrer la presentació
 * animada (el hero i l'escena fixada de SavEnergy). Si la pàgina no té el comparador (pàgines legals), l'enllaç
 * normal porta a la home amb l'ancoratge. Retorna true si ha fet el salt.
 */
export function goToComparator(mode: SavMode, e?: { preventDefault: () => void }): boolean {
  const el = document.getElementById(SAV_CONSOLE_ID);
  if (!el) return false;
  e?.preventDefault();
  openSavEnergy(mode);
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o: { immediate: boolean; force: boolean }) => void } }).__lenis;
  const jump = () => {
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 88);
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
  };
  jump();
  // les escenes vinculades al scroll es recol·loquen en saltar: es torna a mesurar un cop pintat i s'ajusta
  requestAnimationFrame(() => requestAnimationFrame(() => { if (Math.abs(el.getBoundingClientRect().top - 88) > 2) jump(); }));
  history.replaceState(null, "", `#${SAV_CONSOLE_ID}`);
  el.focus({ preventScroll: true });
  return true;
}
