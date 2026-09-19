import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import type { Clinic } from "@/routes/clinic";
import type { Slide } from "@/routes/slides";
import FactStrip from "@/components/ui/FactStrip";
import HeroSlider from "./HeroSlider";

/**
 * A product-led hero.
 *
 * This replaced a documentary photograph of a World Hearing Day rally. The
 * photograph was real and local, which is worth a great deal, but it was
 * another organisation's event and it was full of identifiable faces — not
 * something a business can put on its own cover.
 *
 * The device itself is the honest alternative and the one the category
 * actually leads with. It is the thing being sold, Senso is authorised to
 * show it, nobody's likeness is involved, and it answers the unspoken first
 * question every visitor has: what does this thing look like, and how big is
 * it really.
 *
 * It is a slider now, filled from the CMS. This wrapper stays a server
 * component and only the slider itself ships JavaScript, so the strip of
 * three figures underneath — which is the part people actually read — costs
 * nothing on a phone.
 */
export default function Hero({
  lang,
  clinic,
  d,
  slides,
  lowPrice,
  doors,
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
  slides: Slide[];
  lowPrice?: number;
  /** The three category cards. Passed in rather than imported so this file
   *  does not have to know what the catalogue holds. */
  doors?: React.ReactNode;
}) {
  return (
    <section>
      <HeroSlider lang={lang} clinic={clinic} d={d} slides={slides} />

      {/* The three doors sit directly under the hero, before the figures:
          they are the navigation, and the strip is the supporting detail. */}
      {doors}

      <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 lg:px-8">
        <FactStrip lang={lang} clinic={clinic} d={d} lowPrice={lowPrice} />
      </div>
    </section>
  );
}
