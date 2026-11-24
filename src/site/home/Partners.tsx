import type { Dictionary } from "../i18n/ca";
import { partners } from "../data/company";

/** Renders only confirmed partners with authorised artwork. Until then, an honest, designed placeholder. */
export function Partners({ t }: { t: Dictionary }) {
  return (
    <section className="s-partners" aria-labelledby="s-partners-title">
      <div className="s-wrap s-partners__grid">
        <div>
          <h2 id="s-partners-title" className="s-h3">
            {t.partners.title}
          </h2>
          <p className="s-muted">{t.partners.lede}</p>
        </div>
        {partners.length ? (
          <ul className="s-partners__logos">
            {partners.map((p) => (
              <li key={p.name}>
                <img src={p.logo} alt={p.name} width={p.width} height={p.height} loading="lazy" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="s-partners__pending">
            <ul aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} />
              ))}
            </ul>
            <p>
              <span className="s-sim">{t.common.pending}</span> {t.partners.pending}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
