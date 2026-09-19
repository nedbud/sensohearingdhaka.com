/**
 * The questions, from the CMS.
 *
 * They lived in src/lib/faq.ts, which meant correcting a price inside an
 * answer — and four of the eleven quote a price — took a developer and a
 * deployment. An FAQ whose answers have gone stale is worse than no FAQ: it is
 * the page people trust most and the one nobody remembers to update.
 *
 * The file stays as the fallback. If the CMS is unreachable, or nobody has
 * written a question yet, the site shows exactly what it shows today.
 */
import { FAQ as FALLBACK, type FaqItem } from "@/lib/faq";
import type { Lang } from "@/lib/i18n";
import { CACHE, getData, say, type Pair } from "@/routes/cms";

interface FaqApi {
  id: number;
  question: Pair;
  answer: Pair;
  roman: string | null;
}

export async function getFaq(lang: Lang): Promise<FaqItem[]> {
  const rows = await getData<FaqApi[]>("/api/senso/faqs", CACHE.EDITED);
  if (!rows) return [...FALLBACK[lang]];

  const items = rows
    .map((row) => {
      // A question written in one language only is still worth showing — it is
      // the answer that matters, and a missing translation should not silently
      // drop the question from the page. `say` falls back to the other
      // language for exactly this.
      const question = say(row.question, lang);
      const answer = say(row.answer, lang);
      if (!question || !answer) return null;

      const item: FaqItem = { question, answer };
      // Assigned only when present: `roman: undefined` and no roman key at all
      // are the same thing to a reader and different things to the type, and
      // the optional property is the honest shape.
      if (row.roman) item.roman = row.roman;
      return item;
    })
    .filter((x): x is FaqItem => x !== null);

  return items.length ? items : [...FALLBACK[lang]];
}
