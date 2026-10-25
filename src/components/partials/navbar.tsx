import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import LangSwitch from "@/components/ui/LangSwitch";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import type { Clinic } from "@/routes/clinic";

export default function Navbar({
  lang,
  clinic,
  d,
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
}) {
  const p = (path: string) => (lang === "en" ? `/en${path === "/" ? "" : path}` : path);

  /**
   * Six entries, and every one of them goes somewhere that exists.
   *
   * Accessories is the catalogue with the parts filter on rather than a page
   * of its own — same products, same prices, one URL Google can index. Hearing
   * tests is the fee table on the home page, which is where the fees live.
   *
   * Gallery is deliberately absent: there is no gallery to link to yet, and a
   * menu entry that lands on an empty page is worse than one that is not there.
   * The photographs were asked for on the information form and have not
   * arrived; when they do, this is where it goes.
   */
  const nav = [
    { name: d.nav.products, href: p("/hearing-aids") },
    { name: d.nav.tests, href: `${p("/")}#tests` },
    { name: d.nav.accessories, href: `${p("/hearing-aids")}?parts=1` },
    /**
     * Service points at the tests section on purpose.
     *
     * It reads like a mistake — there is a serviceSection.tsx with its own
     * `id="services"` — but that component is mounted nowhere, so linking to
     * it sends a visitor to an anchor that does not exist on the page. The
     * servicing and parts copy a visitor is actually looking for sits inside
     * the tests section, which is where this goes until somebody decides the
     * orphan deserves a place on the home page.
     *
     * Two items therefore share one href, which is why these are keyed by
     * name: a destination can legitimately be shared, a name cannot.
     */
    { name: d.nav.service, href: `${p("/")}#tests` },
    { name: d.nav.about, href: p("/about-us") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
        <Link href={p("/")} className="shrink-0" aria-label={d.nav.home}>
          <Image
            src="/assets/Images/Common/sensoLogo.png"
            alt="Senso Hearing Centre"
            width={379}
            height={229}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="whitespace-nowrap font-ui text-[15px] text-ink hover:text-brand"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch lang={lang} />
          <WhatsAppButton lang={lang} clinic={clinic} d={d} size="compact" />

          {/*
            The menu on a phone.

            With two entries the site got away with hiding the navigation below
            the large breakpoint; with five it cannot, and most of the people
            this site is for arrive on a phone — so until now they had a logo,
            a language toggle, and no way to reach the catalogue except by
            scrolling the whole home page.

            A <details> rather than a React panel: it opens and closes with no
            JavaScript at all, the browser gives it the right keyboard and
            screen-reader behaviour for free, and this file stays a server
            component.
          */}
          <details className="group relative lg:hidden">
            <summary
              className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border-[1.5px] border-line-strong text-ink marker:content-[''] [&::-webkit-details-marker]:hidden"
              aria-label={d.nav.sections}
            >
              <span aria-hidden="true" className="space-y-[5px]">
                <span className="block h-[1.5px] w-5 bg-current" />
                <span className="block h-[1.5px] w-5 bg-current" />
                <span className="block h-[1.5px] w-5 bg-current" />
              </span>
            </summary>

            <nav className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-60 overflow-hidden rounded-2xl border border-line bg-paper-surface shadow-card">
              {nav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block border-b border-line px-4 py-3.5 font-ui text-ink last:border-0 hover:bg-canvas hover:text-brand"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
