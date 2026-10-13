import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getClinic } from "@/routes/clinic";
import type { Dict } from "@/routes/dict";

/**
 * A page's Open Graph block — whole, every time.
 *
 * Next does not merge `openGraph` field by field. A page that declares
 *
 *     openGraph: { locale: "bn_BD" }
 *
 * does not add a locale to the layout's block; it REPLACES the layout's block
 * with that one line. Eight pages did exactly that, and the cost was invisible
 * in the code and very visible everywhere else: the home page in both
 * languages, both About pages, both privacy notices and the English catalogue
 * shipped with no og:image, no og:title, no og:description and no og:site_name.
 *
 * Which matters here more than on most sites. This clinic's traffic arrives
 * through WhatsApp and Messenger — the rebuild started from a folder of those
 * conversations — and a link shared there with no image renders as a grey box
 * with a URL under it. The layout had the image; the pages threw it away.
 *
 * So there is one function, it always returns the complete block, and a page
 * overrides only what is genuinely its own. The rule to remember: never write
 * a bare `openGraph: { ... }` in a page again.
 */
export type OpenGraphOverrides = {
  /** The share headline, when the page's own is better than the site's. */
  title?: string;
  description?: string;
  /** The page's path, language prefix included: "/en/about-us". */
  path?: string;
  /** A product photograph, say. Falls back to the site's share card. */
  images?: { url: string }[];
};

export async function pageOpenGraph(
  lang: Lang,
  d: Dict,
  over: OpenGraphOverrides = {}
): Promise<Metadata["openGraph"]> {
  // Deduplicated against every other read of the clinic in the same render,
  // so asking for it here costs nothing.
  const clinic = await getClinic();
  const base = clinic.url || SITE.url;
  const bn = lang === "bn";

  return {
    type: "website",
    locale: bn ? "bn_BD" : "en_US",
    alternateLocale: [bn ? "en_US" : "bn_BD"],
    siteName: clinic.name,
    url: over.path ? `${base}${over.path}` : bn ? base : `${base}/en`,
    title: over.title ?? d.seo.ogTitle,
    description: over.description ?? d.seo.ogDescription,
    images: over.images ?? [
      { url: "/og.png", width: 1200, height: 630, alt: d.seo.ogImageAlt },
    ],
  };
}
