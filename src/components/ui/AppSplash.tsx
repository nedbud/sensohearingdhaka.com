/**
 * The brand moment a phone gets while the first screen arrives.
 *
 * ## Why this is CSS and not a component with state
 *
 * A splash whose dismissal depends on JavaScript is worse than no splash: it
 * paints after hydration, which is the one moment a slow phone has nothing to
 * spare, and if the bundle fails it covers the site forever. This one is in
 * the server-rendered HTML with its styles in the stylesheet, so it is on the
 * screen in the first frame the browser paints — before React exists — and it
 * leaves on a keyframe that cannot fail. There is no state, no effect, no
 * listener, and nothing to hydrate.
 *
 * ## Why it is short, and only on phones
 *
 * An opaque cover delays the moment the hero counts as painted, which is the
 * number Google measures. Six hundred milliseconds of it is a brand beat; two
 * seconds is a tax on every visit, paid by the patient. It runs for 0.42s and
 * fades over 0.26s, and `lg:hidden` keeps it off desktops, where a splash
 * reads as a page that has not loaded rather than an app that is starting.
 *
 * `prefers-reduced-motion` removes it outright — somebody who has asked for
 * less movement has not asked for a logo to swell at them.
 *
 * It lives in the shell rather than in a page, so moving between pages inside
 * the site never replays it. A cold start shows it; navigation does not —
 * which is exactly how a native app behaves.
 */
export default function AppSplash() {
  return (
    <div aria-hidden="true" className="senso-splash lg:hidden">
      <div className="senso-splash-mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/Images/Common/sensoLogo.png"
          alt=""
          width={168}
          height={56}
          decoding="sync"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
