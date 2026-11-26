import type { Dictionary } from "../i18n/ca";
import { getDictionary, homePath, type Locale } from "../i18n/config";
import { Header } from "../home/Header";
import { Footer } from "../home/Footer";
import { CookieBanner, CookieSettingsButton } from "../consent/CookieBanner";
import { legal, type LegalKey } from "./content";

export const legalPaths: Record<LegalKey, Record<Locale, string>> = {
  "avis-legal": { ca: "/avis-legal", es: "/es/aviso-legal" },
  privacitat: { ca: "/privacitat", es: "/es/privacidad" },
  cookies: { ca: "/cookies", es: "/es/cookies" },
};

/** Static legal page in the A3 Signature Green language: the original texts, verbatim. */
export function LegalPage({ locale, page }: { locale: Locale; page: LegalKey }) {
  const t: Dictionary = getDictionary(locale);
  const doc = legal[locale][page];
  return (
    <div className="site sig s-legalsite">
      <a className="skip-link" href="#main">
        {t.common.skip}
      </a>
      <Header t={t} locale={locale} base={homePath(locale)} alt={legalPaths[page]} />
      <main id="main" className="s-legal">
        <div className="s-wrap s-legal__grid">
          <aside className="s-legal__aside">
            <a href={homePath(locale)} className="s-legal__back">
              ← {t.legalPage.back}
            </a>
            <nav aria-label={t.footer.legal}>
              <ul>
                {t.footer.legalLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} aria-current={l.href === legalPaths[page][locale] ? "page" : undefined}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <article className="s-legal__doc" lang={locale}>
            <h1 className="s-legal__title">{doc.title}</h1>
            <p className="s-legal__source">{t.legalPage.source}</p>
            {doc.sections.map((s) => (
              <section key={s.h} className="s-legal__sec">
                <h2>{s.h}</h2>
                {s.blocks.map((b, i) =>
                  "p" in b ? (
                    <p key={i}>{b.p}</p>
                  ) : "h3" in b ? (
                    <h3 key={i}>{b.h3}</h3>
                  ) : (
                    <ul key={i}>
                      {b.ul.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ))}
            {page === "cookies" ? (
              <p className="s-legal__settings">
                <CookieSettingsButton label={t.cookies.settings} className="s-btn s-btn--primary" />
              </p>
            ) : null}
          </article>
        </div>
      </main>
      <Footer t={t} locale={locale} />
      <CookieBanner t={t} policyHref={legalPaths.cookies[locale]} />
    </div>
  );
}
