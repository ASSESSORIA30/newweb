import ca, { type Dictionary } from "./ca";
import es from "./es";

export const locales = ["ca", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ca";

const dictionaries: Record<Locale, Dictionary> = { ca, es };
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
