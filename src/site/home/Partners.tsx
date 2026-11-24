import type { Dictionary } from "../i18n/ca";
import { partners } from "../data/company";

/** Renders only confirmed partners with authorised artwork. Until then: one honest sentence, no fake logo wall. */
export function Partners({ t }: { t: Dictionary }) {
  return (
    <section className="s-partners" aria-labelledby="s-partners-title">
      <div className="s-wrap s-partners__grid">
        <h2 id="s-partners-title" className="s-h3">
          {t.partners.title}
        </h2>
        {partners.length ? (
          <ul className="s-partners__logos">
            {partners.map((p) => (
              <li key={p.name}>
                <img src={p.logo} alt={p.name} width={p.width} height={p.height} loading="lazy" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="s-partners__pending">
            <span className="s-sim">{t.common.pending}</span> {t.partners.lede}
          </p>
        )}
      </div>
    </section>
  );
}
