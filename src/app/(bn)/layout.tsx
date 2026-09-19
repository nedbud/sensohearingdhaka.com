import type { Metadata } from "next";
import RootShell from "../RootShell";
import { SITE, altLanguages } from "@/lib/site";
import { getClinic } from "@/routes/clinic";
import { getDict } from "@/routes/dict";

/**
 * Root layout for the Bangla subtree — the site's own URLs (/, /hearing-aids,
 * /about-us). Bangla is the default language, so it keeps the plain paths and
 * the ranking they already have.
 *
 * The titles and descriptions are read rather than declared: they are the
 * words a person sees before they have seen the page, and they belong in the
 * CMS with the rest of the site's copy.
 */

export async function generateMetadata(): Promise<Metadata> {
  const [clinic, d] = await Promise.all([getClinic(), getDict("bn")]);

  return {
    metadataBase: new URL(clinic.url || SITE.url),
    title: {
      default: d.seo.defaultTitle,
      // The brand half of every page title. Left as the clinic's own name
      // rather than a string, so renaming the business renames the tabs.
      template: `%s | ${clinic.name}`,
    },
    description: d.seo.defaultDescription,
    // The keywords meta tag was removed. It held ~46 entries including
    // "what is a hearing aids hearing aids hearing aids". Google has ignored
    // this tag since 2009; all it did was look like keyword stuffing.
    alternates: {
      canonical: "/",
      languages: altLanguages("/", "/en"),
    },
    verification: { google: "D7V9ovCzKzcomUagIaPLjeDIrdnGWmw01YTBshq8gYY" },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      alternateLocale: ["en_US"],
      siteName: clinic.name,
      url: clinic.url || SITE.url,
      title: d.seo.ogTitle,
      description: d.seo.ogDescription,
      // There was no image, and twitter.card was already summary_large_image —
      // so a share on WhatsApp, Messenger or Facebook, which is where most of
      // this site's traffic starts, rendered as a grey box with a URL under it.
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: d.seo.ogImageAlt,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
    /*
      No `icons` here on purpose.

      App Router's file convention wins over metadata.icons the moment
      src/app/favicon.ico exists — which it does — so the apple entry declared
      here was silently ignored and the rendered head carried one line:
      <link rel="icon" href="/favicon.ico">. iOS had no home-screen icon, and
      the audit was right to say none was declared.

      src/app/apple-icon.png is the convention's answer. Next hashes it,
      serves it, and writes the apple-touch-icon link itself — one file, no
      configuration, and no second place for the two to disagree.
    */
    manifest: "/manifest.webmanifest",
    category: "Hearing care",
  };
}

export default function BanglaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootShell lang="bn">{children}</RootShell>;
}
