import Link from "next/link";
import { formatTaka, toBengaliDigits } from "@/lib/site";
import { fill, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import type { Clinic } from "@/routes/clinic";

/**
 * The three things a visitor arrives wanting: a device, a test, or a repair.
 *
 * The site had one road through it — scroll, and hope the section you needed
 * came round. Most people arrive from a search that already says which of the
 * three they are: "hearing aid price", "hearing test dhaka", "resound
 * servicing". Putting the three side by side under the hero lets them leave
 * the home page in one tap instead of five screens of scrolling.
 *
 * Each one carries a figure rather than an adjective. "Service" tells a
 * visitor nothing; "in our own lab, usually within a day" is the reason to
 * choose this centre over the shop that posts the device to Singapore.
 */
export default function DoorsSection({
  lang,
  clinic,
  d,
  models,
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
  /** How many devices the catalogue actually holds, so the card cannot lie. */
  models: number;
}) {
  const prefix = lang === "en" ? "/en" : "";
  const n = (v: number | string) => (lang === "bn" ? toBengaliDigits(v) : String(v));

  const doors = [
    {
      title: d.doors.aidsTitle,
      note: fill(d.doors.aidsNote, { count: n(models) }),
      href: `${prefix}/hearing-aids`,
    },
    {
      title: d.doors.testsTitle,
      note: fill(d.doors.testsNote, {
        minutes: n(clinic.testPackage.minutes),
        fee: formatTaka(clinic.testPackage.fee),
      }),
      href: `${prefix}/#tests`,
    },
    {
      title: d.doors.serviceTitle,
      note: fill(d.doors.serviceNote, { days: n(clinic.service.inHouseDays) }),
      href: `${prefix}/hearing-aids?parts=1`,
    },
  ];

  return (
    /*
       The three doors rise into the hero rather than queueing under it.

       The hero used to end on a hairline and the doors began six pixels
       below it, which read as two pages stacked. Lifting the row so it
       overlaps the bottom of the picture does the opposite: the eye goes
       headline, button, doors, in one movement, and the cards look like they
       are resting on the photograph instead of waiting their turn. They are
       opaque and on the site's own surface colour, so nothing underneath has
       to be legible through them.
    */
    <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 lg:-mt-16 lg:px-8">
      <ul className="grid gap-3 sm:grid-cols-3">
        {doors.map((door) => (
          <li key={door.title}>
            <Link
              href={door.href}
              className="group flex h-full flex-col rounded-2xl border border-line bg-paper-surface p-5 transition-colors hover:border-ink-2"
            >
              <span className="font-ui text-lg font-semibold leading-tight text-ink group-hover:text-brand">
                {door.title}
              </span>
              <span className="num mt-1.5 text-sm leading-snug text-ink-2">
                {door.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
