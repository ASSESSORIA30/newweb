import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Assessoria 3.0 · Propostes de disseny",
    template: "%s · Assessoria 3.0",
  },
  description: "Prototips navegables de la nova web d’Assessoria 3.0 i del comparador SavEnergy IA.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
