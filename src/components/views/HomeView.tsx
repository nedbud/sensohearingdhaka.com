import Hero from "@/components/Home/heroSection";
import BestProducts from "@/components/Home/bestProductsSection";
import DoorsSection from "@/components/Home/doorsSection";
import TestsSection from "@/components/Home/testsSection";
import NumberBand from "@/components/ui/NumberBand";
import TrustBand from "@/components/Home/trustBand";
import FaqSection from "@/components/Home/faqSection";
import VisitSection from "@/components/Home/visitSection";
import { FaqJsonLd, ProductRangeJsonLd } from "@/components/ui/JsonLd";
import { getBestProducts, getProducts, priceStats, ACCESSORY_SERIES } from "@/routes/product";
import type { Lang } from "@/lib/i18n";
import { getSite } from "@/routes/site";
import { getFaq } from "@/routes/faq";

/** How many questions appear on the home page, and therefore how many are
 *  marked up. Google asks that FAQ structured data be visible on the page. */
const FAQ_ON_HOME = 6;

export default async function HomeView({ lang }: { lang: Lang }) {
  const [{ clinic, d, details, slides }, best, all, faq] = await Promise.all([
    getSite(lang),
    getBestProducts(),
    getProducts(),
    getFaq(lang),
  ]);

  const devices = all.filter((p) => !ACCESSORY_SERIES.includes(p.series));
  const shown = (best.length ? best : devices).slice(0, 6);
  const stats = priceStats(all);

  return (
    <>
      <FaqJsonLd
        items={faq
          .slice(0, FAQ_ON_HOME)
          .map((f) => ({ question: f.question, answer: f.answer }))}
      />
      {stats && (
        <ProductRangeJsonLd low={stats.low} high={stats.high} count={stats.count} />
      )}

      <Hero
        lang={lang}
        clinic={clinic}
        d={d}
        slides={slides}
        lowPrice={stats?.low}
        doors={<DoorsSection lang={lang} clinic={clinic} d={d} models={devices.length} />}
      />
      <BestProducts products={shown} lang={lang} d={d} />
      <NumberBand lang={lang} clinic={clinic} d={d} tests={details.tests} />
      <TestsSection
        lang={lang}
        clinic={clinic}
        d={d}
        tests={details.tests}
        parts={details.parts}
      />
      <TrustBand lang={lang} clinic={clinic} d={d} team={details.team} />
      <VisitSection lang={lang} clinic={clinic} d={d} />
      <FaqSection lang={lang} d={d} items={faq.slice(0, FAQ_ON_HOME)} />
    </>
  );
}
