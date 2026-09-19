import { NextResponse } from "next/server";
import { getProducts } from "@/routes/product";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

/**
 * Every URL now has a Bangla and an English version, and each entry declares
 * the other through xhtml:link alternates — which is what Google reads for
 * language targeting. The previous sitemap listed fragment URLs (/#services,
 * /#contact) as separate pages; fragments are not separate pages and were
 * ignored, so they have been dropped.
 *
 * No <lastmod>. It used to be `new Date()` on every entry of every build,
 * which told Google that all 230 URLs had changed the moment the sitemap was
 * fetched. A crawler that is told everything changed constantly learns to
 * stop believing the field — and it is the field that decides what gets
 * recrawled first when a price does change. An absent lastmod is read as
 * "unknown"; a false one poisons the signal for the whole site.
 *
 * <changefreq> and <priority> are kept because they cost nothing, though
 * Google has said for years that it ignores both.
 */
export async function GET() {
  const products = await getProducts();

  const paths: { path: string; priority: number; changefreq: string }[] = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/hearing-aids", priority: 0.9, changefreq: "weekly" },
    { path: "/about-us", priority: 0.6, changefreq: "monthly" },
    // The accessories view. It is a filter rather than a page of its own, but
    // it is in the menu, it has its own title and description, and people
    // search "resound hearing aid battery price" — so it is a page as far as
    // a crawler is concerned, and it was not in the sitemap.
    { path: "/hearing-aids?parts=1", priority: 0.5, changefreq: "monthly" },
    ...products
      .filter((p) => p.slug)
      .map((p) => ({
        path: `/hearing-aids/${p.slug}`,
        priority: 0.8,
        changefreq: "monthly",
      })),
  ];

  const entry = (path: string, priority: number, changefreq: string) => {
    const bn = `${SITE.url}${path || "/"}`;
    const en = `${SITE.url}/en${path}`;
    return `
  <url>
    <loc>${bn}</loc>
    <xhtml:link rel="alternate" hreflang="bn-BD" href="${bn}"/>
    <xhtml:link rel="alternate" hreflang="en-BD" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${bn}"/>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
  <url>
    <loc>${en}</loc>
    <xhtml:link rel="alternate" hreflang="bn-BD" href="${bn}"/>
    <xhtml:link rel="alternate" hreflang="en-BD" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${bn}"/>
    <changefreq>${changefreq}</changefreq>
    <priority>${Math.max(priority - 0.1, 0.1).toFixed(1)}</priority>
  </url>`;
  };

  /**
   * The privacy notice, which `entry()` cannot express: its Bangla and English
   * versions are at /gopaniyota and /en/privacy, not at one path with a prefix.
   * It was simply missing from the sitemap, on a site whose own notice is the
   * page a regulator looks for first.
   */
  const privacy = (() => {
    const bn = `${SITE.url}/gopaniyota`;
    const en = `${SITE.url}/en/privacy`;
    const alternates = `
    <xhtml:link rel="alternate" hreflang="bn-BD" href="${bn}"/>
    <xhtml:link rel="alternate" hreflang="en-BD" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${bn}"/>`;
    return [bn, en]
      .map(
        (loc) => `
  <url>
    <loc>${loc}</loc>${alternates}
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>`
      )
      .join("");
  })();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
    paths.map((p) => entry(p.path, p.priority, p.changefreq)).join("") +
    privacy +
    `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
