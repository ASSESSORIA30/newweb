import type { MetadataRoute } from "next";
import { siteUrl } from "@/site/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
