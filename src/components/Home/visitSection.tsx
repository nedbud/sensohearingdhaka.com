"use client";

import type { Clinic } from "@/routes/clinic";
import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import SocialLinks from "@/components/ui/SocialLinks";

/**
 * Contact and directions in one place.
 *
 * The callback form that used to sit behind the disclosure at the bottom is
 * gone. It submitted the visitor's name, number and a description of their
 * hearing problem from their own browser to EmailJS in the United States,
 * with no notice and no consent — health data about an identified person,
 * leaving the country. See contactSection.tsx, which had the same form and
 * the same problem. Naati now does the job properly and books a real serial.
 */
// A client component, so the record is handed to it rather than fetched again.
export default function VisitSection({ lang, clinic,
  d,
}: { lang: Lang; clinic: Clinic;
  d: Dict;
}) {
  const bn = lang === "bn";

  return (
    <section id="visit" className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h2 className="text-xl font-bold tracking-tightest text-ink">
        {d.visit.heading}
      </h2>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper-surface">
        <div className="flex flex-col gap-1 px-5 py-5">
          <p className="text-lg leading-snug text-ink">
            {bn ? clinic.address.lineBn : clinic.address.line}
            <br />
            {bn
              ? `${clinic.address.cityBn}-${clinic.address.postcode}`
              : `${clinic.address.city}-${clinic.address.postcode}`}
          </p>
          <p className="text-base text-ink-muted">
            {bn ? clinic.address.landmarkBn : clinic.address.landmark}
            <br />
            {bn ? clinic.address.floorNoteBn : clinic.address.floorNote}
          </p>
          <p className="mt-2 text-base text-ink-2">
            {d.visit.hours}
          </p>
        </div>

        <div className="grid gap-2.5 border-t border-line p-4 sm:grid-cols-2">
          <WhatsAppButton lang={lang} clinic={clinic} d={d} className="w-full" />
          <a
            href={clinic.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg border-[1.5px] border-line-strong px-4 font-ui text-ink hover:border-ink-2"
          >
            {d.common.map}
          </a>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {d.visit.waitNote}
      </p>

      {/* Messenger is where most of this clinic's enquiries actually arrive —
          the whole rebuild started from a folder of them — so the page says
          so here rather than leaving the page to be found in the footer. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-6">
        <p className="max-w-prose text-base text-ink-2">
          {d.visit.messengerNote}
        </p>
        <SocialLinks lang={lang} clinic={clinic} d={d} size="compact" />
      </div>

    </section>
  );
}
