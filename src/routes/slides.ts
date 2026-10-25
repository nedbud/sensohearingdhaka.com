/**
 * The home page's slides, from the CMS.
 *
 * Same contract as the rest: the code's own slide is the floor, so a build
 * with no API renders exactly the hero we have today, and a CMS with an empty
 * slider does the same rather than showing a blank band.
 */
import type { Lang } from "@/lib/i18n";
import { CACHE, getData, sayOr, type Pair } from "@/routes/cms";

export type Slide = {
  image: string;
  /**
   * The same artwork cut for a portrait screen, if there is one.
   *
   * A wide poster with its subject against the right edge does not survive a
   * tall crop — the subject falls out of it. Where a second cut exists the
   * phone gets that one; where it does not, `image` serves both and the only
   * cost is a less considered crop.
   */
  portrait?: string;
  alt: Pair;
  eyebrow: Pair;
  title: Pair;
  lede: Pair;
  caption: Pair;
  captionLink: Pair;
  href: string;
  /**
   * The slide's own button, where it has one.
   *
   * Absent is the normal case and the shipped case: every slide below leaves
   * this out, and the band then carries the standing WhatsApp button, which
   * is where this clinic's enquiries actually arrive. A campaign that wants
   * to send people somewhere specific instead fills it in the panel and its
   * button takes that slot — one button in the band either way, because two
   * is how a hero stops having a primary action at all.
   */
  button?: { label: Pair; href: string };
};

interface SlideApi {
  image: string | null;
  portrait?: string | null;
  alt: Pair;
  eyebrow: Pair;
  title: Pair;
  lede: Pair;
  caption: Pair;
  caption_link: Pair;
  button_label?: Pair | null;
  button_href?: string | null;
  href: string | null;
}


/**
 * The seven slides the site ships with.
 *
 * These are the clinic's own campaign banners, re-set. The artwork arrived as
 * finished 3000×797 banners with the headline burnt into the left-hand side,
 * which is a poster and not a web page: the words cannot wrap, cannot be
 * translated, cannot be read by a crawler, and are illegible on a phone where
 * a 3.76:1 band is forty pixels tall. So the pictures were cropped to their
 * subject alone and every word below is live text in the site's own typeface,
 * which is also why the English column exists at all.
 *
 * They live here rather than in the dictionary because they are a sequence —
 * seven slides in an order, each with its own picture and link — and splitting
 * that across seventy dictionary keys would make the order invisible.
 *
 * Each file is prepared with the site's own paper down its left-hand side and
 * its reds pulled toward the site's own brand red, so the band keeps one
 * palette however many posters pass through it. A picture uploaded through
 * the panel that is dark all the way across will fight the type; the gradient
 * in the slider covers the seam, but the artwork is where this is settled.
 *
 * This is the floor, not the ceiling. `getSlides` prefers whatever the panel's
 * Hero Slides screen holds, so filling that screen replaces all of this
 * without a deploy, and emptying it brings this back rather than a blank band.
 */
const SHIPPED: readonly Slide[] = [
  {
    image: "/assets/Images/hero/man.webp",
    portrait: "/assets/Images/hero/man-p.webp",
    alt: {
      bn: "কানে হাত রেখে শোনার চেষ্টা করছেন এক প্রবীণ ভদ্রলোক",
      en: "An older man cupping his ear to hear better",
    },
    eyebrow: {
      bn: "পান্থপথ, ঢাকা · ReSound-এর অনুমোদিত ডিলার",
      en: "Panthapath, Dhaka · Authorised ReSound dealer",
    },
    title: { bn: "আপনি কি কানে কম শুনছেন?", en: "Hearing less than you used to?" },
    lede: {
      bn: "শুরুটা হোক শ্রবণ পরীক্ষা দিয়ে। মাত্র {minutes} মিনিটে পরীক্ষা শেষ, রিপোর্ট হাতে পাবেন সেদিনই। হিয়ারিং এইড নেওয়ার সিদ্ধান্ত রিপোর্ট দেখার পরে।",
      en: "Start with a hearing test. It takes {minutes} minutes and the report is in your hand the same day. The decision about a hearing aid comes after the report, not before.",
    },
    caption: { bn: "পরীক্ষার ফি ও সময় — ", en: "Test fees and times — " },
    captionLink: { bn: "দেখে নিন", en: "see them here" },
    href: "/#tests",
  },
  {
    image: "/assets/Images/hero/audiometry.webp",
    portrait: "/assets/Images/hero/audiometry-p.webp",
    alt: {
      bn: "সেনসোর সাউন্ডপ্রুফ কক্ষে অডিওমেট্রি চলছে",
      en: "Audiometry under way in Senso's sound-treated room",
    },
    eyebrow: { bn: "শ্রবণ পরীক্ষা", en: "Hearing assessment" },
    title: { bn: "কানের সমস্যা কোথায়?", en: "Where the trouble is" },
    lede: {
      bn: "কানের সমস্যা নির্ণয়ে গুরুত্বপূর্ণ পরীক্ষাগুলো — পিওর টোন অডিওমেট্রি (PTA), স্পিচ / অ্যাকুস্টিক রিফ্লেক্স (SRT / ART) আর ইম্পিড্যান্স / টিম্পানোমেট্রি। তিনটি একসাথে {minutes} মিনিটে, নিজস্ব সাউন্ডপ্রুফ কক্ষে, অডিওলজিস্টের তত্ত্বাবধানে।",
      en: "Pure tone audiometry (PTA), speech and acoustic reflexes (SRT / ART), and impedance / tympanometry — all three in {minutes} minutes, in our own sound-treated room, with an audiologist.",
    },
    caption: { bn: "সিরিয়াল নিতে — ", en: "To book a slot — " },
    captionLink: { bn: "হোয়াটসঅ্যাপে লিখুন", en: "message us on WhatsApp" },
    href: "/#tests",
  },
  {
    image: "/assets/Images/hero/rie.webp",
    portrait: "/assets/Images/hero/rie-p.webp",
    alt: {
      bn: "ReSound RIE হিয়ারিং এইড — মূল অংশ কানের পেছনে, সরু তারে স্পিকার কানের ভেতরে",
      en: "A ReSound RIE hearing aid: the body sits behind the ear, a thin wire carries the speaker into it",
    },
    eyebrow: { bn: "RIE — রিসিভার ইন ইয়ার", en: "RIE — receiver in ear" },
    title: { bn: "পরিষ্কার শব্দ, প্রায় অদৃশ্য", en: "Clear sound, barely seen" },
    lede: {
      bn: "স্মার্ট প্রযুক্তির পরিষ্কার শব্দ। মূল অংশটি কানের পেছনে, আর স্পিকার সরু একটি তারে কানের ভেতরে — তাই বাইরে থেকে প্রায় চোখেই পড়ে না। সামান্য থেকে বেশি শ্রবণক্ষয়ের জন্য সবচেয়ে বেশি দেওয়া হয় এটাই।",
      en: "The body sits behind the ear and a thin wire carries the speaker inside it, so very little shows. This is the shape we fit most often, from mild loss through to severe.",
    },
    caption: { bn: "RIE মডেল ও দাম — ", en: "RIE models and prices — " },
    captionLink: { bn: "সব দেখুন", en: "see all" },
    href: "/hearing-aids",
  },
  {
    image: "/assets/Images/hero/bte.webp",
    portrait: "/assets/Images/hero/bte-p.webp",
    alt: {
      bn: "ReSound BTE হিয়ারিং এইড — টিউব দিয়ে কানের ভেতরে শব্দ যায়",
      en: "A ReSound BTE hearing aid, which carries sound into the ear through a tube",
    },
    eyebrow: { bn: "BTE — বিহাইন্ড দ্য ইয়ার", en: "BTE — behind the ear" },
    title: { bn: "আরও শক্তি, আরও স্বাধীনতা", en: "More power, more freedom" },
    lede: {
      bn: "আরও পরিষ্কার শব্দ, আরও বেশি স্বাধীনতা — প্রতিদিনের জীবনে শ্রবণকে করে তোলে আরও সহজ ও স্বাভাবিক। বেশি ক্ষমতার দরকার হলে, বা কানের ছাঁচে বানানো মোল্ড লাগলে, এই গড়নটাই চলে।",
      en: "The shape that takes the most power, and the one that pairs with a mould made from your own ear. Where the loss is greater, this is usually what fits.",
    },
    caption: { bn: "BTE মডেল ও দাম — ", en: "BTE models and prices — " },
    captionLink: { bn: "সব দেখুন", en: "see all" },
    href: "/hearing-aids",
  },
  {
    image: "/assets/Images/hero/cic.webp",
    portrait: "/assets/Images/hero/cic-p.webp",
    alt: {
      bn: "কানের ভেতরে বসা CIC হিয়ারিং এইড, বাইরে থেকে দেখা যায় না",
      en: "A CIC hearing aid seated inside the ear canal, out of sight",
    },
    eyebrow: { bn: "CIC — কমপ্লিটলি ইন ক্যানাল", en: "CIC — completely in canal" },
    title: { bn: "অদৃশ্য হিয়ারিং এইড", en: "The one nobody sees" },
    lede: {
      bn: "চোখে অদৃশ্য, ব্যবহারে স্বাচ্ছন্দ্য। কানের ছাঁচে বানানো, পুরোটাই কানের ভেতরে বসে — যাঁরা চান কেউ বুঝতে না পারুক, তাঁদের জন্য।",
      en: "Made from a cast of your own ear and worn entirely inside it. For people whose first question is whether it will show.",
    },
    caption: { bn: "কানের ভেতরের মডেল — ", en: "In-the-ear models — " },
    captionLink: { bn: "দাম দেখুন", en: "see prices" },
    href: "/hearing-aids",
  },
  {
    image: "/assets/Images/hero/newborn.webp",
    portrait: "/assets/Images/hero/newborn-p.webp",
    alt: {
      bn: "নবজাতকের শ্রবণ পরীক্ষা চলছে — OAE, ABR ও ASSR",
      en: "Newborn hearing screening: OAE, ABR and ASSR",
    },
    eyebrow: { bn: "নবজাতক ও শিশু", en: "Newborns and children" },
    title: { bn: "নবজাতকের শ্রবণ পরীক্ষা", en: "Hearing tests for newborns" },
    lede: {
      bn: "OAE, ABR ও ASSR — শিশু ঘুমিয়ে থাকা অবস্থাতেই করা যায়, কিছু বলতে হয় না। শিশু যত শব্দ শোনে তার প্রতিটিই তার ভাষা আর বিকাশের ভিত, তাই দেরি না করাই ভালো।",
      en: "OAE, ABR and ASSR — done while the baby sleeps, with nothing asked of the child. Every sound a baby hears is groundwork for speech, which is why this is not a test to put off.",
    },
    caption: { bn: "শিশুর পরীক্ষার ব্যবস্থা — ", en: "Testing children — " },
    captionLink: { bn: "জেনে নিন", en: "what to expect" },
    href: "/#tests",
  },
  {
    image: "/assets/Images/hero/tinnitus.webp",
    portrait: "/assets/Images/hero/tinnitus-p.webp",
    alt: {
      bn: "কানে অস্বস্তিকর শব্দ শুনে অস্বস্তিতে আছেন এক তরুণ",
      en: "A young man troubled by a sound in his ear",
    },
    eyebrow: { bn: "টিনিটাস", en: "Tinnitus" },
    title: { bn: "নীরবতার মাঝেও কানে শব্দ?", en: "A sound in a silent room?" },
    lede: {
      bn: "নীরবতার মাঝেও কানে অস্বস্তিকর শব্দ শুনতে পাচ্ছেন? এটি শুধু বিরক্তিকর কোনো শব্দ নয় — হতে পারে টিনিটাসের একটি লক্ষণ। কতটা, কোন পর্দায়, আর কানের অবস্থা কী, পরীক্ষা করলেই জানা যায়।",
      en: "It is not simply an annoying noise; it can be a sign of tinnitus. A test shows how much, at which frequencies, and what else is going on in the ear.",
    },
    caption: { bn: "কথা বলতে চাইলে — ", en: "If you would rather talk — " },
    captionLink: { bn: "যোগাযোগ করুন", en: "get in touch" },
    href: "/#contact",
  },
];

/** The shipped sequence, as the slider receives it. */
export function fallbackSlides(): Slide[] {
  return SHIPPED.map((s) => ({ ...s }));
}


export async function getSlides(): Promise<Slide[]> {
  const api = await getData<SlideApi[]>("/api/senso/hero-slides", CACHE.EDITED);
  if (!api) return fallbackSlides();

  const slides = api
    .filter((s) => s.image)
    .map((s) => ({
      image: s.image as string,
      portrait: s.portrait || undefined,
      alt: s.alt ?? { bn: null, en: null },
      eyebrow: s.eyebrow ?? { bn: null, en: null },
      title: s.title ?? { bn: null, en: null },
      lede: s.lede ?? { bn: null, en: null },
      caption: s.caption ?? { bn: null, en: null },
      captionLink: s.caption_link ?? { bn: null, en: null },
      href: s.href || "/hearing-aids",
      /**
       * A button only where there is something to write on it.
       *
       * The label decides, not the link: a link with no words is a button
       * nobody can read, and the panel's own hint says as much. Either side
       * may be blank in the database, so the test is on the words in
       * whichever language was filled — `say` already falls back to the
       * other — and the link falls back to the slide's own.
       */
      ...buttonOn(s),
    }));

  return slides.length ? slides : fallbackSlides();
}

/** `{ button }` where the slide has one, `{}` where it does not. */
function buttonOn(s: SlideApi): { button?: { label: Pair; href: string } } {
  const label = s.button_label ?? { bn: null, en: null };
  const written = (label.bn ?? "").trim() || (label.en ?? "").trim();
  if (!written) return {};

  return {
    button: { label, href: s.button_href || s.href || "/hearing-aids" },
  };
}

/** One side of a pair, falling back to the dictionary's compiled string. */
export const slideText = (pair: Pair, lang: Lang, fallback: string): string =>
  sayOr(pair, lang, fallback);
