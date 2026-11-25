import { SmoothScroll } from "@/components/SmoothScroll";
import { getDictionary, type Locale } from "@/site/i18n/config";
import { Header } from "@/site/home/Header";
import { RefreshOnFonts } from "@/site/home/RefreshOnFonts";
import { JsonLd } from "@/site/seo/JsonLd";
import { Footer } from "@/site/home/Footer";
import { Audiences } from "@/site/home/Audiences";
import { Process } from "@/site/home/Process";
import { Value } from "@/site/home/Value";
import { Partners } from "@/site/home/Partners";
import { Trust } from "@/site/home/Trust";
import { Collaborators } from "@/site/home/Collaborators";
import { Close } from "@/site/home/Close";
import { SignatureHero } from "./SignatureHero";
import { SigSavEnergy } from "./SigSavEnergy";
import { SigServices } from "./SigServices";
import { SigReveal } from "./SigReveal";

/**
 * A3 Corporate · Signature. One continuous shot: night (the ring) → light (the bill) → night
 * (one energy, five forms) → light (people, process, proof) → night (collaborators, close).
 */
export function SignatureHome({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <div className="site sig">
      <a className="skip-link" href="#main">
        {t.common.skip}
      </a>
      <SmoothScroll />
      <RefreshOnFonts />
      <Header t={t} locale={locale} />
      <main id="main">
        <SignatureHero t={t} />
        <SigSavEnergy t={t} locale={locale} />
        <div className="g-chapter g-chapter--night">
          <SigReveal tone="night">
            <SigServices t={t} />
          </SigReveal>
        </div>
        <div className="g-chapter g-chapter--light">
          <SigReveal tone="light">
            <div>
              <Audiences t={t} />
              <Process t={t} />
            </div>
          </SigReveal>
        </div>
        <div className="g-chapter g-chapter--night">
          <SigReveal tone="night">
            <div>
              <Value t={t} />
            </div>
          </SigReveal>
        </div>
        <div className="g-chapter g-chapter--light">
          <SigReveal tone="light">
            <div>
              <Partners t={t} />
              <Trust t={t} locale={locale} />
            </div>
          </SigReveal>
        </div>
        <div className="g-chapter g-chapter--night">
          <SigReveal tone="night">
            <div>
              <Collaborators t={t} locale={locale} />
              <Close t={t} locale={locale} />
            </div>
          </SigReveal>
        </div>
      </main>
      <Footer t={t} locale={locale} />
      <JsonLd locale={locale} />
    </div>
  );
}
