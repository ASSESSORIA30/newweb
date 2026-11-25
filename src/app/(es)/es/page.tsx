import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geologica/full.css";
import "@fontsource/martian-mono/400.css";
import "@fontsource-variable/anybody/standard.css";
import "@/site/site.css";
import "@/signature/signature.css";
import { SignatureHome } from "@/signature/home/SignatureHome";
import { homeMetadata } from "@/site/seo/metadata";

export const metadata: Metadata = homeMetadata("es");
export const viewport: Viewport = { themeColor: "#060d22" };

export default function Page() {
  return <SignatureHome locale="es" />;
}
