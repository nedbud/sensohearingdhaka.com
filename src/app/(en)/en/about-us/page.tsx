import type { Metadata } from "next";
import AboutView from "@/components/views/AboutView";
import { altLanguages } from "@/lib/site";
import { getDict } from "@/routes/dict";
import { pageOpenGraph } from "@/lib/seo";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const d = await getDict("en");
  return {
    title: d.seo.aboutTitle,
    description: d.seo.aboutDescription,
    alternates: {
      canonical: "/en/about-us",
      languages: altLanguages("/about-us", "/en/about-us"),
    },
    openGraph: await pageOpenGraph("en", d, {
      title: d.seo.aboutOgTitle,
      path: "/en/about-us",
    }),
  };
}

export default function Page() {
  return <AboutView lang="en" />;
}
