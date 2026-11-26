/**
 * WebGL and canvas cannot read CSS variables, so they read them here: the colour tokens in
 * site.css stay the single source of truth for every surface, shader and particle.
 */
export function readTokens(el: Element = document.querySelector(".site") ?? document.documentElement) {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    surface: v("--white-natural", "#fafcfb"),
    tint: v("--green-50", "#edf6f0"),
    tint2: v("--green-100", "#dcede2"),
    soft: v("--green-200", "#a8dfbd"),
    mid: v("--green-300", "#7cc79f"),
    accent: v("--green-500", "#38a879"),
    brand: v("--green-700", "#176b4d"),
    brandDeep: v("--green-800", "#145a41"),
    ink: v("--green-900", "#12382d"),
    deep: v("--green-950", "#0b241c"),
  };
}

/** "#rrggbb" → "r,g,b" for rgba() strings in canvas code. */
export function rgbList(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
