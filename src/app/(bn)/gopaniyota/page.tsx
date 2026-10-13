import type { Metadata } from "next";
import PrivacyView from "@/components/views/PrivacyView";
import { altLanguages } from "@/lib/site";
import { getDict } from "@/routes/dict";
import { pageOpenGraph } from "@/lib/seo";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const d = await getDict("bn");
  return {
    title: d.seo.privacyTitle,
    description: d.seo.privacyDescription,
    alternates: {
      canonical: "/gopaniyota",
      languages: altLanguages("/gopaniyota", "/en/privacy"),
    },
    openGraph: await pageOpenGraph("bn", d, {
      title: d.seo.privacyTitle,
      path: "/gopaniyota",
    }),
  };
}

export default function Page() {
  return <PrivacyView lang="bn" />;
}
