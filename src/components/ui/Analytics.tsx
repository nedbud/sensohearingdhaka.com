import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * NEXT_PUBLIC_GTM has sat in .env since before the rewrite with a real
 * measurement ID in it, and nothing in the codebase ever read it — so the
 * site has been running with no analytics at all, while looking configured.
 *
 * `afterInteractive` rather than `beforeInteractive`: nothing on the page
 * waits for this, and the people this site is built for are on Bangladeshi
 * mobile data. Measurement should not cost them the first paint.
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
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
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
