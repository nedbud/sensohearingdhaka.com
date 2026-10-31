/**
 * The home page's slides, from the CMS.
 *
 * Same contract as the rest: the code's own slide is the floor, so a build
 * with no API renders exactly the hero we have today, and a CMS with an empty
 * slider does the same rather than showing a blank band.
 */
import type { Lang } from "@/lib/i18n";
import { CACHE, getData, sayOr, type Pair } from "@/routes/cms";

export type Slide = {
  image: string;
  /**
   * The same artwork cut for a portrait screen, if there is one.
   *
   * A wide poster with its subject against the right edge does not survive a
   * tall crop — the subject falls out of it. Where a second cut exists the
   * phone gets that one; where it does not, `image` serves both and the only
   * cost is a less considered crop.
   */
  portrait?: string;
  alt: Pair;
  eyebrow: Pair;
  title: Pair;
  lede: Pair;
  caption: Pair;
  captionLink: Pair;
  href: string;
  /**
   * The slide's own button, where it has one.
   *
   * Absent is the normal case and the shipped case: every slide below leaves
   * this out, and the band then carries the standing WhatsApp button, which
   * is where this clinic's enquiries actually arrive. A campaign that wants
   * to send people somewhere specific instead fills it in the panel and its
   * button takes that slot — one button in the band either way, because two
   * is how a hero stops having a primary action at all.
   */
  button?: { label: Pair; href: string };
};

interface SlideApi {
  image: string | null;
  portrait?: string | null;
  alt: Pair;
  eyebrow: Pair;
  title: Pair;
  lede: Pair;
  caption: Pair;
  caption_link: Pair;
  button_label?: Pair | null;
  button_href?: string | null;
  href: string | null;
}


/**
 * There is no shipped sequence any more.
 *
 * Seven slides used to live in this file — pictures, headlines and links,
 * a hundred and twenty lines of it — and `getSlides` fell back to them
 * whenever the panel's carousel screen was empty. It read as prudence and
 * worked as a trap: the panel said "no slides yet", the site showed seven,
 * and the two were both telling the truth. Uploading was broken for weeks
 * and nobody could see it, because the home page never looked wrong.
 *
 * So the panel is now the only source. An empty carousel screen means an
 * empty band, and `heroSection` leaves the band out rather than drawing a
 * full-screen nothing — a missing hero is visible in a second, which is
 * the point.
 *
 * The seven plates are still in `public/assets/Images/hero/`, because that
 * is where `pnpm import:hero` in the panel reads them from when it turns
 * them into rows the clinic can edit. They are the panel's seed now, not
 * the site's fallback.
 */

export async function getSlides(): Promise<Slide[]> {
  const api = await getData<SlideApi[]>("/api/senso/hero-slides", CACHE.EDITED);
  if (!api) return [];

  const slides = api
    .filter((s) => s.image)
    .map((s) => ({
      image: s.image as string,
      portrait: s.portrait || undefined,
      alt: s.alt ?? { bn: null, en: null },
      eyebrow: s.eyebrow ?? { bn: null, en: null },
      title: s.title ?? { bn: null, en: null },
      lede: s.lede ?? { bn: null, en: null },
      caption: s.caption ?? { bn: null, en: null },
      captionLink: s.caption_link ?? { bn: null, en: null },
      href: s.href || "/hearing-aids",
      /**
       * A button only where there is something to write on it.
       *
       * The label decides, not the link: a link with no words is a button
       * nobody can read, and the panel's own hint says as much. Either side
       * may be blank in the database, so the test is on the words in
       * whichever language was filled — `say` already falls back to the
       * other — and the link falls back to the slide's own.
       */
      ...buttonOn(s),
    }));

  return slides;
}

/** `{ button }` where the slide has one, `{}` where it does not. */
function buttonOn(s: SlideApi): { button?: { label: Pair; href: string } } {
  const label = s.button_label ?? { bn: null, en: null };
  const written = (label.bn ?? "").trim() || (label.en ?? "").trim();
  if (!written) return {};

  return {
    button: { label, href: s.button_href || s.href || "/hearing-aids" },
  };
}

/** One side of a pair, falling back to the dictionary's compiled string. */
export const slideText = (pair: Pair, lang: Lang, fallback: string): string =>
  sayOr(pair, lang, fallback);
