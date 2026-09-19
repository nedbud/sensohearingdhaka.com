/**
 * Everything a page needs about the site, read once.
 *
 * Five files were each assembling the same `Promise.all` by hand — RootShell,
 * HomeView, AboutView, ProductsView and both product pages — and each one had
 * drifted: the About page fetched the clinic and the dictionary but not the
 * slides, the product pages fetched the copy book but built the clinic record
 * separately. Adding a sixth thing meant finding all five and remembering
 * which of them needed it.
 *
 * `getSite(lang)` is the one list. A page destructures what it uses and
 * ignores the rest.
 *
 * This costs nothing to call twice. Next deduplicates `fetch` by URL within a
 * single render, so the shell and the view below it asking for the same site
 * is one request, not two — which is also why this can stay a plain function
 * rather than a context or a cache of our own.
 *
 * What is deliberately NOT here: the catalogue. Products are fetched by the
 * pages that show products, because the About page has no business paying for
 * a 109-item list, and `generateStaticParams` needs them before any of this
 * exists.
 */
import type { Lang } from "@/lib/i18n";
import { getClinic, type Clinic } from "@/routes/clinic";
import { getDict, type Dict } from "@/routes/dict";
import { getDetails, type Details } from "@/routes/details";
import { getSlides, type Slide } from "@/routes/slides";
import { getCopy, type Copy } from "@/routes/siteCopy";

export type Site = {
  lang: Lang;
  /** The clinic's own record: address, phones, hours, what it promises. */
  clinic: Clinic;
  /** Every label and sentence, with the CMS laid over the compiled defaults. */
  d: Dict;
  /** Who sits when, what a test costs, what a part costs. */
  details: Details;
  /** The home page's slider. */
  slides: Slide[];
  /**
   * The product pages' own copy book, keyed by dotted string.
   *
   * Separate from `d` because it is reached differently: `d` is a typed shape
   * the compiler checks, this is a bag of keys looked up at runtime with the
   * compiled text passed in at the call site.
   */
  copy: Copy;
};

export async function getSite(lang: Lang): Promise<Site> {
  const [clinic, d, details, slides, copy] = await Promise.all([
    getClinic(),
    getDict(lang),
    getDetails(),
    getSlides(),
    getCopy(),
  ]);

  return { lang, clinic, d, details, slides, copy };
}
