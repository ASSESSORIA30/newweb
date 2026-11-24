"use client";

import { useState } from "react";
import type { Dictionary } from "../i18n/ca";
import type { Locale } from "../i18n/config";
import { Consent, Field, FormDone, useLeadForm } from "../ui/forms";

export function Collaborators({ t, locale }: { t: Dictionary; locale: Locale }) {
  const c = t.collaborators;
  const [profile, setProfile] = useState<string>(c.profiles[0]);
  const { onSubmit, errors, status, refId, reset } = useLeadForm({
    kind: "collaborator",
    locale,
    t,
    rules: { name: "required", phone: "phone", email: "email" },
  });

  return (
    <section id="collaboradors" className="s-collab" aria-labelledby="s-collab-title">
      <div className="s-wrap s-collab__grid">
        <div className="s-collab__copy">
          <h2 id="s-collab-title" className="s-h2">
            {c.title}
          </h2>
          <p className="s-lede">{c.lede}</p>
          <fieldset className="s-chipset">
            <legend>{c.profilesLabel}</legend>
            {c.profiles.map((p) => (
              <label key={p} data-on={profile === p || undefined}>
                <input type="radio" name="profile-pick" value={p} checked={profile === p} onChange={() => setProfile(p)} />
                {p}
              </label>
            ))}
          </fieldset>
          <ul className="s-collab__benefits">
            {c.benefits.map((b) => (
              <li key={b.t}>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="s-collab__panel">
          {status === "done" ? (
            <FormDone text={c.form.done} refId={refId} t={t} onAgain={reset} againLabel={t.common.close} />
          ) : (
            <form onSubmit={onSubmit} noValidate className="s-form">
              <h3>{c.form.title}</h3>
              <input type="hidden" name="profile" value={profile} />
              <Field t={t} label={c.form.name} name="name" autoComplete="name" error={errors.name} />
              <Field t={t} label={c.form.company} name="company" autoComplete="organization" optional />
              <div className="s-form__row">
                <Field t={t} label={c.form.phone} name="phone" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone} />
                <Field t={t} label={c.form.email} name="email" type="email" autoComplete="email" error={errors.email} />
              </div>
              <Field t={t} label={c.form.town} name="town" autoComplete="address-level2" optional />
              <Field t={t} label={c.form.message} name="message" as="textarea" optional />
              <Consent t={t} error={errors.privacy} privacyHref={t.footer.legalLinks[1].href} />
              <button type="submit" className="s-btn s-btn--on-navy" disabled={status === "sending"}>
                {status === "sending" ? t.common.sending : c.form.submit}
              </button>
              <p className="s-form__sim">{t.common.simulationNote}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
