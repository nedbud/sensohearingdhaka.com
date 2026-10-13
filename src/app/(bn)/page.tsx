import { altLanguages } from "@/lib/site";
import type { Metadata } from "next";
import HomeView from "@/components/views/HomeView";
import { getDict } from "@/routes/dict";
import { pageOpenGraph } from "@/lib/seo";

export const revalidate = 3600;

/**
 * Metadata is built at request time rather than declared, because the title
 * and the description now come from the CMS like the rest of the page's
 * words. They are also the only words a visitor reads before deciding whether
 * to open the page at all, so leaving them where only a developer could reach
 * them was the wrong way round.
 *
 * The dictionary in src/lib/i18n.ts is still the fallback: a build with no API
 * produces exactly the metadata the site has today.
 */
export async function generateMetadata(): Promise<Metadata> {
  const d = await getDict("bn");
  return {
    title: d.seo.homeTitle,
    description: d.seo.homeDescription,
    alternates: {
      canonical: "/",
      languages: altLanguages("/", "/en"),
    },
    openGraph: await pageOpenGraph("bn", d),
  };
}

export default function Page() {
  return <HomeView lang="bn" />;
}
