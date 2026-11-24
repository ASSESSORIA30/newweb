import { company } from "../data/company";
import { getDictionary, homePath, siteUrl, type Locale } from "../i18n/config";

/** Organization + one LocalBusiness per real office (local SEO for Lleida, Barcelona, Girona, Tarragona). */
export function JsonLd({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const url = siteUrl + homePath(locale);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#org`,
        name: company.name,
        url,
        logo: `${siteUrl}/brand/logo-a30-128.png`,
        email: company.email,
        description: t.meta.description,
        areaServed: "Catalunya",
        knowsLanguage: ["ca", "es"],
      },
      ...company.offices.map((o) => ({
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#office-${o.id}`,
        name: `${company.name} · ${o.city}`,
        parentOrganization: { "@id": `${siteUrl}/#org` },
        telephone: o.tel,
        email: company.email,
        url,
        address: {
          "@type": "PostalAddress",
          streetAddress: o.street,
          postalCode: o.zip,
          addressLocality: o.locality,
          addressRegion: o.region,
          addressCountry: "ES",
        },
      })),
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#site`,
        url: siteUrl,
        name: company.name,
        inLanguage: locale === "ca" ? "ca-ES" : "es-ES",
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
  );
}
