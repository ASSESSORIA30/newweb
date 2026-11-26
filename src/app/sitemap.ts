import type { MetadataRoute } from "next";
import { siteUrl } from "@/site/i18n/config";
import { legalPaths } from "@/site/legal/LegalPage";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalEntries: MetadataRoute.Sitemap = Object.values(legalPaths).flatMap((p) =>
    (["ca", "es"] as const).map((l) => ({
      url: `${siteUrl}${p[l]}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
      alternates: { languages: { "ca-ES": `${siteUrl}${p.ca}`, "es-ES": `${siteUrl}${p.es}` } },
    })),
  );
  return [
    ...legalEntries,
    {
      url: `${siteUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { "ca-ES": `${siteUrl}/`, "es-ES": `${siteUrl}/es` } },
    },
    {
      url: `${siteUrl}/es`,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: { "ca-ES": `${siteUrl}/`, "es-ES": `${siteUrl}/es` } },
    },
  ];
}
