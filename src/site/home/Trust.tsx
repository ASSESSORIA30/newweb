import { Counter } from "@/components/Counter";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { evidenceStatus, testimonials } from "../data/company";

/** Evidence is gated: unverified data always carries the pending label. */
export function Trust({ t, locale }: { t: Dictionary; locale: Locale }) {
  const statsPending = !evidenceStatus.stats.verified;
  const quotesPending = !evidenceStatus.testimonials.verified;
  return (
    <section className="s-trust" aria-labelledby="s-trust-title">
      <div className="s-wrap">
        <div className="s-trust__head">
          <h2 id="s-trust-title" className="s-h2">
            {t.trust.title}
          </h2>
          {statsPending || quotesPending ? (
            <p className="s-trust__note">
              <span className="s-sim">{t.common.pending}</span> {t.trust.lede}
            </p>
          ) : null}
        </div>
        <dl className="s-stats" data-pending={statsPending || undefined}>
          {t.trust.stats.map((s) => (
            <div key={s.label}>
              <dd>
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </dd>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>
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
              </figcaption>
            </figure>
          ))}
          <figure className="s-quotes__case">
            <p className="s-quotes__case-title">{t.trust.cases}</p>
            <p className="s-muted">{t.trust.casesPending}</p>
          </figure>
        </div>
      </div>
    </section>
  );
}
