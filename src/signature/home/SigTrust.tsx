"use client";

import { useState } from "react";
import type { Dictionary } from "@/site/i18n/ca";
import type { Locale } from "@/site/i18n/config";
import { formatNumber } from "@/lib/content";
import { evidenceStatus, testimonials } from "@/site/data/company";

/** One editorial sentence of figures and one large quote at a time. Every unverified item stays labelled. */
export function SigTrust({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [i, setI] = useState(0);
  const pendingStats = !evidenceStatus.stats.verified;
  const pendingQuotes = !evidenceStatus.testimonials.verified;
  const q = testimonials[i];
  return (
    <section className="g-trust" aria-labelledby="g-trust-title">
      <div className="s-wrap">
        <h2 id="g-trust-title" className="g-trust__title">
          {t.trust.title}
        </h2>
        <p className="g-trust__figures">
          {t.trust.stats.map((s, k) => (
            <span key={s.label}>
              <b>
                {s.prefix}
                {formatNumber(s.value)}
                {s.suffix}
              </b>{" "}
              {s.label}
              {k < t.trust.stats.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
        {pendingStats ? (
          <p className="g-trust__pending">
            <span className="s-sim">{t.common.pending}</span> {t.common.fromCurrentSite}
          </p>
        ) : null}
        <figure className="g-quote" key={i} aria-live="polite">
          <blockquote>
            <p>“{q.quote[locale]}”</p>
          </blockquote>
          <figcaption>
            <span>
              {q.name} · {q.city} · <span className="s-measure">−{q.saving}</span>
            </span>
            {pendingQuotes ? <span className="s-sim">{t.common.pending}</span> : null}
          </figcaption>
        </figure>
        <div className="g-quote__nav" role="group" aria-label={t.trust.title}>
          {testimonials.map((x, n) => (
            <button key={x.name} type="button" aria-pressed={n === i} onClick={() => setI(n)}>
              {x.city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
