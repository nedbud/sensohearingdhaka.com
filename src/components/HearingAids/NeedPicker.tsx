import Link from "next/link";
import {
  LOSS_LABEL,
  LOSS_FEELS,
  filterByNeed,
  type Device,
  type LossLevel,
} from "@/lib/catalogue";
import { listHref, clearNeed, toNeed, type ListState } from "@/lib/listUrl";
import { toBengaliDigits } from "@/lib/site";
import { lines, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { taxonomy } from "@/routes/taxonomy";

/**
 * The way into the catalogue.
 *
 * This used to be a client component that ran the same matching logic and
 * then printed its own four-card shortlist above the real list — two lists
 * on one page, answering the same question twice, with the WhatsApp button
 * in between. The answers should not produce a second list; they should
 * change the one already there.
 *
 * So each answer is a link that sets a query parameter, the grid below is
 * filtered by those parameters on the server, and the count in the bar is
 * the count of what is left. Select, and the models start narrowing.
 *
 * This is still where the AI consultation slots in. The questions are the
 * attributes a model would reason over, the answers are a `Need`, and a
 * `Need` is now expressible as a URL — which means the eventual model does
 * not have to render anything at all. It reads what the person typed and
 * sends them to the catalogue already filtered.
 */

const LOSS_STEPS: LossLevel[] = ["mild", "moderate", "severe", "profound"];

/**
 * The budget bands, as the CMS stores them: one per line, the figure the
 * filter uses and then the words to print, split on a pipe.
 *
 * Two fields rather than one because the two are not the same thing — "৫০
 * হাজারের মধ্যে" is what a person reads and 50000 is what the URL filters on,
 * and a band whose words and number disagree is worse than no band at all.
 * A line the panel has mangled is skipped rather than guessed at.
 */
function budgets(value: string): { max: number; label: string }[] {
  return lines(value)
    .map((line) => {
      const at = line.indexOf("|");
      if (at === -1) return null;
      const max = Number(line.slice(0, at).trim());
      const label = line.slice(at + 1).trim();
      return Number.isFinite(max) && max > 0 && label ? { max, label } : null;
    })
    .filter(Boolean) as { max: number; label: string }[];
}

export default function NeedPicker({
  lang,
  d,
  state,
  pool,
}: {
  lang: Lang;
  d: Dict;
  state: ListState;
  /** everything the series and sort leave in play, before these answers */
  pool: Device[];
}) {
  const BUDGETS = budgets(d.picker.budgets);
  const t = taxonomy(d);

  /**
   * How many devices each option would leave, given the answers already
   * given. Without this a visitor can pick two reasonable things and land on
   * an empty page with no idea which one to undo — and 45 of the 104 devices
   * do not state their battery type at all, so some combinations really are
   * empty. Showing the number turns a dead end into an informed choice.
   */
  const countIf = (patch: Partial<ListState>) =>
    filterByNeed(pool, toNeed({ ...state, ...patch })).length;
  const active =
    state.loss !== undefined ||
    state.rech !== undefined ||
    state.hidden !== undefined ||
    state.max !== undefined;

  const chipClass = (on: boolean, dead: boolean) =>
    `inline-flex min-h-[44px] items-center gap-2 rounded-full border-[1.5px] px-3.5 font-ui text-sm transition-colors ${
      on
        ? "border-brand bg-brand text-white"
        : dead
        ? "cursor-not-allowed border-line bg-paper text-ink-muted"
        : "border-line-strong bg-paper-surface text-ink hover:border-ink-2"
    }`;

  const Choice = ({
    on,
    patch,
    children,
  }: {
    on: boolean;
    patch: Partial<ListState>;
    children: React.ReactNode;
  }) => {
    const n = countIf(patch);
    const dead = !on && n === 0;
    const body = (
      <>
        {children}
        <span className={`num text-xs ${on ? "text-white/70" : "text-ink-muted"}`}>
          {lang === "bn" ? toBengaliDigits(n) : n}
        </span>
      </>
    );
    if (dead) {
      return (
        <span className={chipClass(false, true)} aria-disabled="true">
          {body}
        </span>
      );
    }
    return (
      <Link href={listHref(lang, state, patch)} className={chipClass(on, false)}>
        {body}
      </Link>
    );
  };

  const Row = ({
    label,
    hint,
    children,
  }: {
    label: string;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <p className="font-ui text-base text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-sm leading-snug text-ink-muted">{hint}</p>}
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );

  return (
    <section className="rounded-2xl border border-line bg-paper-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl text-ink">
          {d.picker.heading}
        </h2>
        {active && (
          <Link
            href={listHref(lang, state, clearNeed(state))}
            className="font-ui text-sm text-brand underline underline-offset-4"
          >
            {d.picker.clear}
          </Link>
        )}
      </div>

      <p className="mt-2 max-w-prose text-base text-ink-2">
        {d.picker.lede}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Row
          label={d.picker.lossLabel}
          hint={state.loss ? t.feels[state.loss] : d.picker.lossHint}
        >
          {LOSS_STEPS.map((level) => (
            <Choice
              key={level}
              on={state.loss === level}
              patch={{ loss: state.loss === level ? undefined : level }}
            >
              {t.loss[level]}
            </Choice>
          ))}
        </Row>

        <Row
          label={d.picker.batteryLabel}
        >
          <Choice
            on={state.rech === true}
            patch={{ rech: state.rech === true ? undefined : true }}
          >
            {d.picker.wantRechargeable}
          </Choice>
          <Choice
            on={state.rech === false}
            patch={{ rech: state.rech === false ? undefined : false }}
          >
            {d.picker.batteryFine}
          </Choice>
        </Row>

        <Row label={d.picker.budgetLabel}>
          {BUDGETS.map((b) => (
            <Choice
              key={b.max}
              on={state.max === b.max}
              patch={{ max: state.max === b.max ? undefined : b.max }}
            >
              {b.label}
            </Choice>
          ))}
        </Row>

        <Row label={d.picker.visibilityLabel}>
          <Choice
            on={!!state.hidden}
            patch={{ hidden: state.hidden ? undefined : true }}
          >
            {d.picker.preferHidden}
          </Choice>
        </Row>
      </div>

    </section>
  );
}
