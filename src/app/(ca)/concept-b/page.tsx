import type { Metadata, Viewport } from "next";
import { ConceptB } from "@/concepts/b/ConceptB";
import { ConceptSwitcher } from "@/components/ConceptSwitcher";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = { title: "B · Premium Minimal" };
export const viewport: Viewport = { themeColor: "#0a0b0a" };

export default function Page() {
  return (
    <>
      <PageTransition>
        <div>
          <ConceptB />
        </div>
      </PageTransition>
      <ConceptSwitcher current="B" />
    </>
  );
}
