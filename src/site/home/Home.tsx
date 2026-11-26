import { SmoothScroll } from "@/components/SmoothScroll";
import { getDictionary, type Locale } from "../i18n/config";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { SavEnergy } from "./SavEnergy";
import { Services } from "./Services";
import { Audiences } from "./Audiences";
import { Process } from "./Process";
import { Value } from "./Value";
import { Partners } from "./Partners";
import { Trust } from "./Trust";
import { Collaborators } from "./Collaborators";
import { Close } from "./Close";
import { Footer } from "./Footer";
import { JsonLd } from "../seo/JsonLd";
import { RefreshOnFonts } from "./RefreshOnFonts";

export function Home({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <div className="site">
      <a className="skip-link" href="#main">
        {t.common.skip}
      </a>
      <SmoothScroll />
      <RefreshOnFonts />
      <Header t={t} locale={locale} />
      <main id="main">
        <Hero t={t} />
        <SavEnergy t={t} locale={locale} />
        <Services t={t} />
        <Audiences t={t} />
        <Process t={t} />
        <Value t={t} />
        <Partners t={t} />
        <Trust t={t} locale={locale} />
        <Collaborators t={t} locale={locale} />
        <Close t={t} locale={locale} />
      </main>
      <Footer t={t} locale={locale} />
      <JsonLd locale={locale} />
    </div>
  );
}
