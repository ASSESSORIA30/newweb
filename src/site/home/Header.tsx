"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "../i18n/ca";
import { homePath, type Locale } from "../i18n/config";
import { captureAttribution } from "../lead/tracking";

export function Header({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    captureAttribution();
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Remember the language choice and keep the visitor's place on the page.
  const switchTo = (l: Locale) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    document.cookie = `a30_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    e.currentTarget.href = homePath(l) + window.location.hash;
  };

  return (
    <header className="s-header" data-solid={solid || undefined} data-open={open || undefined}>
      <div className="s-header__bar">
        <a href={homePath(locale)} className="s-logo" aria-label="Assessoria 3.0">
          <img src="/brand/logo-a30-64.png" srcSet="/brand/logo-a30-64.png 1x, /brand/logo-a30-128.png 2x" width={34} height={34} alt="" />
          <span translate="no">Assessoria 3.0</span>
        </a>
        <nav aria-label="Principal" className="s-nav">
          {t.nav.items.map((i) => (
            <a key={i.href} href={i.href}>
              {i.label}
            </a>
          ))}
        </nav>
        <div className="s-header__end">
          <div className="s-lang" role="group" aria-label={t.common.language}>
            {(["ca", "es"] as const).map((l) => (
              <a
                key={l}
                href={homePath(l)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                onClick={switchTo(l)}
              >
                {l === "ca" ? "CA" : "ES"}
              </a>
            ))}
          </div>
          <a href="#contacte" className="s-header__contact">
            {t.nav.contact}
          </a>
          <a href="#savenergy" className="s-btn s-btn--primary s-btn--sm">
            {t.nav.cta}
          </a>
          <button
            type="button"
            className="s-menu"
            aria-expanded={open}
            aria-controls="s-sheet"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t.common.menuClose : t.common.menuOpen}</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id="s-sheet" className="s-sheet" hidden={!open}>
        {t.nav.items.map((i) => (
          <a key={i.href} href={i.href} onClick={() => setOpen(false)}>
            {i.label}
          </a>
        ))}
        <a href="#contacte" onClick={() => setOpen(false)}>
          {t.nav.contact}
        </a>
      </div>
    </header>
  );
}
