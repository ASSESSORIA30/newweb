import ca, { type Dictionary } from "./ca";
import es from "./es";

export const locales = ["ca", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ca";

/**
 * Geologica kerns "l·l" so tightly that the punt volat merges with the l's ("CoHabora" at small sizes).
 * Hair spaces around it restore the Catalan ela geminada visually. Metadata keeps the plain text for search.
 */
const HAIR = "\u200A";
function openGeminada<T>(v: T): T {
  if (typeof v === "string") return v.replace(/l·l/g, `l${HAIR}·${HAIR}l`).replace(/L·L/g, `L${HAIR}·${HAIR}L`) as T;
  if (Array.isArray(v)) return v.map(openGeminada) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "meta" || k === "title" || k === "titleB" ? x : openGeminada(x)])) as T;
  return v;
}

const dictionaries: Record<Locale, Dictionary> = { ca: openGeminada(ca), es: openGeminada(es) };
export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Path of the home for a locale. Catalan is the root; Spanish lives under /es. */
export const homePath = (locale: Locale) => (locale === "ca" ? "/" : "/es");

/** Public site URL used for canonical, hreflang, sitemap and JSON-LD. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.assessoria30.com").replace(/\/$/, "");

/**
 * Indexing is OFF unless explicitly enabled for the real production domain.
 * Preview and provisional vercel.app deployments are never indexed.
 */
export const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
