/**
 * Product data.
 *
 * All fetches are cached with `next: { revalidate }` rather than
 * `cache: "no-store"`. The previous setting meant every page view hit the
 * Laravel API again, on a connection where that is the slowest thing on the
 * page. Prices change rarely; an hour of staleness is fine and the pages
 * become statically renderable, which is what lets the product list be
 * server-rendered and therefore crawlable.
 */

/**
 * The base URL is normalised rather than trusted.
 *
 * `.env.production` carried a trailing slash, so every request became
 * `https://host//api/senso/...`. That path redirects to the CMS login page,
 * which returns HTML; `res.json()` threw; the catch below turned it into an
 * empty list; and an empty list meant `generateStaticParams` produced no
 * product pages at all. A one-character configuration mistake took the whole
 * catalogue off the site without a single error in the build log.
 */
import { BASE, CACHE, getJson } from "@/routes/cms";

export interface ProductMapInterface {
  id?: number;
  series_id?: number;
  brand: string;
  description?: string;
  image: string;
  name: string;
  price: string;
  series: string;
  slug: string;
  /**
   * The list payload carries the full feature list, not just the detail
   * payload. That is what lets the catalogue know each device's fitting
   * range without fetching 109 detail pages.
   */
  features?: { value: string }[];

  /**
   * Attributes the CMS now stores properly, instead of the site inferring
   * them from the model name. Every one is optional and may be null: null
   * means nobody has filled it in yet, and `catalogue.ts` falls back to
   * reading the name exactly as it always did. Nothing here is required for
   * a product to work.
   */
  coverage?: string | null;
  warranty?: string | null;
  form_factor?: string | null;
  power_class?: string | null;
  battery_type?: string | null;
  tier?: string | null;
  system_type?: string | null;
  channels?: number | null;
  is_accessory?: boolean | null;
  fitting_range?: { from: number; to: number } | null;
}

export interface productsInterface {
  products: ProductMapInterface[];
}

export interface getBestProductsInterface {
  products: ProductMapInterface[];
}

type ApiList = { data?: ProductMapInterface[] };


/**
 * Called from `generateStaticParams`. An empty catalogue there is not a
 * degraded page, it is a site with no products on it — so it fails the build
 * loudly instead of shipping 404s for every hearing aid.
 */
export async function getProductsOrFail(): Promise<ProductMapInterface[]> {
  const products = await getProducts();
  if (!products.length) {
    throw new Error(
      `[senso api] The product list came back empty from ${BASE}. ` +
        `Nothing would be built for /hearing-aids. Check NEXT_PUBLIC_BASE_URL ` +
        `— it must point at the website CMS (cloud.sensohearingdhaka.com), ` +
        `with no trailing slash.`
    );
  }
  return products;
}

export async function getBestProducts(): Promise<ProductMapInterface[]> {
  const json = await getJson<ApiList>(
    "/api/senso/products/list?best=true"
  );
  return json?.data ?? [];
}

export async function getProducts(): Promise<ProductMapInterface[]> {
  const json = await getJson<ApiList>("/api/senso/products/list");
  return json?.data ?? [];
}

export type SortKey = "best" | "trending" | "leatest" | "asc" | "desc";

/**
 * Series that are consumables rather than hearing aids.
 *
 * The catalogue mixes devices with batteries and spare parts, so anything
 * that computes "prices from ..." or an AggregateOffer over the whole list
 * ends up advertising hearing aids from BDT 300 — which is a battery.
 * ("Hearign Aid Battery" is spelled that way in the CMS.)
 */
export const ACCESSORY_SERIES = ["Hearign Aid Battery", "No Series"];

export function isAccessory(p: ProductMapInterface) {
  // The column when it is set, the series name when it is not.
  if (typeof p.is_accessory === "boolean") return p.is_accessory;
  return ACCESSORY_SERIES.includes(p.series);
}

export function priceStats(products: ProductMapInterface[]) {
  const values = products
    .filter((p) => !isAccessory(p))
    .map((p) => parseFloat(p.price))
    .filter((n) => isFinite(n) && n > 0);
  if (!values.length) return null;
  return {
    low: Math.round(Math.min(...values)),
    high: Math.round(Math.max(...values)),
    count: values.length,
  };
}

/**
 * Filtering and sorting happen here, over the full catalogue, rather than
 * through /products/series.
 *
 * That endpoint returns 40 rows where /products/list returns 109, so using
 * it silently hid roughly two thirds of the catalogue — including whole
 * series. It also cost a network round trip per filter click. One cached
 * fetch of the full list and an in-memory filter is both complete and
 * faster. `best`, `trending` and `latest` are not present on the list
 * payload, so those three still ask the API.
 */
export async function getProductsBySeries(opts: {
  series?: string | number;
  sort?: SortKey;
  includeAccessories?: boolean;
}): Promise<ProductMapInterface[]> {
  const series = String(opts.series ?? "all");
  const sort = opts.sort ?? "desc";

  if (sort === "best" || sort === "trending" || sort === "leatest") {
    const params = new URLSearchParams({
      series,
      best: String(sort === "best"),
      leatest: String(sort === "leatest"),
      trending: String(sort === "trending"),
      sort: "desc",
    });
    const json = await getJson<ApiList>(
      `/api/senso/products/series?${params.toString()}`
    );
    return json?.data ?? [];
  }

  let rows = await getProducts();

  if (!opts.includeAccessories) rows = rows.filter((p) => !isAccessory(p));

  if (series !== "all") {
    rows = rows.filter(
      (p) => String(p.series_id) === series || p.series === series
    );
  }

  return rows.sort((a, b) => {
    const x = parseFloat(a.price) || 0;
    const y = parseFloat(b.price) || 0;
    return sort === "asc" ? x - y : y - x;
  });
}

export interface ProductInterface {
  product: {
    name: string;
    version: string;
    brand: string;
    series: string;
    warranty: string;
    price: string;
    coverage: string;
    avatar: string;
    video_link: string;
    cover_image: string;
    cover_video_url?: string | null;
    images: { path: string }[];
    features: { value: string }[];
    description: string;
    contents: {
      id?: number;
      title: string;
      content: string;
      image: string;
      created_at: string;
      /** overview | who_for | not_for | daily_life | care | questions */
      kind?: string | null;
      /** A YouTube or Facebook link, stored as pasted. */
      video_url?: string | null;
      /** What the picture shows. */
      caption?: string | null;
      /** "bn" | "en" — null on blocks written before the column existed */
      lang?: string | null;
      position?: number | null;
    }[];
    created_at: string;
    meta_title?: string | null;
    meta_description?: string | null;

    // Same optional attributes as the list payload — see ProductMapInterface.
    form_factor?: string | null;
    power_class?: string | null;
    battery_type?: string | null;
    tier?: string | null;
    system_type?: string | null;
    channels?: number | null;
    is_accessory?: boolean | null;
    fitting_range?: { from: number; to: number } | null;
  };
}

export async function getProduct(slug: string) {
  return getJson<{ data: ProductInterface["product"] }>(
    `/api/senso/products/seo/${slug}`
  );
}

export interface SeriesInterface {
  series: { id?: number; name: string }[];
}

export async function getSeries(): Promise<{ id?: number; name: string }[]> {
  const json = await getJson<{ data?: { id?: number; name: string }[] }>(
    "/api/senso/series/select",
    CACHE.RARE
  );
  return json?.data ?? [];
}
