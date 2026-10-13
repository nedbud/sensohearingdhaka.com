"use client";

import { useState } from "react";
import Image from "next/image";
import type { Clinic } from "@/routes/clinic";
import { fill, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { cityLine, toBengaliDigits } from "@/lib/site";
import { photoAlt, photoCaption, type VisitPhoto } from "@/routes/visit";
import Lightbox from "@/components/ui/Lightbox";
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
  photos = [],
}: { lang: Lang; clinic: Clinic;
  d: Dict;
  /** The way in, step by step. Empty when the CMS has none — then the
   *  address stands on its own, as it always did. */
  photos?: VisitPhoto[];
}) {
  const bn = lang === "bn";
  const number = (value: number) =>
    bn ? toBengaliDigits(value) : String(value);

  /** Which picture the viewer is showing, or null while it is shut. */
  const [showing, setShowing] = useState<number | null>(null);

  const gallery = photos.map((photo) => ({
    src: photo.image,
    alt: photoAlt(photo, lang),
    caption: photoCaption(photo, lang),
  }));

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
            {cityLine(clinic.address, lang)}
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

      {/*
        The address in words has never been enough at this door. The building
        carries nine signboards, the entrance is a gap between two shutters,
        and the clinic's own name is painted two storeys up — so people ring
        from the footpath outside it. Four photographs answer in a second what
        a line of address cannot answer at all.

        They are numbered because they are a sequence, not a gallery: this is
        the walk from the signal to the desk, in the order it is walked.
      */}
      {photos.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          <h3 className="font-ui text-base font-semibold text-ink">
            {d.visit.findingHeading}
          </h3>
          <p className="mt-1 max-w-prose text-base text-ink-muted">
            {d.visit.findingNote}
          </p>

          <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={photo.image}
                className="overflow-hidden rounded-xl border border-line bg-paper-surface transition-colors hover:border-ink-2"
              >
                {/*
                  A button, not a div with a click on it. A signboard is the
                  one thing on this page somebody will want to look at
                  closely — often on a phone, in the street, holding it up
                  against the building — and that has to be reachable by tab
                  and by screen reader, not only by an accurate tap.
                */}
                <button
                  type="button"
                  onClick={() => setShowing(index)}
                  aria-label={`${d.common.enlarge} — ${photoCaption(photo, lang)}`}
                  className="group block w-full cursor-zoom-in text-left"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
                    <Image
                      src={photo.image}
                      alt={photoAlt(photo, lang)}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink font-ui text-[11px] font-semibold text-ink-inverse shadow-[0_1px_5px_rgba(0,0,0,0.4)]"
                    >
                      {number(index + 1)}
                    </span>
                    {/* The affordance, kept to one mark: it says "this opens"
                        and then gets out of the way of the photograph. */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-paper-deep/55 text-ink-inverse opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none"
                        stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="M20 20l-4.3-4.3M11 8.5v5M8.5 11h5" />
                      </svg>
                    </span>
                  </div>
                  <p className="px-3 py-2.5 text-sm leading-snug text-ink-2">
                    {photoCaption(photo, lang)}
                  </p>
                </button>
              </li>
            ))}
          </ol>

          <Lightbox
            items={gallery}
            index={showing}
            onIndex={setShowing}
            onClose={() => setShowing(null)}
            labels={{
              close: d.common.close,
              previous: d.common.previous,
              next: d.common.next,
              counter: fill(d.common.photoOf, {
                index: number((showing ?? 0) + 1),
                total: number(photos.length),
              }),
            }}
          />
        </div>
      )}

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
