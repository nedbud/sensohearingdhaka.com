import { formatTaka, toBengaliDigits } from "@/lib/site";
import { fill, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import type { Clinic } from "@/routes/clinic";
import { say, type Part, type Test } from "@/routes/details";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

/**
 * Fixed fees, published.
 *
 * Of the ten Bangladeshi hearing businesses surveyed, one publishes test
 * fees and gives ranges. A single number reads as a price; a range reads as
 * "we will decide once you are in the chair". These are also the highest
 * intent searches in the category — people arrive holding a prescription
 * and search the test by name.
 *
 * Which is exactly why none of these numbers is written here any more. A
 * published fee that has gone stale is worse than an unpublished one: the
 * visitor arrives expecting ৳ 1,600 and is asked for ৳ 1,800, and the one
 * thing the page was built to earn is what it loses.
 *
 * Parts are one line rather than a second table. The demand is real but it
 * is a returning customer's errand, not something a first-time visitor
 * needs to read past — so the line names the first two and stops.
 */
export default function TestsSection({
  lang,
  clinic,
  d,
  tests,
  parts,
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
  tests: Test[];
  parts: Part[];
}) {
  const bn = lang === "bn";
  const num = (v: number) => (bn ? toBengaliDigits(v) : String(v));
  const mins = (n: number) => fill(d.tests.minutes, { n: num(n) });

  // The lowest age any listed test is done at. Printed as the floor for the
  // whole table, which is what the note underneath it says.
  const minAge = tests.length
    ? Math.min(...tests.map((test) => test.minAge).filter((age) => age > 0))
    : 0;

  const packageMinutes =
    clinic.testPackage.minutes ||
    tests.reduce((total, test) => total + (test.minutes ?? 0), 0);

  // Two parts on one line, with their units in brackets. Fewer than two and
  // the sentence simply has fewer clauses rather than an empty bracket.
  const priced = parts
    .slice(0, 2)
    .map((part) => {
      const unit = say(part.unit, lang);
      return `${say(part.name, lang)} ${formatTaka(part.price)}${unit ? ` (${unit})` : ""}`;
    })
    .join(", ");

  return (
    <section id="tests" className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h2 className="text-xl font-bold tracking-tightest text-ink">
        {d.tests.heading}
      </h2>
      <p className="mt-3 max-w-prose text-base text-ink-2">{d.tests.lede}</p>

      <ul className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-surface">
        {tests.map((test, index) => (
          <li
            key={`${say(test.name, lang)}-${index}`}
            className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5"
          >
            <span className="text-base text-ink-2">{say(test.name, lang)}</span>
            <span className="num shrink-0 font-ui text-base font-semibold text-ink">
              {formatTaka(test.fee)}
            </span>
          </li>
        ))}

        {/* The package line only makes a claim when there is more than one
            test above it to be a package OF. */}
        {tests.length > 1 && (
          <li className="flex items-baseline justify-between gap-4 bg-brand-tint px-5 py-4">
            <span className="font-ui text-base font-semibold text-ink">
              {d.tests.allThree}
              <span className="num ml-2 font-sans text-sm font-normal text-ink-muted">
                {mins(packageMinutes)}
              </span>
            </span>
            <span className="num shrink-0 font-ui text-xl font-bold text-brand">
              {formatTaka(clinic.testPackage.fee)}
            </span>
          </li>
        )}
      </ul>

      {minAge > 0 && (
        <p className="mt-3 text-sm text-ink-muted">
          {fill(d.tests.reportNote, { age: num(minAge) })}
        </p>
      )}

      <div className="mt-6">
        <WhatsAppButton
          lang={lang}
          clinic={clinic}
          d={d}
          seed={d.wa.prescription}
          label={d.tests.prescriptionCta}
        />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-base text-ink-2">
        <strong className="font-semibold text-ink">{d.tests.serviceLead}</strong>{" "}
        {priced && (
          <span className="num">
            {priced}
            {bn ? "। " : ". "}
          </span>
        )}
        {fill(d.tests.serviceNote, {
          brand: clinic.dealer.brand,
          days: num(clinic.service.inHouseDays),
        })}
      </p>
    </section>
  );
}
