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
  alt: Pair;
  eyebrow: Pair;
  title: Pair;
  lede: Pair;
  caption: Pair;
  captionLink: Pair;
  href: string;
};

interface SlideApi {
  image: string | null;
  alt: Pair;
  eyebrow: Pair;
  title: Pair;
  lede: Pair;
  caption: Pair;
  caption_link: Pair;
  href: string | null;
}


/**
 * The slide the site shipped with. Its words come from the dictionary rather
 * than being repeated here, so a CMS that has copy but no slides still gets
 * the edited headline.
 */
export function fallbackSlide(): Slide {
  return {
    image: "/assets/Images/latest_products/ReSound_OMNIA_461_RIE.webp",
    alt: { bn: null, en: null },
    eyebrow: { bn: null, en: null },
    title: { bn: null, en: null },
    lede: { bn: null, en: null },
    caption: { bn: null, en: null },
    captionLink: { bn: null, en: null },
    href: "/hearing-aids",
  };
}

export async function getSlides(): Promise<Slide[]> {
  const api = await getData<SlideApi[]>("/api/senso/hero-slides", CACHE.EDITED);
  if (!api) return [fallbackSlide()];

  const slides = api
    .filter((s) => s.image)
    .map((s) => ({
      image: s.image as string,
      alt: s.alt ?? { bn: null, en: null },
      eyebrow: s.eyebrow ?? { bn: null, en: null },
      title: s.title ?? { bn: null, en: null },
      lede: s.lede ?? { bn: null, en: null },
      caption: s.caption ?? { bn: null, en: null },
      captionLink: s.caption_link ?? { bn: null, en: null },
      href: s.href || "/hearing-aids",
    }));

  return slides.length ? slides : [fallbackSlide()];
}

/** One side of a pair, falling back to the dictionary's compiled string. */
export const slideText = (pair: Pair, lang: Lang, fallback: string): string =>
  sayOr(pair, lang, fallback);
