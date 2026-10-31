import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * NEXT_PUBLIC_GTM has sat in .env since before the rewrite with a real
 * measurement ID in it, and nothing in the codebase ever read it — so the
 * site has been running with no analytics at all, while looking configured.
 *
 * `lazyOnload`, which is further back than it looks.
 *
 * It was `afterInteractive`, on the reasoning that nothing on the page waits
 * for this. True, and not enough: that strategy still fetches during the page
 * load, and gtag.js is 181 KiB — the largest single file this site loads,
 * larger than the stylesheet and every first-party script together. On a
 * 1.6 Mbit connection it competes for bandwidth with the hero photograph,
 * which is the Largest Contentful Paint. Lighthouse priced it at 61 KiB of
 * unused JavaScript and 600ms.
 *
 * `lazyOnload` waits for the browser to go idle, so measurement is paid for
 * out of the quiet after the page is usable rather than out of the visitor's
 * first few seconds. The page_view arrives a moment later; GA is built for
 * that. The people this site is for are on Bangladeshi mobile data, and
 * measuring them should not be the most expensive thing on the page.
 *
 * What is deliberately NOT here:
 *
 *   No Meta Pixel. A visitor reading a hearing-aid page is disclosing a
 *   health condition, and handing that to an ad network is both the kind of
 *   audience data Meta's own terms forbid and the kind that gets an ad
 *   account closed.
 *
 *   No cross-site or fingerprinting tracker. The privacy notice this site
 *   publishes says, in both languages, that there is no tracker here that
 *   follows you around the internet. That sentence has to stay true.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GTM;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="lazyOnload"
      />
      <Script id="ga4" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
