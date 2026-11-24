import { ViewTransition } from "react";

/** Directional page transition, keyed by the types set on <Link transitionTypes>. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "page-from-right", "nav-back": "page-from-left", default: "none" }}
      exit={{ "nav-forward": "page-to-left", "nav-back": "page-to-right", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
