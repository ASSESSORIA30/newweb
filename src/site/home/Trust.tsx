import { Counter } from "@/components/Counter";
import { formatNumber } from "@/lib/content";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { evidenceStatus, testimonials } from "../data/company";

/**
 * Evidence is gated. While unverified: exact values as quoted on the current site, no count-up,
 * no display scale, a label on every block and every testimonial. Once verified: animated figures
 * and saving-green amounts. Case studies render only when real ones exist.
 */
export function Trust({ t, locale }: { t: Dictionary; locale: Locale }) {
  const statsPending = !evidenceStatus.stats.verified;
  const quotesPending = !evidenceStatus.testimonials.verified;
  return (
    <section className="s-trust" aria-labelledby="s-trust-title">
      <div className="s-wrap s-trust__grid">
        <div className="s-trust__head">
          <h2 id="s-trust-title" className="s-h2">
            {t.trust.title}
          </h2>
          <p className="s-muted">{t.trust.lede}</p>
        </div>
        <div className="s-trust__body">
          <dl className="s-stats" data-pending={statsPending || undefined}>
            {t.trust.stats.map((s) => (
              <div key={s.label}>
                <dd>
                  {statsPending ? (
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {s.prefix}
                      {formatNumber(s.value)}
                      {s.suffix}
                    </span>
                  ) : (
                    <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  )}
                </dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
          {statsPending ? <p className="s-pending-line"><span className="s-sim">{t.common.pending}</span> {t.common.fromCurrentSite}</p> : null}
          <div className="s-quotes" data-pending={quotesPending || undefined}>
            {testimonials.map((q) => (
              <figure key={q.name}>
                <blockquote>
                  <p>“{q.quote[locale]}”</p>
                </blockquote>
                <figcaption>
                  <span>
                    {q.name} · {q.city}
                  </span>
                  <b className="s-measure">−{q.saving}</b>
                  {quotesPending ? <span className="s-sim">{t.common.pending}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
