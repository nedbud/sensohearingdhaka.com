import "./globals.css";
import Navbar from "@/components/partials/navbar";
import Footer from "@/components/partials/footer";
import { ClinicJsonLd } from "@/components/ui/JsonLd";
import StickyContactBar from "@/components/ui/StickyContactBar";
import Analytics from "@/components/ui/Analytics";
// import NaatiWidget from "@/components/naati/NaatiWidget";
import type { Lang } from "@/lib/i18n";
import { getSite } from "@/routes/site";

/**
 * The document shell, shared by both root layouts.
 *
 * There are two root layouts — one per language subtree — because a layout
 * cannot see the request path, and `<html lang>` plus every string in the
 * header and footer depends on it. The earlier version read the path from a
 * header set by middleware, which works for a request but not for a page
 * built ahead of time: every /en page is statically generated, so at build
 * time there is no request, the read fell back to "/", and the whole English
 * subtree rendered a Bangla topbar and footer.
 *
 * Route groups solve it at the source. `(bn)` and `(en)` do not appear in any
 * URL, so nothing moves and no ranking is lost, but each has its own root
 * layout that simply knows which language it is. Nothing is inferred at
 * runtime, so it cannot be inferred wrongly.
 *
 * The one cost: moving between the two subtrees is a full page load rather
 * than a client transition. For a language switch that is the honest
 * behaviour anyway — the document language really is changing.
 */
export default async function RootShell({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  // Read once, here, and hand the same record to everything in the shell. The
  // alternative is each component fetching for itself, which is the same data
  // four times and four chances for two parts of one page to disagree about
  // the phone number.
  const { clinic, d, details } = await getSite(lang);

  return (
    <html lang={lang}>
      <head>
        {/* Only the faces that render above the fold. anek-bengali-700 used
            to be preloaded here and is declared in no @font-face at all — it
            was downloaded on every page and never drawn with. These three are
            the ones actually on the first screen: body, the headline, and the
            navigation. */}
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
          href="/font/hind-bengali-400.woff2" />
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
          href="/font/anek-cond-800-bengali.woff2" />
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
          href="/font/anek-semi-600-bengali.woff2" />
      </head>
      <body suppressHydrationWarning>
        <Analytics />
        <ClinicJsonLd clinic={clinic} tests={details.tests} />
        <Navbar lang={lang} clinic={clinic} d={d} />
        <main>{children}</main>
        <Footer lang={lang} clinic={clinic} d={d} />
        {/*
          Naati is switched off for this release — this line and its import
          above are the whole switch. Nothing else was removed: the widget,
          the photo-consent card, /api/naati/chat, /api/booking/* and
          /api/consent are all still here and still work.

          It goes back on last, after the CMS and this site and the admin
          server are each up and behaving, because it is the one piece that
          depends on all three: it answers from the CMS's content, books
          against the admin server, and sends what a patient types to Google.
          Turning it on before those are settled means debugging four things
          at once.

          Before it goes back on: GEMINI_API_KEY must be a BILLED key. On the
          free tier Google's terms permit training on what is sent, and what
          is sent includes photographs of prescriptions.
        */}
        {/* <NaatiWidget lang={lang} /> */}

        {/*
          With Naati off, this is how a visitor reaches the clinic. The
          component was written for exactly this and then never mounted, so
          until now the only contact anywhere on the site was a tel: link in
          the footer — on a clinic's website, where the whole point of the
          visit is to arrange one.

          Mobile only, and only once the hero has scrolled past.
        */}
        <StickyContactBar lang={lang} clinic={clinic} d={d} />
      </body>
    </html>
  );
}
