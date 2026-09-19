/**
 * The one way this site talks to the CMS.
 *
 * Eight files under src/routes each grew their own copy of the same fifteen
 * lines: normalise the base URL, fetch, check `res.ok`, check the content type,
 * parse, swallow the error, return null. Eight copies is eight places for the
 * timeout to be added to seven of them, and three of those files had also each
 * declared their own `Pair` type for the same `{ bn, en }` shape.
 *
 * So: one client, one set of rules about what an absent value is, one bilingual
 * pair. Everything above this file describes *what* it wants; nothing above it
 * describes *how* to ask.
 *
 * The rules, in one place:
 *
 *   A failed request is `null`, never a throw. The site's whole fallback story
 *   depends on a dead CMS producing the compiled page rather than a 500 — the
 *   phone number, the address and the opening hours still have to render.
 *
 *   A failure is always logged with the URL and the reason. Silence here was
 *   how the site spent weeks reading a CMS that did not exist.
 *
 *   Blank counts as absent. A row someone cleared should fall back to the
 *   compiled value, not blank a heading on the live site.
 */
import type { Lang } from "@/lib/i18n";

/**
 * A trailing slash here becomes a double slash in every request, which the CMS
 * answers with a redirect to its login page — HTML, where JSON was expected.
 * That is a one-character mistake that empties the catalogue silently, so it is
 * corrected once, here, rather than trusted eight times.
 */
export const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * How long a kind of content may be stale.
 *
 * Named rather than written as `3600` at each call site: the number says
 * nothing about why, and the reason differs. Prices and copy are edited during
 * a working day and should appear the same day; the privacy notice and the
 * team change a few times a year.
 */
export const CACHE = {
  /** Anything a person edits and then reloads the site to check. */
  EDITED: 3600,
  /** Things that change a handful of times a year. */
  RARE: 86400,
} as const;

/** The same string in both languages, as every CMS endpoint returns it. */
export type Pair = { bn: string | null; en: string | null };

export function warn(message: string) {
  console.warn(`[senso api] ${message}`);
}

/**
 * GET a CMS endpoint and return its parsed body, or null.
 *
 * `path` is a path, not a URL — the base belongs to this module.
 */
export async function getJson<T>(
  path: string,
  revalidate: number = CACHE.EDITED
): Promise<T | null> {
  if (!BASE) return null;

  const url = `${BASE}${path}`;

  try {
    const res = await fetch(url, { next: { revalidate } });

    if (!res.ok) {
      warn(`${url} -> HTTP ${res.status}`);
      return null;
    }

    // An HTML login page parses as neither JSON nor an error until you try to
    // read it, so the content type is checked first and reported by name.
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("json")) {
      warn(`${url} -> ${type || "unknown content type"}, expected JSON`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    warn(`${url} -> ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/** The `data` envelope every /api/senso endpoint wraps its payload in. */
export async function getData<T>(
  path: string,
  revalidate: number = CACHE.EDITED
): Promise<T | null> {
  const json = await getJson<{ data?: T }>(path, revalidate);
  return json?.data ?? null;
}

/**
 * A value from the CMS, or the one the code shipped with.
 *
 * Blank counts as absent, in all three of the ways a value arrives blank: null,
 * a string of spaces, and an empty list.
 */
export function pick<T>(fromCms: T | null | undefined, fallback: T): T {
  if (fromCms === null || fromCms === undefined) return fallback;
  if (typeof fromCms === "string" && !fromCms.trim()) return fallback;
  if (Array.isArray(fromCms) && fromCms.length === 0) return fallback;
  return fromCms;
}

/**
 * One side of a bilingual pair, with the other language as the fallback.
 *
 * A row translated into only one language is still better than a gap on the
 * page — an English sentence in a Bangla paragraph is a flaw a reader can work
 * around, and an empty heading is not.
 */
export function say(pair: Pair | null | undefined, lang: Lang): string {
  const mine = (pair?.[lang] ?? "").trim();
  if (mine) return mine;
  return (pair?.[lang === "bn" ? "en" : "bn"] ?? "").trim();
}

/** `say`, with the compiled string as the last resort. */
export function sayOr(pair: Pair | null | undefined, lang: Lang, fallback: string): string {
  return say(pair, lang) || fallback;
}
