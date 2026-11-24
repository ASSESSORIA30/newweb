"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { company } from "../data/company";
import { track } from "../lead/tracking";
import { Consent, Field, FormDone, useLeadForm } from "../ui/forms";

export function Close({ t, locale }: { t: Dictionary; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const f = t.close.form;
  const { onSubmit, errors, status, refId, reset } = useLeadForm({
    kind: "contact",
    locale,
    t,
    rules: { name: "required", contact: "phoneOrEmail" },
  });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".s-close__title", { type: "words", mask: "words" });
        gsap.from(split.words, {
          yPercent: 100,
          duration: 1,
          ease: "expo.out",
          stagger: { each: 0.05, ease: "power1.in" },
          scrollTrigger: { trigger: ".s-close__title", start: "top 80%", once: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contacte" data-tone="navy" className="s-close" aria-labelledby="s-close-title">
      <div className="s-wrap s-close__grid">
        <div className="s-close__copy">
          <h2 id="s-close-title" className="s-close__title">
            {t.close.title}
          </h2>
          <p className="s-lede">{t.close.lede}</p>
          <div className="s-close__actions">
            <a href="#savenergy" className="s-btn s-btn--on-navy">
              {t.close.compare}
            </a>
            <a href={company.whatsapp.href} className="s-btn s-btn--ghost-navy" onClick={() => track("whatsapp_click", { from: "close" })}>
              {t.close.whatsapp} · {company.whatsapp.label}
            </a>
          </div>
        </div>
        <div className="s-close__panel">
          {status === "done" ? (
            <FormDone text={f.done} refId={refId} t={t} onAgain={reset} againLabel={t.common.close} />
          ) : (
            <form onSubmit={onSubmit} noValidate className="s-form">
              <h3>{f.title}</h3>
              <div className="s-form__row">
                <Field t={t} label={f.name} name="name" autoComplete="name" error={errors.name} />
                <Field t={t} label={f.contact} name="contact" autoComplete="email" error={errors.contact} />
              </div>
              <div className="s-form__row">
                <Field t={t} label={f.who} name="who" as="select" options={f.whoOptions} optional />
                <Field t={t} label={f.interest} name="interest" as="select" options={f.interests} optional />
              </div>
              <Field t={t} label={f.message} name="message" as="textarea" optional />
              <Consent t={t} error={errors.privacy} privacyHref={t.footer.legalLinks[1].href} />
              <button type="submit" className="s-btn s-btn--on-navy" disabled={status === "sending"}>
                {status === "sending" ? t.common.sending : f.submit}
              </button>
              <p className="s-form__sim">{t.common.simulationNote}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
