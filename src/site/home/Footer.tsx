import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { company } from "../data/company";

export function Footer({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <footer className="s-footer">
      <div className="s-wrap">
        <div className="s-footer__top">
          <div className="s-footer__brand">
            <img src="/brand/logo-a30-64.png" srcSet="/brand/logo-a30-64.png 1x, /brand/logo-a30-128.png 2x" width={44} height={44} alt="Assessoria 3.0" loading="lazy" />
            <p>{t.footer.tagline}</p>
          </div>
          <div>
            <h2 className="s-footer__h">{t.footer.offices}</h2>
            <ul className="s-footer__offices">
              {company.offices.map((o) => (
                <li key={o.id}>
                  <b>{o.name[locale]}</b>
                  <span>
                    {o.street}, {o.zip} {o.locality}
                  </span>
                  <a href={`tel:${o.tel}`}>{o.phone}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="s-footer__h">{t.footer.contact}</h2>
            <ul className="s-footer__links">
              <li>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
              <li>
                <a href={company.whatsapp.href}>WhatsApp {company.whatsapp.label}</a>
              </li>
            </ul>
            <h2 className="s-footer__h">{t.footer.legal}</h2>
            <ul className="s-footer__links">
              {t.footer.legalLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="s-footer__bottom">
          <span translate="no">© 2026 Assessoria 3.0. {t.footer.rights}</span>
          <a href="/propostes">{t.footer.proposals}</a>
        </div>
      </div>
    </footer>
  );
}
