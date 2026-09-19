/**
 * The site's words, from the CMS, over the top of the ones in the code.
 *
 * src/lib/i18n.ts holds every label and heading on the site in both languages.
 * That made all of it invisible to Senso: changing "কানের মেশিন" in the menu,
 * or the sentence under the headline, meant a developer and a deployment.
 *
 * The keys in the site_copy table are the same dotted paths as the shape of
 * that file — `nav.home`, `hero.title`, `footer.contact` — so a row can be laid
 * straight over the value it replaces without a translation table between them.
 *
 * The file remains the fallback, and that is the whole safety property: a row
 * that is missing, blank in this language, or unreachable because the CMS is
 * down leaves the compiled string in place. A build with no API at all renders
 * exactly the site we have today.
 */
import { dict, type Lang } from "@/lib/i18n";
import { CACHE, getData } from "@/routes/cms";

export type Dict = ReturnType<typeof dict>;

type Entry = { bn: string | null; en: string | null; list?: boolean };

async function fetchCopy(): Promise<Record<string, Entry>> {
  const groups = await getData<Record<string, Record<string, Entry>>>(
    "/api/senso/site-copy",
    CACHE.EDITED
  );
  if (!groups) return {};

  // The API groups rows for the editing screen's benefit; the overlay below
  // wants one flat map from dotted key to value.
  const flat: Record<string, Entry> = {};
  for (const group of Object.values(groups)) {
    for (const [key, entry] of Object.entries(group)) flat[key] = entry;
  }
  return flat;
}

/**
 * Nothing in the dictionary may be a function.
 *
 * The pages hand `d` to client components — the sticky contact bar, the
 * related-devices carousel, the product grid — and React cannot serialise a
 * function across that boundary. It does not fail at the call site either: it
 * fails during the static export, on every one of the 232 pages at once, with
 * an error that names the object and not the file.
 *
 * So the rule is enforced where it can be seen. Putting a function back into
 * src/lib/i18n.ts turns that property into `never` here and this assignment
 * stops compiling — a typecheck error with the property's name in it, before
 * anything is built.
 */
type Serialisable<T> = T extends (...args: never[]) => unknown
  ? never
  : T extends object
    ? { [K in keyof T]: Serialisable<T[K]> }
    : T;

const DICTIONARY_HOLDS_NO_FUNCTIONS: Serialisable<Dict> = dict("bn");
void DICTIONARY_HOLDS_NO_FUNCTIONS;

/**
 * Writes `value` at a dotted path, but only where the code already has a string
 * there.
 *
 * The guard matters. A typo in a key — `hero.titel` — would otherwise invent a
 * property nothing reads, and the page would render the old text with no sign
 * that anything was wrong. Refusing to create paths means a mistyped key is
 * simply ignored, which is the same outcome the fallback already guarantees.
 *
 * Functions are skipped too: a few entries in the dictionary are functions
 * (`openUntil(h)`), and a string cannot replace one without breaking the call.
 */
function overlay(target: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split(".");
  let node: Record<string, unknown> = target;

  for (const part of parts.slice(0, -1)) {
    const next = node[part];
    if (typeof next !== "object" || next === null) return;
    node = next as Record<string, unknown>;
  }

  const leaf = parts[parts.length - 1];
  if (typeof node[leaf] !== "string") return;
  node[leaf] = value;
}

/**
 * A mutable deep copy.
 *
 * Written out rather than a JSON round trip because this runs on every page
 * render and the dictionary is a few hundred short strings — but either would
 * be correct now. It was not always: three entries used to be functions, and
 * JSON.stringify drops those.
 */
function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clone) as unknown as T;
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = clone(v);
    return out as T;
  }
  return value;
}

/**
 * A mutable copy: the dictionary is declared `as const`, so nothing can be
 * written into it, and writing into it would in any case leak one request's
 * content into the next.
 */
export async function getDict(lang: Lang): Promise<Dict> {
  const base = clone(dict(lang)) as Dict;
  const copy = await fetchCopy();

  for (const [key, entry] of Object.entries(copy)) {
    const value = entry?.[lang]?.trim();
    if (value) overlay(base as unknown as Record<string, unknown>, key, value);
  }

  return base;
}
