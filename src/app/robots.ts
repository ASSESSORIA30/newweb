import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/site/i18n/config";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/propostes", "/concept-a", "/concept-b", "/concept-c"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
