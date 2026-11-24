import type { Metadata, Viewport } from "next";
import { ConceptC } from "@/concepts/c/ConceptC";
import { ConceptSwitcher } from "@/components/ConceptSwitcher";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = { title: "C · Energy Revolution" };
export const viewport: Viewport = { themeColor: "#f7f8f5" };

export default function Page() {
  return (
    <>
      <PageTransition>
        <div>
          <ConceptC />
        </div>
      </PageTransition>
      <ConceptSwitcher current="C" />
    </>
  );
}
