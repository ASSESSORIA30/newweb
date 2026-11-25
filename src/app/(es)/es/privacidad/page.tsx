import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geologica/full.css";
import "@fontsource/martian-mono/400.css";
import "@fontsource-variable/anybody/standard.css";
import "@/site/site.css";
import "@/signature/signature.css";
import { LegalPage, legalPaths } from "@/site/legal/LegalPage";
import { legal } from "@/site/legal/content";
import { indexable, siteUrl } from "@/site/i18n/config";

export const metadata: Metadata = {
  title: `${legal.es["privacitat"].title} · Assessoria 3.0`,
  alternates: { canonical: `${siteUrl}${legalPaths["privacitat"].es}`, languages: { ca: legalPaths["privacitat"].ca, es: legalPaths["privacitat"].es } },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#fafcfb" };

export default function Page() {
  return <LegalPage locale="es" page="privacitat" />;
}
