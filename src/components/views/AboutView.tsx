import Image from "next/image";
import { toBengaliDigits } from "@/lib/site";
import { clockLabel, fill, lines, titled, type Lang } from "@/lib/i18n";
import { say } from "@/routes/details";
import { getSite } from "@/routes/site";
import AudiogramMark from "@/components/ui/AudiogramMark";
import { BreadcrumbJsonLd } from "@/components/ui/JsonLd";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

/**
 * The one page here that is read rather than scanned, so it is the one page
 * given room. Everything on it is checkable: a listing on ReSound's own
 * site, a trade licence number, named people with the hours they sit, and
 * an honest section on what this centre does not do.
 *
 * That last part is deliberate. In a market where the largest competitor
 * claims sixty-four districts and ten unnamed audiologists, the credible
 * move is not a bigger claim — it is a smaller, verifiable one.
 */

export default async function AboutView({ lang }: { lang: Lang }) {
  const { clinic, details, d } = await getSite(lang);
  const bn = lang === "bn";
  const FOUNDED = clinic.foundedYear;
  const years = new Date().getFullYear() - FOUNDED;
  const n = (v: number | string) => (bn ? toBengaliDigits(v) : String(v));

  // Every sentence on this page that carries a figure is a template with the
  // figure named, so the year, the warranty and the assessment time are read
  // from the clinic record rather than typed twice in two languages.
  const values = {
    year: n(FOUNDED),
    years: n(clinic.warranty.years),
    months: n(clinic.warranty.followUpMonths),
    minutes: n(clinic.testPackage.minutes),
    brand: clinic.dealer.brand,
  };
  const t = (template: string) => fill(template, values);

  const stats = [
    { value: `${n(years)} ${d.about.yearsUnit}`, label: t(d.about.sinceLabel) },
    { value: clinic.dealer.brand, label: d.about.dealerLabel },
    { value: n(clinic.hospitals.length), label: d.about.hospitalsLabel },
    { value: `${n(clinic.warranty.years)} ${d.about.yearsUnit}`, label: d.about.warrantyLabel },
  ];

  const steps = lines(t(d.about.steps)).map(titled);
  const limits = lines(t(d.about.limits));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: d.nav.home, url: `${clinic.url}${lang === "en" ? "/en" : "/"}` },
          {
            name: d.about.eyebrow,
            url: `${clinic.url}${lang === "en" ? "/en" : ""}/about-us`,
          },
        ]}
      />

      {/* ── Opening ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <AudiogramMark className="pointer-events-none absolute -right-32 top-6 h-[340px] w-[620px] text-line-strong opacity-50 sm:-right-10 sm:h-[420px] sm:w-[760px]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-12 sm:pt-16 lg:px-8">
          <p className="font-ui text-sm font-semibold text-brand">
            {d.about.eyebrow}
          </p>
          <h1 className="mt-3 max-w-[18ch] text-4xl font-bold leading-[1.18] tracking-tightest text-ink">
            {d.about.title}
          </h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink-2">
            {t(d.about.lede)}
          </p>
        </div>
      </section>

      {/* ── Figures ─────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-y-6 px-4 py-8 sm:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="num font-ui text-xl font-bold leading-tight text-ink">
                {s.value}
              </dt>
              <dd className="mt-0.5 text-sm leading-snug text-ink-muted">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── What happens here — a real sequence, so it is numbered ── */}
      <section className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <h2 className="text-xl font-bold tracking-tightest text-ink">
          {d.about.stepsHeading}
        </h2>
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {steps.map((step, i) => (
            <li key={step.title || i} className="flex gap-4 py-5 sm:gap-6">
              <span className="num shrink-0 pt-0.5 font-ui text-sm font-bold text-brand">
                {n(i + 1).padStart(2, bn ? "০" : "0")}
              </span>
              <div>
                {step.title && (
                  <h3 className="font-ui text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                )}
                <p className="mt-1 max-w-prose text-base leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── The people ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pb-12 lg:px-8">
        <h2 className="text-xl font-bold tracking-tightest text-ink">
          {d.about.peopleHeading}
        </h2>
        <p className="mt-2 max-w-prose text-base text-ink-2">
          {d.about.peopleLede}
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {details.team.map((member, index) => (
            <li
              key={`${say(member.name, lang)}-${index}`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-paper-surface p-4"
            >
              {/* TODO: replace with a real photograph — one per person was
                  asked for on the information form and has not arrived. */}
              <span
                aria-hidden="true"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-line-strong bg-paper-2 font-ui text-lg font-bold text-ink-muted"
              >
                {say(member.name, lang).trim().charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="font-ui text-base font-semibold leading-tight text-ink">
                  {say(member.name, lang)}
                </p>
                <p className="text-sm text-ink-muted">{say(member.role, lang)}</p>
                <p className="num mt-0.5 text-sm text-ink-2">
                  {say(member.days, lang)}, {clockLabel(member.from, lang)} –{" "}
                  {clockLabel(member.to, lang)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Verification ────────────────────────────────────────── */}
      <section className="bg-paper-deep text-ink-inverse">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <h2 className="text-xl font-bold tracking-tightest">
            {d.about.verifyHeading}
          </h2>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-white/70">
            {t(d.about.verifyLede)}
          </p>

          <a
            href={clinic.dealer.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[44px] items-center font-ui underline decoration-brand decoration-2 underline-offset-4 hover:decoration-white"
          >
            {fill(d.trust.verify, { brand: clinic.dealer.brand })}
          </a>

          <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-white/50">{d.trust.sinceLabel}</dt>
              <dd className="num mt-1 font-medium">
                {t(d.trust.sinceValue)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-white/50">
                {d.trust.hospitalsLabel}
              </dt>
              <dd className="mt-1 font-medium">{clinic.hospitals.join(" · ")}</dd>
            </div>
          </dl>

          <figure className="mt-8">
            <Image
              src="/assets/Images/photos/business-excellence-award-2019.webp"
              alt={d.about.awardCaption}
              width={768}
              height={512}
              className="h-auto w-full max-w-sm rounded-xl border border-white/10 object-cover"
            />
            <figcaption className="mt-2 text-sm text-white/50">
              {d.about.awardCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Honest limits ───────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <h2 className="text-xl font-bold tracking-tightest text-ink">
          {d.about.limitsHeading}
        </h2>
        <p className="mt-2 max-w-prose text-base text-ink-2">
          {d.about.limitsLede}
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {limits.map((line) => (
            <li
              key={line}
              className="border-l-2 border-line-strong pl-4 text-base leading-relaxed text-ink-2"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Where, and the way in ───────────────────────────────── */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <h2 className="text-xl font-bold tracking-tightest text-ink">
            {d.about.whereHeading}
          </h2>
          <p className="mt-4 text-lg leading-snug text-ink">
            {bn ? clinic.address.lineBn : clinic.address.line}
            <br />
            {bn
              ? `${clinic.address.cityBn}-${clinic.address.postcode}`
              : `${clinic.address.city}-${clinic.address.postcode}`}
          </p>
          <p className="mt-1.5 text-base text-ink-muted">
            {bn ? clinic.address.landmarkBn : clinic.address.landmark}
            <br />
            {bn ? clinic.address.floorNoteBn : clinic.address.floorNote}
          </p>
          <p className="mt-3 text-base text-ink-2">
            {d.footer.hoursValue}. {d.footer.closedFriday}
          </p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <WhatsAppButton lang={lang} clinic={clinic} d={d} />
          </div>

          <a
            href={clinic.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center font-ui text-brand underline underline-offset-4"
          >
            {d.common.map}
          </a>
        </div>
      </section>
    </>
  );
}
