import Image from "next/image";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { getClinic } from "@/routes/clinic";
import { getDict } from "@/routes/dict";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

/**
 * The page that is not there.
 *
 * Next's own 404 is a line of black text on white, outside the layout — no
 * header, no footer, no way back except the browser's back button. On a
 * catalogue of 109 slugs that a person may have been sent in a WhatsApp
 * message, a dead end is a lost patient.
 *
 * It lives inside each language group rather than at the root, because the
 * route groups have a layout each and no root layout between them. That also
 * means it renders inside the real shell, with the menu and the footer, so
 * every route out of here is the one the rest of the site offers.
 *
 * The status code is still 404 — Next sets it for this file — which is what
 * keeps a mistyped URL out of the index instead of turning it into a soft 404.
 */
export default async function NotFoundView({ lang }: { lang: Lang }) {
  const [clinic, d] = await Promise.all([getClinic(), getDict(lang)]);
  const prefix = lang === "en" ? "/en" : "";

  const ways = [
    { name: d.nav.products, href: `${prefix}/hearing-aids` },
    { name: d.nav.accessories, href: `${prefix}/hearing-aids?parts=1` },
    { name: d.nav.about, href: `${prefix}/about-us` },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-xs">
        <Image
          src="/assets/Images/Common/senso_404_not_found.png"
          alt={d.notFound.alt}
          fill
          sizes="320px"
          className="object-contain"
        />
      </div>

      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tightest text-ink">
        {d.notFound.title}
      </h1>
      <p className="mx-auto mt-4 max-w-prose text-lg leading-relaxed text-ink-2">
        {d.notFound.lede}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <Link
          href={`${prefix}/`}
          className="inline-flex min-h-[48px] items-center rounded-lg border-[1.5px] border-line-strong bg-paper-surface px-5 font-ui text-ink hover:border-ink-2"
        >
          {d.notFound.home}
        </Link>
        <WhatsAppButton lang={lang} clinic={clinic} d={d} />
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-line pt-6">
        {ways.map((way) => (
          <li key={way.href}>
            <Link
              href={way.href}
              className="font-ui text-brand underline underline-offset-4"
            >
              {way.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
