import type { Metadata } from "next";
import { getDictionary, homePath, indexable, siteUrl, type Locale } from "../i18n/config";

export function homeMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: homePath(locale),
      languages: { "ca-ES": "/", "es-ES": "/es", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "Assessoria 3.0",
      locale: locale === "ca" ? "ca_ES" : "es_ES",
      alternateLocale: locale === "ca" ? ["es_ES"] : ["ca_ES"],
      url: homePath(locale),
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}
