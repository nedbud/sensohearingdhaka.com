/**
 * Everything factual about the business, as supplied by Senso on the
 * information form (returned 31 Aug 2026). Nothing here is guessed.
 *
 * This file is the source for the contact facts, not the CMS. That was once
 * because the old CMS's company-settings endpoint returned seeder rubbish
 * (phone "01234567", address "Recusandae Et dolor"); NedCMS answers that
 * endpoint from the Business global now, so the reason has expired and the
 * values should move to the panel — see `getContact` in routes/company.ts
 * for what that still needs. Until then a number change is a deploy.
 *
 * STILL MISSING from the form — ask before launch:
 *   - email address (left blank; the old site used info@sensohearingdhaka.com)
 *   - whether the trial requires a deposit
 *   - staff qualifications (names and roles given, no degrees)
 *   - patient testimonials, referring ENT doctors, Google review count
 *   - domain / hosting / Google Business Profile / Search Console access
 */

/**
 * The numbers, written once.
 *
 * On 9 Oct 2026 the clinic said the primary number was wrong — theirs ends
 * 07, the site said 97 — and correcting it meant changing fourteen literals
 * in six files. Three of those were in this object alone, where the dialling
 * form, the printed form and the WhatsApp id were three independent copies of
 * the same eleven digits.
 *
 * A number typed in fourteen places is a number that ends up wrong in one of
 * them, and the copy that stays wrong is the one nobody is looking at while
 * they check — here it was an OG image and a rate-limit message.
 *
 * So the local form is the only literal and every other form is computed.
 * Nothing below this line should contain a digit of a phone number.
 */
const PHONE_PRIMARY = "01322-926207";
const PHONE_SECOND = "01805-051278";
const LANDLINE = "02-9128045";

/** `+8801322926207` — what a `tel:` link and schema.org want. */
const e164 = (local: string) => `+880${local.replace(/\D/g, "").replace(/^0/, "")}`;

/** `8801322926207` — what wa.me wants: no plus, no dashes. */
const waId = (local: string) => `880${local.replace(/\D/g, "").replace(/^0/, "")}`;

export const SITE = {
  name: "Senso Hearing Centre",
  nameBn: "সেনসো হিয়ারিং সেন্টার",
  /**
   * No www.
   *
   * Every canonical, every sitemap entry, every og:url and the @id on the
   * structured data is built from this one line, so it has to be the URL the
   * server actually serves — and nginx answers on the bare domain and sends
   * www there with a 301. Declaring a canonical that is itself a redirect is
   * sloppy at best.
   *
   * The deciding evidence was Facebook's own scraper: it reports 2,379 likes,
   * shares and comments against https://sensohearingdhaka.com/ and nothing
   * against the www form. Those counts are tied to the exact URL. Moving the
   * site to www would not carry them across — it would start the count at
   * zero and throw away years of sharing.
   */
  url: "https://sensohearingdhaka.com",

  address: {
    line: "57/9, Artisan Center (4th floor), Panthapath Signal",
    lineBn: "৫৭/৯, আর্টিসান সেন্টার (৪র্থ তলা), পান্থপথ সিগনাল",
    city: "Dhaka",
    cityBn: "ঢাকা",
    // ⚠️ Senso wrote 1215 on the form, in both Bangla and English. Every
    // other source — the current site, resoundbd.com and ReSound's own
    // distributor listing — says 1205, which is the postcode Panthapath
    // normally falls under. Confirm before launch: a wrong postcode is
    // exactly the kind of NAP inconsistency that costs local ranking.
    postcode: "1215",
    country: "BD",
    landmark: "Panthapath / Green Road signal, the building next to Ajwa food shop",
    landmarkBn: "পান্থপথ / গ্রীনরোড সিগনাল, আজোয়া খাবারের দোকানের পাশের বিল্ডিং",
    floorNote: "Lift to the 4th floor. Parking available.",
    floorNoteBn: "লিফটে ৪ তলা। পার্কিং ব্যবস্থা আছে।",
    /**
     * The business listing, not a dropped pin.
     *
     * The `!16s%2Fg%2F11fgm6bq_3` on the end is Google's own id for Senso
     * Hearing Centre, so this opens the place — name, hours, reviews, the
     * Directions button — rather than a coordinate that happens to be on
     * the roof. `1e3` asks for satellite: on Panthapath the useful thing is
     * seeing which building it is, and the shopfront signboard is not on
     * the street map.
     *
     * The `?entry=ttu&g_ep=...` that Google appends when you copy a link is
     * deliberately not here. Those are session and analytics parameters —
     * they change every time the link is copied and mean nothing to anyone
     * who follows it.
     */
    mapsUrl:
      "https://www.google.com/maps/place/Senso+Hearing+Centre+Dhaka/@23.7515441,90.3857366,271m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3755b9a126444b51:0xd5ea0863ae6b7f8c!8m2!3d23.7515441!4d90.3863803!16s%2Fg%2F11fgm6bq_3",
    geo: { lat: 23.7515441, lng: 90.3863803 },
  },

  phones: [e164(PHONE_PRIMARY), e164(PHONE_SECOND), e164(LANDLINE)],
  phoneDisplay: PHONE_PRIMARY,
  phoneDisplay2: PHONE_SECOND,
  // Senso gave two WhatsApp numbers; the first is the primary.
  whatsapp: waId(PHONE_PRIMARY),
  whatsappAlt: waId(PHONE_SECOND),
  email: "info@sensohearingdhaka.com", // not given on the form — verify
  /**
   * Not for display. Senso asked for the trade licence number to be taken
   * off the site, so nothing renders it — not the footer, not the trust
   * band, not the structured data. It stays here because it is a real fact
   * about the business that may be needed for a form or a submission one
   * day, and because leaving it recorded with this note is what stops it
   * quietly reappearing on a page later.
   */
  tradeLicence: "TRAD/DSCC/242022/2019",

  facebookPageId: "212954412245615",

  /**
   * Where Senso already exists online.
   *
   * These are not decoration. Google uses `sameAs` to tie a website to the
   * profiles of the same business elsewhere, which is how a search for
   * "senso hearing" resolves to one entity instead of three unrelated
   * results — and the Facebook page is the one with the history on it:
   * thousands of followers and years of posts and replies. Linking the two
   * in both directions is what makes the site part of that entity rather
   * than a fourth stranger claiming the name.
   *
   * The YouTube channel is real but has nothing on it yet. It is declared
   * here for the entity link and listed in the footer, and deliberately not
   * promoted anywhere as something to go and watch.
   */
  social: {
    facebook: "https://www.facebook.com/sensohearingcenter/",
    youtube: "https://www.youtube.com/@sensohearingcenter",
  },

  // 0 = Sunday ... 6 = Saturday. Friday and government holidays closed.
  hours: {
    0: [10, 20], 1: [10, 20], 2: [10, 20], 3: [10, 20],
    4: [10, 20], 5: null, 6: [10, 20],
  } as Record<number, [number, number] | null>,

  /**
   * Senso answered "অথোরাইজড ডিলার" — authorised dealer, not the exclusive
   * distributor their Messenger replies have claimed. The weaker, accurate
   * word is used everywhere on the site. ReSound's own distributor page
   * still lists the entity, which is what makes it verifiable.
   */
  dealer: {
    status: "authorised" as const,
    entity: "Tabassum International C/O Senso Hearing Centre, Dhaka",
    brand: "ReSound",
    proofUrl: "https://www.resound.com/en/worldwide-distributors",
    certificateOnFile: true,
  },

  payments: {
    cards: true,
    bkash: true,
    banglaQr: true,
    emi: false, // explicitly "নেই" on the form — do not advertise instalments
    tradeIn: false,
  },

  /** The year on the sign in Panthapath. The number band prints it. */
  foundedYear: 2007,

  /** All three tests together — the usual adult assessment. Kept beside the
   *  warranty rather than in TEST_PACKAGE because the hero paragraph, the
   *  number band and the fee table all quote it, and they must not drift. */
  testPackage: {
    fee: 1600,
    minutes: 35,
  },

  warranty: {
    years: 2,
    accessoryYears: 1,
    followUpMonths: 4,
    excluded: "physical damage, fire, tearing, and water damage",
    excludedBn: "ভেঙে গেলে, আগুনে পুড়লে, ছিঁড়ে গেলে বা পানিতে ভিজে নষ্ট হলে",
    replacementDiscount: 60, // BRX policy: buy a replacement at 60% of price
  },

  service: {
    /** Senso services ReSound only — not Signia, Phonak or Oticon. */
    brands: ["ReSound"] as const,
    otherBrands: false,
    boughtAbroad: true,
    inHouseDays: 1,
    overseasWeeks: "6–8",
    courier: true,
  },

  outsideDhaka: {
    branches: false,
    dealerPoints: true,
    sameDayPossible: true,
    arriveBy: 10,
    totalHours: "3–4",
    videoFollowUp: true,
    followUpFrom: 10,
    followUpTo: 19,
  },

  hospitals: ["CMH", "BMU", "DMCH", "MMCH", "SOMCH", "SSMCMH"],
} as const;

/** Test fees, times and age limits, as given by Senso. */
export const TESTS = [
  { id: "pta", fee: 800, minutes: 25, minAge: 5 },
  { id: "tympanometry", fee: 400, minutes: 5, minAge: 5 },
  { id: "srt", fee: 400, minutes: 5, minAge: 5 },
] as const;

/** All three together — the usual adult assessment. */
export const TEST_PACKAGE = { fee: 1600, minutes: 35 } as const;

/** Parts and service. "এক পাতায় ৬ পিস" — six cells to a strip. */
export const PARTS = [
  { id: "battery", price: 250, unit: "strip", note: "6 per strip" },
  { id: "earmould", price: 1200, unit: "each" },
  { id: "earhook", price: 1500, unit: "each" },
  { id: "receiver", price: 6000, priceHigh: 8000, unit: "each" },
  { id: "servicing", price: 500, unit: "visit" },
  { id: "repair", price: 8500, unit: "average" },
] as const;

/** Team, as given. No qualifications were supplied — ask for them. */
export const TEAM = [
  { name: "আব্দুস সালাম রবিন", nameEn: "Abdus Salam Robin", role: "in-charge", days: "sat-thu", from: 13, to: 19 },
  { name: "রুবাইয়া", nameEn: "Rubaiya", role: "audiologist", days: "sat-thu", from: 10, to: 20 },
  { name: "শরিফুল", nameEn: "Shariful", role: "audiometrician", days: "sat-thu", from: 10, to: 20 },
  { name: "শিমু", nameEn: "Shimu", role: "counsellor", days: "sat-thu", from: 10, to: 20 },
  { name: "অভি", nameEn: "Ovi", role: "pro", days: "sun-thu", from: 10, to: 19 },
] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string = SITE.phones[0]) {
  return `tel:${phone}`;
}

/** Western digits — Bangladeshi commerce convention, and what people type
 *  into bKash. Bengali digits are for prose and times, not money. */
export function formatTaka(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!isFinite(n)) return "";
  return `৳ ${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * The number as it is printed, in the script of the page printing it.
 *
 * Bangla pages print Bengali digits; the dialling forms never do. This
 * exists so that no component writes the number out again — three of them
 * did, in both scripts, which is how six of the fourteen wrong copies came
 * to be. A component that needs the number calls this.
 */
export function phoneText(lang: "bn" | "en", which: 1 | 2 = 1): string {
  const n = which === 1 ? SITE.phoneDisplay : SITE.phoneDisplay2;
  return lang === "bn" ? toBengaliDigits(n) : n;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export function toBengaliDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[+d]);
}

/**
 * "ঢাকা-১২১৫" or "Dhaka-1215".
 *
 * Six components built this line by hand — the footer, the visit section, the
 * About page, the privacy notice, the product page and the old contact
 * section — and all six of them printed the postcode in Western digits
 * inside a Bangla address. It read as "ঢাকা-1215": the city in one script,
 * the number in another, on the line a patient copies into a rickshaw
 * driver's phone.
 *
 * One function, because six copies of a two-line expression is six places
 * for the seventh to be written differently.
 *
 * The structured-data postcode is deliberately NOT built from here. Schema.org
 * postalCode is read by machines, and Google's local listing has to match the
 * Business Profile character for character.
 */
export function cityLine(
  address: { city: string; cityBn: string; postcode: string },
  lang: "bn" | "en"
): string {
  return lang === "bn"
    ? `${address.cityBn}-${toBengaliDigits(address.postcode)}`
    : `${address.city}-${address.postcode}`;
}

export type OpenState = {
  isOpen: boolean;
  closesAt?: number;
  nextDay?: number;
  nextOpensAt?: number;
};

/**
 * A span per weekday, or null for a day the centre is shut.
 *
 * `readonly number[]` rather than a two-element tuple because these arrive
 * from the CMS as well as from the constant below, and a JSON array cannot
 * promise its own length. The guard in getOpenState does that instead.
 */
export type Hours = Readonly<Record<number, readonly number[] | null>>;

/**
 * Whether the centre is open at this moment, and when it next opens.
 *
 * The opening hours are a parameter rather than a constant read from inside.
 * They come from the Company Profile screen now, and a function that reached
 * for SITE.hours regardless would have gone on saying "open until 8 PM" after
 * somebody changed the closing time in the panel — quietly, on the one line on
 * the page a visitor acts on immediately.
 */
export function getOpenState(
  hours: Hours = SITE.hours,
  now: Date = new Date()
): OpenState {
  const dhaka = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const day = dhaka.getDay();
  const hour = dhaka.getHours() + dhaka.getMinutes() / 60;
  const open = (day: number): readonly number[] | null => {
    const span = hours[day];
    return span && span.length >= 2 ? span : null;
  };

  const span = open(day);

  if (span && hour >= span[0] && hour < span[1]) {
    return { isOpen: true, closesAt: span[1] };
  }
  let d = day;
  for (let step = 0; step < 8; step++) {
    if (step > 0 || !span || hour >= span[1]) d = (d + 1) % 7;
    const next = open(d);
    if (next) return { isOpen: false, nextDay: d, nextOpensAt: next[0] };
  }
  return { isOpen: false };
}

/**
 * hreflang map. Cast because Next's `Languages` type enumerates a fixed set
 * of locale keys and does not include "en-BD" — which is nonetheless correct
 * here: one country, two languages. Bangla is x-default.
 */
export function altLanguages(bnPath: string, enPath: string) {
  return { "bn-BD": bnPath, "en-BD": enPath, "x-default": bnPath } as any;
}
