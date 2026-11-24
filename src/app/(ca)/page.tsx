import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geologica/full.css";
import "@fontsource/martian-mono/400.css";
import "@/site/site.css";
import { Home } from "@/site/home/Home";
import { homeMetadata } from "@/site/seo/metadata";

export const metadata: Metadata = homeMetadata("ca");
export const viewport: Viewport = { themeColor: "#FFFFFF" };

export default function Page() {
  return <Home locale="ca" />;
}
