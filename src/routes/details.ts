/**
 * Who sits, what a test costs, what a part costs — from the CMS.
 *
 * These three lists are not copy and they are not settings: they are records
 * that go out of date on their own schedule. A staff change, a fee rise, a new
 * battery price. All three were constants in src/lib/site.ts, which is why the
 * team list still reads as it was first given and why nobody could correct a
 * price without a deployment.
 *
 * Same two rules as the clinic record: the constants are the floor, so a build
 * with no API renders exactly the site we have today; and nothing here decides
 * anything — the components still choose what to show.
 */
import { TEAM, TESTS, PARTS } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import { CACHE, getData, say as sayPair, type Pair } from "@/routes/cms";

export type Member = {
  name: Pair;
  role: Pair;
  days: Pair;
  from: number;
  to: number;
};

export type Test = {
  name: Pair;
  fee: number;
  minutes: number;
  minAge: number;
};

export type Part = {
  name: Pair;
  price: number;
  priceHigh: number | null;
  unit: Pair;
};

export type Details = { team: Member[]; tests: Test[]; parts: Part[] };

/** Re-exported so components reach for one `say`, not two with the same name. */
export const say = (pair: Pair, lang: Lang): string => sayPair(pair, lang);

/**
 * What the code shipped with, in the shape the API returns, so the merge below
 * has one type to work in and the components have one type to read.
 *
 * The role and day labels were a lookup table in trustBand keyed by "in-charge"
 * and "sat-thu". They are written out here because that is what the CMS stores:
 * a label a person typed, not a code the site has to know about.
 */
const ROLE: Record<string, Pair> = {
  "in-charge": { bn: "ইন-চার্জ", en: "Centre in-charge" },
  audiologist: { bn: "অডিওলজিস্ট", en: "Audiologist" },
  audiometrician: { bn: "অডিওমেট্রিশিয়ান", en: "Audiometrician" },
  counsellor: { bn: "কাউন্সেলর", en: "Counsellor" },
  pro: { bn: "পাবলিক রিলেশন্স", en: "Public relations" },
};

const DAYS: Record<string, Pair> = {
  "sat-thu": { bn: "শনি – বৃহস্পতি", en: "Sat – Thu" },
  "sun-thu": { bn: "রবি – বৃহস্পতি", en: "Sun – Thu" },
};

const TEST_NAME: Record<string, Pair> = {
  pta: { bn: "PTA — কোন কোন শব্দ কম শুনছেন", en: "PTA — which sounds you are missing" },
  tympanometry: { bn: "Tympanometry — কানের পর্দা ও মধ্যকর্ণ", en: "Tympanometry — eardrum and middle ear" },
  srt: { bn: "Speech / SRT — কথা কতটুকু বোঝেন", en: "Speech / SRT — how much speech you make out" },
};

const PART_NAME: Record<string, Pair> = {
  battery: { bn: "ব্যাটারি", en: "Batteries" },
  earmould: { bn: "ইয়ার মোল্ড", en: "Ear mould" },
  earhook: { bn: "ইয়ার হুক", en: "Ear hook" },
  receiver: { bn: "রিসিভার", en: "Receiver" },
  servicing: { bn: "সার্ভিসিং", en: "Servicing" },
  repair: { bn: "রিপেয়ার", en: "Repair" },
};

const PART_UNIT: Record<string, Pair> = {
  battery: { bn: "এক পাতা (৬ পিস)", en: "a strip of 6" },
  earmould: { bn: "প্রতিটি", en: "each" },
  earhook: { bn: "প্রতিটি", en: "each" },
  receiver: { bn: "প্রতিটি", en: "each" },
  servicing: { bn: "প্রতি ভিজিট", en: "a visit" },
  repair: { bn: "গড়ে", en: "on average" },
};

const fallback = (): Details => ({
  team: TEAM.map((m) => ({
    name: { bn: m.name, en: m.nameEn },
    role: ROLE[m.role] ?? { bn: m.role, en: m.role },
    days: DAYS[m.days] ?? { bn: m.days, en: m.days },
    from: m.from,
    to: m.to,
  })),
  tests: TESTS.map((t) => ({
    name: TEST_NAME[t.id] ?? { bn: t.id, en: t.id },
    fee: t.fee,
    minutes: t.minutes,
    minAge: t.minAge,
  })),
  parts: PARTS.map((p) => ({
    name: PART_NAME[p.id] ?? { bn: p.id, en: p.id },
    price: p.price,
    priceHigh: "priceHigh" in p ? (p.priceHigh as number) : null,
    unit: PART_UNIT[p.id] ?? { bn: "", en: "" },
  })),
});

interface DetailsApi {
  team?: { name: Pair; role: Pair; days: Pair; from: number | null; to: number | null }[];
  tests?: { name: Pair; fee: number | null; minutes: number | null; min_age: number | null }[];
  parts?: { name: Pair; price: number | null; price_high: number | null; unit: Pair }[];
}


const named = (pair: Pair | undefined): boolean =>
  Boolean((pair?.bn ?? "").trim() || (pair?.en ?? "").trim());

export async function getDetails(): Promise<Details> {
  const base = fallback();
  const api = await getData<DetailsApi>("/api/senso/clinic-details", CACHE.EDITED);
  if (!api) return base;

  // A list arrives whole or not at all. Merging row by row would mean a
  // half-emptied table on the CMS side showing a mixture of what is there and
  // what the code remembers, which is the one outcome nobody could debug.
  const team = (api.team ?? [])
    .filter((m) => named(m.name))
    .map((m) => ({
      name: m.name,
      role: m.role,
      days: m.days,
      from: m.from ?? 10,
      to: m.to ?? 20,
    }));

  const tests = (api.tests ?? [])
    .filter((t) => named(t.name) && t.fee !== null)
    .map((t) => ({
      name: t.name,
      fee: t.fee as number,
      minutes: t.minutes ?? 0,
      minAge: t.min_age ?? TESTS[0].minAge,
    }));

  const parts = (api.parts ?? [])
    .filter((p) => named(p.name) && p.price !== null)
    .map((p) => ({
      name: p.name,
      price: p.price as number,
      priceHigh: p.price_high,
      unit: p.unit ?? { bn: null, en: null },
    }));

  return {
    team: team.length ? team : base.team,
    tests: tests.length ? tests : base.tests,
    parts: parts.length ? parts : base.parts,
  };
}
