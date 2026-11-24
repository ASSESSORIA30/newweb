import type { Metadata, Viewport } from "next";
import "../globals.css";
import { indexable } from "@/site/i18n/config";

export const metadata: Metadata = {
  title: { default: "Assessoria 3.0", template: "%s · Assessoria 3.0" },
  robots: indexable ? undefined : { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
