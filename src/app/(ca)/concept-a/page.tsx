import type { Metadata, Viewport } from "next";
import { ConceptA } from "@/concepts/a/ConceptA";
import { ConceptSwitcher } from "@/components/ConceptSwitcher";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = { title: "A · Energy Intelligence" };
export const viewport: Viewport = { themeColor: "#040706" };

export default function Page() {
  return (
    <>
      <PageTransition>
        <div>
          <ConceptA />
        </div>
      </PageTransition>
      <ConceptSwitcher current="A" />
    </>
  );
}
