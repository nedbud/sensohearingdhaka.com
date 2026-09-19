import Link from "next/link";
import ProductList from "@/components/HearingAids/List";
import FilterBar from "@/components/HearingAids/FilterBar";
import Pagination from "@/components/HearingAids/Pagination";
import NeedPicker from "@/components/HearingAids/NeedPicker";
import { BreadcrumbJsonLd, ProductRangeJsonLd } from "@/components/ui/JsonLd";
import {
  getProductsBySeries,
  getSeries,
  priceStats,
  type SortKey,
} from "@/routes/product";
import { toDevice, filterByNeed } from "@/lib/catalogue";
import {
  parseListState,
  toNeed,
  clearNeed,
  listHref,
  type ListState,
} from "@/lib/listUrl";
import { fill, type Lang } from "@/lib/i18n";
import { getSite } from "@/routes/site";
import { SITE, formatTaka, toBengaliDigits } from "@/lib/site";

const SORTS: SortKey[] = ["best", "trending", "leatest", "asc", "desc"];

/** Twenty-four fills six rows of four, four of three, twelve of two — a whole
 *  number of rows at every breakpoint, and about four pages of catalogue. */
export const PER_PAGE = 24;

export default async function ProductsView({
  lang,
  searchParams,
}: {
  lang: Lang;
  searchParams?: {
    series?: string;
    sort?: string;
    parts?: string;
    page?: string;
    loss?: string;
    rech?: string;
    hidden?: string;
    max?: string;
  };
}) {
  const bn = lang === "bn";
  const { d } = await getSite(lang);

  const parsed = parseListState(searchParams);
  const state: ListState = {
    ...parsed,
    sort: SORTS.includes(parsed.sort as SortKey) ? parsed.sort : "asc",
  };

  const [rows, allSeries] = await Promise.all([
    getProductsBySeries({
      series: state.series,
      sort: state.sort as SortKey,
      includeAccessories: state.parts,
    }),
    getSeries(),
  ]);

  // The visitor's answers filter the list itself rather than producing a
  // second one beside it. Order is preserved, because sorting is theirs.
  const need = toNeed(state);
  const pool = rows.map((r) => toDevice(r));
  const matching = state.parts ? rows : filterByNeed(pool, need);

  const stats = priceStats(matching);

  const pages = Math.max(1, Math.ceil(matching.length / PER_PAGE));
  const page = Math.min(state.page, pages);
  const shown = matching.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const current: ListState = { ...state, page };

  const activeSeries = allSeries.find(
    (s) => String(s.id ?? s.name) === state.series
  );

  const title = state.parts
    ? d.catalogue.partsTitle
    : activeSeries
    ? `ReSound ${activeSeries.name}`
    : d.products.heading;

  return (
    <div>
      {stats && (
        <ProductRangeJsonLd low={stats.low} high={stats.high} count={stats.count} />
      )}

      {/* So the result reads "sensohearingdhaka.com › Hearing aids" rather
          than the bare URL. The product pages have had this since the SEO
          pass; the two pages above them in the tree had not. */}
      <BreadcrumbJsonLd
        items={[
          { name: d.nav.home, url: `${SITE.url}${lang === "en" ? "/en" : "/"}` },
          { name: title, url: `${SITE.url}${lang === "en" ? "/en" : ""}/hearing-aids` },
        ]}
      />

      {/* ── Header band ──────────────────────────────────────────────── */}
      <header className="border-b border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
          <h1 className="max-w-[16ch] font-display text-5xl font-extrabold leading-[1.08] tracking-tightest text-ink">
            {title}
          </h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-2">
            {state.parts ? d.catalogue.partsLede : d.products.lede}
          </p>

          {stats && !state.parts && (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
              <div>
                <dt className="font-ui text-sm text-ink-muted">
                  {d.catalogue.pricesLabel}
                </dt>
                <dd className="num font-display text-2xl font-extrabold text-ink">
                  {formatTaka(stats.low)} – {formatTaka(stats.high)}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-sm text-ink-muted">
                  {d.catalogue.modelsLabel}
                </dt>
                <dd className="num font-display text-2xl font-extrabold text-ink">
                  {bn ? toBengaliDigits(stats.count) : stats.count}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-sm text-ink-muted">
                  {d.catalogue.brandsLabel}
                </dt>
                <dd className="font-display text-2xl font-extrabold text-ink">
                  ReSound
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-6 text-base text-ink-2">
            <a href="#list" className="underline underline-offset-4 hover:text-ink">
              {d.catalogue.skipToList}
            </a>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {!state.parts && (
          <div className="py-10">
            <NeedPicker lang={lang} d={d} state={current} pool={pool} />
          </div>
        )}

        <div id="list" className="scroll-mt-32">
          <FilterBar
          d={d}
            lang={lang}
            series={allSeries}
            state={current}
            total={matching.length}
            low={stats?.low}
            high={stats?.high}
          />

          <div className="py-8">
            {shown.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-lg text-ink-2">{d.products.empty}</p>
                <p className="mt-2 text-base text-ink-muted">
                  {d.catalogue.emptyHint}
                </p>
                <Link
                  href={listHref(lang, current, {
                    series: "all",
                    parts: false,
                    ...clearNeed(current),
                  })}
                  className="mt-5 inline-flex min-h-[48px] items-center rounded-lg border-[1.5px] border-line-strong bg-paper-surface px-5 font-ui text-ink hover:border-ink-2"
                >
                  {d.catalogue.seeEvery}
                </Link>
              </div>
            ) : (
              <>
                <ProductList products={shown} lang={lang} d={d} />
                <Pagination lang={lang} d={d} state={current} pages={pages} />
                {pages > 1 && (
                  <p className="num mt-4 text-center text-sm text-ink-muted">
                    {fill(d.catalogue.pageOf, {
                      page: bn ? toBengaliDigits(page) : page,
                      pages: bn ? toBengaliDigits(pages) : pages,
                    })}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
