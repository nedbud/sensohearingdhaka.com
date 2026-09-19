/**
 * The website's own words, fetched from the CMS.
 *
 * Everything the site says that is not a product's own description used to be
 * typed into these files: headings, the address, opening hours, what the price
 * covers, the questions at the bottom of a product page. That made it
 * invisible to Senso — changing an assessment fee meant a developer and a
 * deployment. It now lives in one table, in both languages, editable in the
 * admin panel.
 *
 * Two rules make that safe to depend on:
 *
 *   The site never breaks because a row is missing. Every call passes the
 *   English and Bangla it would have shown anyway, and that is what renders
 *   if the CMS is unreachable or the key has not been created yet. A build
 *   with no API at all produces exactly the site we have today.
 *
 *   A key is a contract. Renaming one here without renaming the row means the
 *   page silently falls back to the code's copy, which looks like nothing
 *   happened — so keys are added, not renamed.
 */
import { CACHE, getData } from "@/routes/cms";
import type { Lang } from "@/lib/i18n";

export type CopyEntry = { bn: string | null; en: string | null; list?: boolean };
export type CopyBook = Record<string, Record<string, CopyEntry>>;

/** Flattened to `key -> entry`; groups only matter to the admin screen. */
export type Copy = Record<string, CopyEntry>;

export async function getCopy(): Promise<Copy> {
  const groups = await getData<CopyBook>("/api/senso/site-copy", CACHE.EDITED);
  if (!groups) return {};

  const flat: Copy = {};
  for (const group of Object.values(groups)) {
    for (const [key, entry] of Object.entries(group)) flat[key] = entry;
  }
  return flat;
}


/**
 * One string. `fallback` is what the page said before this table existed, and
 * what it says again if the row is missing or blank in this language.
 */
export function say(
  copy: Copy,
  key: string,
  lang: Lang,
  fallback: { bn: string; en: string }
): string {
  const entry = copy[key];
  const value = entry?.[lang];
  if (typeof value === "string" && value.trim()) return value.trim();
  // A row that exists in only one language is still better than nothing.
  const other = entry?.[lang === "bn" ? "en" : "bn"];
  if (typeof other === "string" && other.trim()) return other.trim();
  return fallback[lang];
}

/**
 * A list stored as one item per line. Editing a bulleted list as a textarea is
 * what a person expects; splitting it here is what the page expects.
 */
export function sayList(
  copy: Copy,
  key: string,
  lang: Lang,
  fallback: { bn: string[]; en: string[] }
): string[] {
  const raw = say(copy, key, lang, { bn: "", en: "" });
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : fallback[lang];
}
