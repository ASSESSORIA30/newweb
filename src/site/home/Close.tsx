"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { company } from "../data/company";
import { track } from "../lead/tracking";
import { goToComparator } from "@/signature/home/savenergyBus";
import { INTENT_EVENT, type LeadIntent } from "../lead/intent";
import { Consent, Field, FormDone, Honeypot, SubmitRow, splitContact, useLeadForm } from "../ui/forms";

export function Close({ t, locale }: { t: Dictionary; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const f = t.close.form;
  const [who, setWho] = useState("");
  const [study, setStudy] = useState<LeadIntent | null>(null);
  const [interest, setInterest] = useState("");
  const isBusiness = who === f.whoOptions[1];
  const { onSubmit, errors, status, sendError, reset } = useLeadForm({
    kind: () => (study ? "study" : isBusiness ? "business" : "contact"),
    locale,
    t,
    rules: { name: "required", contact: "phoneOrEmail" },
    map: (d) => {
      const g = (k: string) => String(d.get(k) ?? "").trim();
      return {
        contact: {
          name: g("name"),
          ...splitContact(g("contact")),
          company: isBusiness ? g("company") || undefined : undefined,
          service: g("interest") || study?.service || undefined,
          message: g("message") || undefined,
        },
        clientType: who ? (isBusiness ? "empresa" : "particular") : undefined,
        details: study ? [[f.studyTag, study.service ?? "—"]] : [],
      };
    },
  });

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<LeadIntent>).detail;
      setStudy(d);
      if (d.service && f.interests.includes(d.service)) setInterest(d.service);
    };
    window.addEventListener(INTENT_EVENT, on);
    return () => window.removeEventListener(INTENT_EVENT, on);
  }, [f.interests]);

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
            <a href="#savenergy-console" className="s-btn s-btn--on-navy" onClick={(e) => goToComparator("upload", e)}>
              {t.close.compare}
            </a>
            <a href={company.whatsapp.href} className="s-btn s-btn--ghost-navy" onClick={() => track("whatsapp_click", { from: "close" })}>
              {t.close.whatsapp} · {company.whatsapp.label}
            </a>
          </div>
        </div>
        <div className="s-close__panel">
          {status === "done" ? (
            <FormDone
              text={f.done}
              t={t}
              onAgain={() => {
                reset();
                setStudy(null);
                setWho("");
                setInterest("");
              }}
            />
          ) : (
            <form onSubmit={onSubmit} noValidate className="s-form">
              <h3>{f.title}</h3>
              {study ? (
                <p className="s-form__tag">
                  <span>{f.studyTag}</span>
                  <button type="button" className="s-textbtn" onClick={() => setStudy(null)}>
                    {f.studyClear}
                  </button>
                </p>
              ) : null}
              <Honeypot />
              <div className="s-form__row">
                <Field t={t} label={f.name} name="name" autoComplete="name" error={errors.name} />
                <Field t={t} label={f.contact} name="contact" autoComplete="email" inputMode="email" error={errors.contact} />
              </div>
              <div className="s-form__row">
                <Field t={t} label={f.who} name="who" as="select" options={f.whoOptions} optional value={who} onValue={setWho} />
                <Field t={t} label={f.interest} name="interest" as="select" options={f.interests} optional value={interest} onValue={setInterest} />
              </div>
              {isBusiness ? <Field t={t} label={f.company} name="company" autoComplete="organization" optional /> : null}
              <Field t={t} label={f.message} name="message" as="textarea" optional />
              <Consent t={t} error={errors.privacy} privacyHref={t.footer.legalLinks[1].href} legalHref={t.footer.legalLinks[0].href} />
              <SubmitRow t={t} label={f.submit} status={status} sendError={sendError} className="s-btn s-btn--on-navy" />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
