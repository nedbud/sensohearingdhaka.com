import type { Metadata } from "next";
import ProductsView from "@/components/views/ProductsView";
import { getSeries } from "@/routes/product";
import { altLanguages } from "@/lib/site";
import { fill } from "@/lib/i18n";
import { getDict } from "@/routes/dict";
import { pageOpenGraph } from "@/lib/seo";

export const revalidate = 3600;

type Props = {
  searchParams?: { series?: string; sort?: string; parts?: string; page?: string };
};

/**
 * Metadata varies with the filter, because the filtered views are real pages.
 *
 * `sort` is deliberately left out of the canonical URL: sorting changes the
 * order of a list, not its contents, so all four sorts of the same filter
 * point at one canonical page instead of competing with each other.
 *
 * The words themselves come from the CMS. Only the shape is here: which name
 * goes in the title, and whether a page number is appended.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const series = searchParams?.series ?? "all";
  const parts = searchParams?.parts === "1";
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  const [all, d] = await Promise.all([getSeries(), getDict("en")]);
  const active = all.find((s) => String(s.id ?? s.name) === series);

  const name = parts
    ? d.catalogue.partsTitle
    : active
    ? `ReSound ${active.name}`
    : d.seo.listName;

  const suffix =
    page > 1 ? fill(d.seo.listPageSuffix, { page: page }) : "";

  const params = new URLSearchParams();
  if (series !== "all") params.set("series", series);
  if (parts) params.set("parts", "1");
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  const path = qs ? `/hearing-aids?${qs}` : "/hearing-aids";
  const enPath = qs ? `/en/hearing-aids?${qs}` : "/en/hearing-aids";

  return {
    title: fill(d.seo.listTitle, { name: `${name}${suffix}` }),
    description: parts ? d.seo.partsDescription : d.seo.listDescription,
    alternates: {
      canonical: enPath,
      languages: altLanguages(path, enPath),
    },
    openGraph: await pageOpenGraph("en", d, { path: "/en/hearing-aids" }),
  };
}

export default function Page({ searchParams }: Props) {
  return <ProductsView lang="en" searchParams={searchParams} />;
}
