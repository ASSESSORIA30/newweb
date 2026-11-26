import Link from "next/link";
import { ViewTransition } from "react";

const items = [
  { href: "/concept-a", key: "A", label: "Energy Intelligence" },
  { href: "/concept-b", key: "B", label: "Premium Minimal" },
  { href: "/concept-c", key: "C", label: "Energy Revolution" },
] as const;

/** Floating prototype chrome: lets the client jump between the three proposals. Not part of the designs. */
export function ConceptSwitcher({ current }: { current: "A" | "B" | "C" }) {
  return (
    <nav aria-label="Propostes" className="proto-switcher" translate="no">
      <Link href="/propostes" transitionTypes={["nav-back"]} className="proto-switcher__home">
        Propostes
      </Link>
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          aria-current={it.key === current ? "page" : undefined}
          transitionTypes={[it.key > current ? "nav-forward" : "nav-back"]}
          title={it.label}
        >
          {it.key === current ? (
            <ViewTransition name={`concept-key-${it.key}`} share="morph" default="none">
              <span>{it.key}</span>
            </ViewTransition>
          ) : (
            it.key
          )}
        </Link>
      ))}
    </nav>
  );
}
