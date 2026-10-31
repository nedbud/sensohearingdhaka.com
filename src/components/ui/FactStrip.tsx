import { formatTaka, getOpenState, toBengaliDigits } from "@/lib/site";
import { clockLabel, fill, DAY_NAMES, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import type { Clinic } from "@/routes/clinic";

/**
 * The three questions the inbox asks before any other: what a device costs,
 * what the test costs, and whether the place is open right now. No
 * competitor in this market publishes any of the three.
 *
 * Set as a compact row of figures. Nobody reads a sentence to find a number.
 */
export default function FactStrip({
  lang,
  clinic,
  d,
  lowPrice,
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
  lowPrice?: number;
}) {
  const bn = lang === "bn";
  // The clinic's own hours, not the ones compiled into the site: somebody who
  // changes the closing time in the panel is changing exactly this line.
  const state = getOpenState(clinic.hours);

  let openValue: string;
  if (state.isOpen && state.closesAt != null) {
    openValue = clockLabel(state.closesAt, lang);
  } else if (state.nextDay != null && state.nextOpensAt != null) {
    const today = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
    ).getDay();
    const label =
      state.nextDay === (today + 1) % 7
        ? d.strip.tomorrow
        : DAY_NAMES[lang][state.nextDay];
    openValue = `${label} ${clockLabel(state.nextOpensAt, lang)}`;
  } else {
    openValue = d.strip.daysFallback;
  }

  const facts = [
    {
      label: d.strip.devices,
      value: lowPrice ? formatTaka(lowPrice) : "—",
      note: d.strip.devicesNote,
    },
    {
      label: d.strip.fullTest,
      value: formatTaka(clinic.testPackage.fee),
      note: fill(d.tests.minutes, {
        n: bn
          ? toBengaliDigits(clinic.testPackage.minutes)
          : clinic.testPackage.minutes,
      }),
    },
    {
      label: state.isOpen ? d.strip.openNow : d.strip.closedNow,
      value: openValue,
      note: d.strip.openNote,
      dot: state.isOpen,
      status: true,
    },
  ];

  return (
    /* Three columns is right on a wide screen and wrong on a phone: at 390px
       each cell is about 118px, and "আগামীকাল সকাল ১০টা" set at 16px does not
       come close to fitting — it ran straight out of the card. On a phone the
       three facts become three rows instead, label left and figure right,
       which is both readable and shorter than three stacked blocks. */
    <dl className="grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-paper-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {facts.map((fact) => (
        /* Grid rather than flex, and the two <dd>s placed by hand.

           They used to sit inside a wrapper <div> so they would stack to the
           right of the label on a phone. That div is not allowed where it
           was: a <dl> may hold <dt>/<dd> pairs or <div>s wrapping a pair,
           and nothing else — so a <div> between the group and its <dd>s
           breaks the list for a screen reader, which is the whole reason
           this markup is a <dl> and not three <span>s. Lighthouse failed it
           on both counts.

           Explicit column and row starts do the same job with no extra
           element: the label takes the left column and the first row, so it
           still shares a baseline with the figure, and the note sits under
           the figure. On `sm` the group goes back to `block` and the
           placements fall away. */
        <div
          key={fact.label}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 px-4 py-2.5 sm:block sm:px-4 sm:py-3"
        >
          <dt className="col-start-1 row-start-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink-muted">
            {fact.status && (
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  fact.dot ? "bg-open" : "bg-shut"
                }`}
              />
            )}
            {fact.label}
          </dt>
          <dd className="num col-start-2 row-start-1 text-right font-ui text-base font-bold leading-tight text-ink sm:mt-0.5 sm:text-left sm:text-lg">
            {fact.value}
          </dd>
          <dd className="col-start-2 row-start-2 text-right text-xs text-ink-muted sm:text-left">
            {fact.note}
          </dd>
        </div>
      ))}
    </dl>
  );
}
