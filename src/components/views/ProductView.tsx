import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTaka, toBengaliDigits } from "@/lib/site";
import type { Clinic } from "@/routes/clinic";
import type { Part } from "@/routes/details";
import { fill, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { taxonomy } from "@/routes/taxonomy";
import {
  toDevice,
  devicesOnly,
  FORM_FACTOR,
  LOSS_LABEL,
  LOSS_FEELS,
  TIER_LABEL,
  lossRangeLabel,
  type LossLevel,
} from "@/lib/catalogue";
import {
  ProductJsonLd,
  FaqJsonLd,
  BreadcrumbJsonLd,
} from "@/components/ui/JsonLd";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { CheckIcon } from "@/components/ui/Icons";
import LossScale from "@/components/product/LossScale";
import RelatedDevices from "@/components/product/RelatedDevices";
import ProductGallery from "@/components/product/ProductGallery";
import { productFaq } from "@/components/product/ProductFaq";
import { say, sayList, type Copy } from "@/routes/siteCopy";
import { videoThumb } from "@/lib/video";
import { toEmbed } from "@/lib/video";
import type { ProductInterface, ProductMapInterface } from "@/routes/product";

type Product = ProductInterface["product"];

const ORDER: LossLevel[] = ["mild", "moderate", "severe", "profound"];

/**
 * The product page, built as a profile.
 *
 * Almost everyone arriving here has spent years reading profile pages, and
 * they read one without being taught: a cover, a face, a name with a line
 * under it, a row of buttons, a column of short boxes on one side and a feed
 * of longer things down the other. That shape is already in the reader before
 * the page loads, which is worth more on a slow connection in Dhaka than any
 * amount of novelty.
 *
 * So the device gets a profile. The photo is the face. The stats under the
 * name are the numbers a buyer actually weighs — price, how much loss it
 * covers, how many channels, how long the warranty runs. The side column
 * holds the short, glanceable things: the summary, the photos, the feature
 * list, where the clinic is. The main column is the feed — every block Senso
 * wrote, in order, one card at a time, ending with the questions people ask.
 *
 * None of it borrows anyone's branding. The layout is a convention; the
 * typography, the red and the voice are Senso's.
 */
export default function ProductView({
  product,
  catalogue,
  lang,
  slug,
  copy,
  clinic,
  d,
  parts,
}: {
  product: Product | null;
  catalogue: ProductMapInterface[];
  lang: Lang;
  slug: string;
  copy: Copy;
  clinic: Clinic;
  d: Dict;
  parts: Part[];
}) {
  if (!product) notFound();
  const bn = lang === "bn";
  const prefix = lang === "en" ? "/en" : "";

  /** A figure in the reader's own numerals. Used wherever a template has a
   *  {placeholder} standing in for one. */
  const num = (v: number | string) => (bn ? toBengaliDigits(v) : String(v));
  const tax = taxonomy(d);

  const T = (key: string, bnText: string, enText: string) =>
    say(copy, key, lang, { bn: bnText, en: enText });
  const TL = (key: string, bnList: string[], enList: string[]) =>
    sayList(copy, key, lang, { bn: bnList, en: enList });

  const device = toDevice(
    {
      brand: product.brand,
      image: product.avatar,
      name: product.name,
      price: product.price,
      series: product.series,
      slug,
      description: product.description,
      features: product.features,
      coverage: product.coverage,
      form_factor: product.form_factor,
      power_class: product.power_class,
      battery_type: product.battery_type,
      tier: product.tier,
      system_type: product.system_type,
      channels: product.channels,
      is_accessory: product.is_accessory,
      fitting_range: product.fitting_range,
    },
    product.coverage
  );

  const url = `${clinic.url}${prefix}/hearing-aids/${slug}`;

  /**
   * The gallery builds itself.
   *
   * There is no separate place to upload pictures for it, because a separate
   * place is a second thing to remember and a second thing to forget.
   * Everything shown here came in attached to something somebody wrote: the
   * photograph of the charger that went with the care note, the video of a
   * wax filter being changed. Write about the product and the gallery fills.
   *
   * Videos sit in the grid beside the photographs rather than being buried
   * further down the page — YouTube publishes a still at a predictable
   * address, and anything else gets a plain tile with a play mark.
   */
  type Shot = {
    src: string | null;
    caption: string;
    video?: boolean;
    href?: string;
  };

  const fromWriting: Shot[] = (product.contents ?? [])
    .filter((c) => !c.lang || c.lang === lang)
    .flatMap((c) => {
      const out: Shot[] = [];
      const anchor = c.id ? `#block-${c.id}` : undefined;

      if (c.image && c.image.length > 20) {
        out.push({ src: c.image, caption: c.caption || c.title || "", href: anchor });
      }
      if (c.video_url) {
        out.push({
          src: videoThumb(c.video_url),
          caption: c.caption || c.title || "",
          video: true,
          href: anchor,
        });
      }
      return out;
    });

  const productImages: Shot[] = [product.avatar, ...(product.images ?? []).map((i) => i.path)]
    .filter((src) => typeof src === "string" && src.length > 20)
    .map((src) => ({ src: src as string, caption: "" }));

  const gallery = [...productImages, ...fromWriting]
    .filter(
      (g, i, all) => !g.src || all.findIndex((x) => x.src === g.src) === i
    )
    .slice(0, 12);

  const hero =
    productImages[0]?.src ||
    gallery.find((g) => g.src && !g.video)?.src ||
    "/assets/Images/Common/senso_404_not_found.png";

  /**
   * The cover.
   *
   * A picture, a video, or neither. A video is shown as its own still frame
   * with a play mark rather than as an autoplaying embed: this page is read
   * on mobile data in Dhaka, and an iframe that starts a stream before anyone
   * has asked is several megabytes spent on somebody who came to read about a
   * hearing aid. Tapping it plays the video where it belongs, in the feed.
   *
   * With neither, the band falls back to the product's own photograph at very
   * low opacity — enough for the cover to belong to this device rather than
   * to the brand in general.
   */
  const coverVideoThumb = product.cover_video_url
    ? videoThumb(product.cover_video_url)
    : null;
  const coverImage =
    product.cover_image && product.cover_image.length > 20
      ? product.cover_image
      : null;
  const coverSrc = product.cover_video_url
    ? coverVideoThumb ?? coverImage
    : coverImage;
  const coverIsVideo = Boolean(product.cover_video_url);
  // If the same video is also a content block, the play button lands there
  // rather than sending the reader off to YouTube.
  const coverBlock = (product.contents ?? []).find(
    (c) => c.video_url && c.video_url === product.cover_video_url
  );
  const coverHref: string | undefined = coverIsVideo
    ? coverBlock?.id
      ? `#block-${coverBlock.id}`
      : product.cover_video_url ?? undefined
    : undefined;

  const covered = ORDER.slice(
    ORDER.indexOf(device.lossFrom),
    ORDER.indexOf(device.lossTo) + 1
  );

  /**
   * Category order first, then the order somebody put the blocks in.
   *
   * A product can carry any number of blocks under a category — a second
   * photograph, a note added a year later, a video — and they have to read in
   * the sequence they were arranged, under the heading they were filed under.
   */
  const KIND_ORDER = ["overview", "who_for", "not_for", "daily_life", "care", "questions"];
  const blocks = [...(product.contents ?? [])]
    .filter((c) => !c.lang || c.lang === lang)
    .sort((a, b) => {
      const ka = KIND_ORDER.indexOf(a.kind ?? "");
      const kb = KIND_ORDER.indexOf(b.kind ?? "");
      if (ka !== kb) return (ka < 0 ? 99 : ka) - (kb < 0 ? 99 : kb);
      return (a.position ?? 99) - (b.position ?? 99);
    });

  const limits = blocks.filter((c) => c.kind === "not_for");

  const parsedFaq = blocks
    .filter((c) => c.kind === "questions")
    .map((c) => c.content)
    .join("\n\n")
    .split(/\n\s*\n/)
    .map((chunk) => {
      const [head, ...rest] = chunk.split("\n");
      const question = head.replace(/^\*\*|\*\*$/g, "").trim();
      const answer = rest.join(" ").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter(Boolean) as { question: string; answer: string }[];

  const prose = blocks.filter(
    (c) => c.kind !== "not_for" && c.kind !== "questions"
  );

  const rawAbout = prose.length === 0 ? product.description : null;

  const singleMic = device.formFactor === "cic" || device.formFactor === "iic";
  const isCros = Boolean(device.systemType);

  const DIRECTIONAL =
    /direction|beamform|all\s*access|ultra\s*focus|front\s*focus|360|binaural|auto\s*scope|multi\s*scope|spatial\s*sense/i;
  const features = (product.features ?? []).filter(
    (f) => !singleMic || !DIRECTIONAL.test(f.value)
  );

  const faq = parsedFaq.length ? parsedFaq : productFaq(device, lang, clinic, d, parts);
  const others = devicesOnly(catalogue);

  const crosShort = T(
    "device.crosShort",
    "খারাপ কানে পরার ট্রান্সমিটার",
    "Transmitter, worn on the poor ear"
  );
  const crosLong = T(
    "device.crosLong",
    "মূল অংশটা কানের পেছনে বসে, ঠিক সাধারণ RIE-র মতোই — পার্থক্য হলো কানের ভেতরে কোনো স্পিকার নেই। এটি শুধু ওই পাশের শব্দ ধরে বেতারে অন্য কানের হিয়ারিং এইডে পাঠিয়ে দেয়।",
    "The body sits behind the ear exactly like an ordinary RIE — the difference is that there is no speaker in the canal. It picks up sound arriving on that side and sends it wirelessly to the hearing aid on your other ear."
  );

  const included = TL(
    "price.included",
    [
      "অডিওলজিস্টের সময় — মেশিন বাছাই ও পরামর্শ",
      "আপনার অডিওগ্রাম অনুযায়ী মেশিন প্রোগ্রাম করা ও যাচাই করা",
      "কানের ছাঁচ অনুযায়ী ইয়ার মোল্ড",
      `প্রতি ${toBengaliDigits(clinic.warranty.followUpMonths)} মাসে ফলো-আপ ও নতুন করে টিউনিং`,
      `${toBengaliDigits(clinic.warranty.years)} বছরের ওয়ারেন্টি — যন্ত্রাংশের ওপর ${toBengaliDigits(clinic.warranty.accessoryYears)} বছর`,
      "কীভাবে পরবেন, পরিষ্কার করবেন ও যত্ন নেবেন — হাতে-কলমে দেখিয়ে দেওয়া",
    ],
    [
      "The audiologist's time — choosing the device and talking it through",
      "Programming and verification against your own audiogram",
      "An ear mould taken from your ear",
      `Follow-up and re-tuning every ${clinic.warranty.followUpMonths} months`,
      `A ${clinic.warranty.years}-year warranty — ${clinic.warranty.accessoryYears} year on accessories`,
      "Being shown, in person, how to wear it, clean it and look after it",
    ]
  );

  const notIncluded = TL(
    "price.excluded",
    [
      `পূর্ণ কান পরীক্ষার ফি আলাদা — ${formatTaka(clinic.testPackage.fee)}, সময় লাগে ${toBengaliDigits(clinic.testPackage.minutes)} মিনিট।`,
      "কিস্তি বা EMI-এর ব্যবস্থা নেই। নগদ, কার্ড, বিকাশ ও বাংলা QR চলে।",
      `ভেঙে গেলে, পানিতে ভিজলে বা আগুনে পুড়লে ওয়ারেন্টি প্রযোজ্য নয় — সেক্ষেত্রে দামের ${toBengaliDigits(clinic.warranty.replacementDiscount)}% দিয়ে বদলে নেওয়া যায়।`,
      "একবার বিক্রি হয়ে যাওয়া মেশিন ফেরত নেওয়া হয় না। তাই কেনার আগে সেন্টারে বসে শুনে নিন।",
    ],
    [
      `The full hearing assessment is separate — ${formatTaka(clinic.testPackage.fee)}, about ${clinic.testPackage.minutes} minutes.`,
      "There is no instalment or EMI scheme. Cash, card, bKash and Bangla QR.",
      `The warranty does not cover ${clinic.warranty.excluded} — in that case a replacement is ${clinic.warranty.replacementDiscount}% of the price.`,
      "Once sold, a device is not taken back. So try it in the centre before you decide.",
    ]
  );

  /**
   * The four numbers under the name.
   *
   * A profile puts its counts here because they are the summary somebody
   * checks before reading anything. For a hearing aid the equivalent is not
   * followers — it is what it costs, how much loss it reaches, how finely it
   * processes sound, and how long it is covered.
   */
  const stats = [
    {
      label: T("stat.price", "দাম", "Price"),
      value: formatTaka(product.price),
      note: T("price.per_ear", "প্রতি কানে", "per ear"),
    },
    isCros
      ? {
          label: T("stat.for", "কার জন্য", "For"),
          value: T("device.singleSided", "এক কানে শোনা যায় না", "Single-sided loss"),
          note: T("device.routesSound", "শব্দ পাঠিয়ে দেয়", "routes sound across"),
        }
      : {
          label: T("stat.range", "কতটুকু কম শোনার জন্য", "Fitting range"),
          value: device.fittingRange
            ? bn
              ? `${toBengaliDigits(device.fittingRange.from)}–${toBengaliDigits(device.fittingRange.to)} dB`
              : `${device.fittingRange.from}–${device.fittingRange.to} dB`
            : tax.range(device),
          note: tax.range(device),
        },
    device.channels
      ? {
          label: T("stat.channels", "চ্যানেল", "Channels"),
          value: bn ? toBengaliDigits(device.channels) : String(device.channels),
          note: T("device.channelsNote", "শব্দ ভাগ করে সামলায়", "bands of processing"),
        }
      : null,
    {
      label: T("spec.warranty", "ওয়ারেন্টি", "Warranty"),
      value: fill(T("device.warrantyYears", "{years} বছর", "{years} years"), {
        years: num(clinic.warranty.years),
      }),
      note: T("device.ownService", "সেনসোর নিজস্ব সার্ভিস", "serviced in our own centre"),
    },
  ].filter(Boolean) as { label: string; value: string; note: string }[];

  /** The Intro box — the short answers, read at a glance. */
  const intro: { label: string; value: string }[] = [
    { label: T("spec.brand", "ব্র্যান্ড", "Brand"), value: product.brand || "ReSound" },
    { label: T("spec.series", "সিরিজ", "Series"), value: product.series },
    ...(product.version
      ? [{ label: T("spec.model", "মডেল", "Model"), value: product.version }]
      : []),
    { label: T("spec.range_label", "সারি", "Range"), value: tax.tierLabel[device.tier] },
    ...(device.formFactor
      ? [
          {
            label: T("spec.style", "গড়ন", "Style"),
            value: isCros ? crosShort : tax.form[device.formFactor].short,
          },
        ]
      : []),
    {
      label: T("spec.fitting_range", "কতটুকু কম শোনার জন্য", "Fitting range"),
      value: isCros
        ? T(
            "device.notApplicable",
            "প্রযোজ্য নয় — শব্দ পাঠিয়ে দেয়",
            "Not applicable — it transmits sound"
          )
        : device.fittingRange
        ? fill(T("device.fittingRange", "{from}–{to} ডেসিবেল", "{from}–{to} dB HL"), {
            from: num(device.fittingRange.from),
            to: num(device.fittingRange.to),
          })
        : tax.range(device),
    },
    ...(device.rechargeable !== undefined
      ? [
          {
            label: T("spec.power", "শক্তি", "Power"),
            value: device.rechargeable
              ? T(
                  "device.rechargeable",
                  "রিচার্জেবল, চার্জারসহ",
                  "Rechargeable, charger included"
                )
              : T("device.disposable", "ব্যাটারিতে চলে", "Disposable battery"),
          },
        ]
      : []),
    ...(product.warranty
      ? [{ label: T("spec.warranty", "ওয়ারেন্টি", "Warranty"), value: product.warranty }]
      : []),
    {
      label: T("spec.service", "সার্ভিস", "Service"),
      value: T(
        "spec.service.value",
        "আমাদের এখানে, সাধারণত ১ দিনে",
        "In our own centre, usually within a day"
      ),
    },
  ];

  const TABS = [
    { id: "about", label: T("tab.about", "পরিচিতি", "About") },
    { id: "fit", label: T("tab.fit", "কার জন্য", "Who it suits") },
    ...(gallery.length > 1 ? [{ id: "photos", label: T("tab.photos", "ছবি", "Photos") }] : []),
    ...(features.length ? [{ id: "features", label: T("tab.features", "ফিচার", "Features") }] : []),
    { id: "questions", label: T("tab.questions", "প্রশ্ন", "Questions") },
  ];

  /** The card every block in the feed is wrapped in. */
  const Post = ({
    eyebrow,
    title,
    children,
    tone = "plain",
    id,
  }: {
    eyebrow?: string;
    title?: string;
    children: React.ReactNode;
    tone?: "plain" | "warn" | "dark";
    id?: string;
  }) => (
    <section
      id={id}
      className={`scroll-mt-24 rounded-2xl border ${
        tone === "warn"
          ? "border-brand/25 bg-brand/[0.03]"
          : tone === "dark"
          ? "border-transparent bg-paper-deep text-ink-inverse"
          : "border-line bg-paper-surface"
      }`}
    >
      {(eyebrow || title) && (
        <header className="flex items-start gap-3 border-b border-line/70 px-5 py-4 sm:px-7">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
              tone === "dark" ? "bg-white/10 text-ink-inverse" : "bg-brand/10 text-brand"
            }`}
            aria-hidden="true"
          >
            S
          </span>
          <div className="min-w-0">
            {title && (
              <h2 className="font-ui text-lg font-semibold leading-tight">{title}</h2>
            )}
            {eyebrow && (
              <p
                className={`mt-0.5 font-ui text-xs ${
                  tone === "dark" ? "text-ink-inverse/55" : "text-ink-muted"
                }`}
              >
                {eyebrow}
              </p>
            )}
          </div>
        </header>
      )}
      <div className="px-5 py-6 sm:px-7">{children}</div>
    </section>
  );

  /** The short boxes down the left. */
  const Box = ({
    title,
    action,
    children,
    id,
  }: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    id?: string;
  }) => (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-line bg-paper-surface"
    >
      <header className="flex items-baseline justify-between gap-3 px-5 pt-5">
        <h2 className="font-ui text-base font-semibold text-ink">{title}</h2>
        {action}
      </header>
      <div className="px-5 pb-5 pt-3">{children}</div>
    </section>
  );

  const postedBy = bn ? clinic.nameBn : clinic.name;

  return (
    <article className="bg-paper-2 pb-16">
      <ProductJsonLd
        name={device.title}
        image={hero}
        description={
          prose.find((b) => b.kind === "overview")?.content ??
          product.description ??
          undefined
        }
        price={product.price}
        brand={product.brand || "ReSound"}
        url={url}
      />
      <FaqJsonLd items={faq} />
      <BreadcrumbJsonLd
        items={[
          { name: T("nav.home", "হোম", "Home"), url: `${clinic.url}${prefix || "/"}` },
          {
            name: T("nav.hearing_aids", "কানের মেশিন", "Hearing aids"),
            url: `${clinic.url}${prefix}/hearing-aids`,
          },
          { name: device.title, url },
        ]}
      />

      {/* ── Cover ──────────────────────────────────────────────────────
          The band a profile opens with. It carries the series rather than a
          stock photograph, because the series is the one thing every product
          on this platform shares and the thing a returning visitor recognises. */}
      <header className="bg-paper-surface">
        <div className="relative h-40 overflow-hidden bg-paper-deep sm:h-52 lg:h-60">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(120%_140%_at_12%_-10%,rgba(201,5,5,0.55)_0%,rgba(58,10,10,0.9)_45%,rgba(18,14,14,1)_100%)]"
          />
          {coverSrc ? (
            <>
              <Image
                src={coverSrc}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover opacity-70"
                aria-hidden="true"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
              />
              {coverIsVideo && (
                <a
                  href={coverHref}
                  target={coverHref?.startsWith("#") ? undefined : "_blank"}
                  rel={coverHref?.startsWith("#") ? undefined : "noopener"}
                  aria-label={T("device.watchVideo", "ভিডিওটি দেখুন", "Watch the video")}
                  className="group absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 pl-1 text-lg text-ink shadow-xl transition group-hover:scale-110">
                    ▶
                  </span>
                </a>
              )}
            </>
          ) : (
            /* Neither set: the product itself, enormous and faint, so the
               cover belongs to this device and not to the brand in general. */
            <div className="absolute -right-8 top-1/2 h-[130%] w-[45%] -translate-y-1/2 opacity-[0.13] sm:right-6">
              <Image
                src={hero}
                alt=""
                fill
                sizes="45vw"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
          )}
          <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-5 lg:px-8">
            <p className="font-ui text-xs uppercase tracking-[0.2em] text-white/60">
              {product.brand || "ReSound"} · {product.series}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex flex-col gap-5 pb-6 sm:flex-row sm:items-end sm:gap-7">
            {/* The face. */}
            <div className="-mt-16 shrink-0 sm:-mt-20">
              <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-paper-surface bg-paper-surface shadow-lg sm:h-40 sm:w-40">
                <Image
                  src={hero}
                  alt={device.title}
                  fill
                  sizes="160px"
                  priority
                  className="object-contain p-3"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-extrabold leading-[1.06] tracking-tightest text-ink">
                {device.title}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-sm text-ink-2">
                <span>
                  {isCros
                    ? crosShort
                    : device.formFactor
                    ? tax.form[device.formFactor].short
                    : product.series}
                </span>
                <span aria-hidden="true" className="hidden text-ink-muted sm:inline">
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5 text-brand">
                  <CheckIcon className="h-[15px] w-[15px]" />
                  {T(
                    "business.dealer_badge",
                    "ReSound অনুমোদিত ডিলার",
                    "Authorised ReSound dealer"
                  )}
                </span>
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <WhatsAppButton
                  lang={lang}
                  clinic={clinic}
                  d={d}
                  seed={fill(d.wa.product, { name: device.title })}
                />
                <Link
                  href={clinic.address.mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center rounded-xl border border-line-strong px-4 py-2.5 font-ui text-sm font-medium text-ink-2 transition hover:border-ink-muted hover:text-ink"
                >
                  {T("product.cta.directions", "সেন্টারে আসুন", "Get directions")}
                </Link>
              </div>
            </div>
          </div>

          {/* The counts. */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-paper-surface px-4 py-4">
                <dt className="font-ui text-micro uppercase tracking-[0.1em] text-ink-muted">
                  {s.label}
                </dt>
                <dd className="num mt-1.5 font-display text-xl font-bold leading-none tracking-tightest text-ink">
                  {s.value}
                </dd>
                <dd className="mt-1 font-ui text-xs text-ink-muted">{s.note}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <nav
          aria-label={T("nav.sections", "এই পাতার অংশ", "Sections")}
          className="sticky top-16 z-20 mt-6 border-y border-line bg-paper-surface/95 backdrop-blur"
        >
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 lg:px-8">
            <ul className="flex gap-1">
              {TABS.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="inline-block whitespace-nowrap border-b-2 border-transparent px-4 py-3.5 font-ui text-sm font-medium text-ink-2 transition hover:border-brand/40 hover:text-ink"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* ── The pictures ───────────────────────────────────────────── */}
      <ProductGallery d={d} shots={gallery} lang={lang} title={device.title} />

      {/* ── The two columns ────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 pt-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-6">
          {/* Left: the short, glanceable things. Sticky, because on a long
              page the summary is what people scroll back up to check. */}
          <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-32 lg:self-start">
            <Box title={T("product.intro.title", "সংক্ষেপে", "In short")} id="about">
              <dl className="divide-y divide-line/70">
                {intro.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] gap-3 py-2.5"
                  >
                    <dt className="font-ui text-xs leading-snug text-ink-muted">
                      {row.label}
                    </dt>
                    <dd className="break-words text-sm leading-snug text-ink">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Box>

            {features.length > 0 && (
              <Box id="features" title={T("product.features.title", "মেশিনটিতে যা যা আছে", "What is inside it")}>
                <ul className="flex flex-col gap-2.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-brand" />
                      <span className="text-sm leading-snug text-ink-2">{f.value}</span>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            <Box title={T("product.centre.title", "কোথায় পাবেন", "Where to find us")}>
              <p className="text-sm leading-relaxed text-ink-2">
                {/* The address itself, not a copy of it. These were two
                    site_copy keys whose fallback was the clinic record — which
                    meant a row nobody had filled in shadowed the address the
                    Company profile screen holds, and the page could print a
                    stale address while the footer printed the current one. */}
                {bn ? clinic.address.lineBn : clinic.address.line}
                <br />
                {bn
                  ? `${clinic.address.cityBn}-${clinic.address.postcode}`
                  : `${clinic.address.city}-${clinic.address.postcode}`}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {T("business.hours.open", "শনি – বৃহস্পতি: সকাল ১০টা – রাত ৮টা", "Saturday to Thursday, 10am to 8pm")}
                <br />
                {T("business.hours.closed", "শুক্রবার বন্ধ", "Closed on Friday")}
              </p>
              <Link
                href={clinic.address.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-block font-ui text-sm font-medium text-brand hover:underline"
              >
                {T("product.centre.map", "ম্যাপে দেখুন", "Open in Maps")} →
              </Link>
            </Box>
          </aside>

          {/* Right: the feed. */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* Who it suits — the first thing anyone wants settled. */}
            {!isCros && (
              <Post
                id="fit"
                title={T("loss.title", "কাদের জন্য এই মেশিন", "Who this one is for")}
                eyebrow={postedBy}
              >
                <p className="max-w-prose text-base leading-relaxed text-ink-2">
                  {T(
                    "loss.intro",
                    "শ্রবণক্ষয় মাপা হয় ডেসিবেলে, আর প্রতিটি মেশিন একটি নির্দিষ্ট সীমা পর্যন্ত কাজ করে। নিচের দাগটা দেখাচ্ছে এই মেশিনটি কোন পর্যন্ত ঢাকতে পারে।",
                    "Hearing loss is measured in decibels, and every device is built for a band of it. The scale below shows the part of that band this one covers."
                  )}
                </p>

                <div className="mt-6 rounded-xl border border-line bg-paper-2 p-5">
                  <LossScale device={device} lang={lang} d={d} />
                  {device.fittingRange && (
                    <p className="num mt-5 border-t border-line pt-4 text-sm text-ink-muted">
                      {fill(
                        T(
                          "device.fittingRangeLine",
                          "ফিটিং রেঞ্জ: {from}–{to} ডেসিবেল",
                          "Fitting range: {from}–{to} dB HL"
                        ),
                        {
                          from: num(device.fittingRange.from),
                          to: num(device.fittingRange.to),
                        }
                      )}
                      {" · "}
                      {T(
                        "spec.fitting_range.note",
                        "ReSound এটি গ্রাফে প্রকাশ করে, সংখ্যায় নয়।",
                        "ReSound publishes this as a graph, not a number."
                      )}
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex flex-col gap-3.5">
                  {covered.map((level) => (
                    <li key={level} className="flex gap-3.5">
                      <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-brand" />
                      <p className="text-base leading-relaxed text-ink-2">
                        <span className="font-ui font-semibold text-ink">
                          {tax.loss[level]}
                          {bn ? " — " : ": "}
                        </span>
                        {tax.feels[level]}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-xl bg-paper-deep p-5 text-ink-inverse">
                  <p className="font-ui text-xs uppercase tracking-[0.14em] text-ink-inverse/55">
                    {T("loss.honest.title", "সৎ কথা", "Being straight with you")}
                  </p>
                  <p className="mt-2.5 text-base leading-relaxed text-ink-inverse/90">
                    {T(
                      "loss.honest.body",
                      "কানের অবস্থা না দেখে কোনো মেশিন আপনার জন্য ঠিক, তা কেউ বলতে পারে না — আমরাও না।",
                      "Nobody can tell you a device is right for you without looking in your ears — and that includes us."
                    )}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-inverse/70">
                    {fill(
                      T(
                        "loss.test_note",
                        "পূর্ণ কান পরীক্ষা {minutes} মিনিট, ফি {fee}।",
                        "The full assessment takes {minutes} minutes and costs {fee}."
                      ),
                      {
                        minutes: num(clinic.testPackage.minutes),
                        fee: formatTaka(clinic.testPackage.fee),
                      }
                    )}
                  </p>
                </div>
              </Post>
            )}

            {/* Every block Senso wrote, in order. */}
            {prose.map((block, i) => {
              const embed = toEmbed(block.video_url, block.title || device.title);
              return (
                <Post
                  key={block.id ?? i}
                  id={block.id ? `block-${block.id}` : undefined}
                  title={block.title || undefined}
                  eyebrow={postedBy}
                >
                  {block.content && (
                    <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-ink-2">
                      {block.content}
                    </p>
                  )}

                  {block.image && block.image.length > 20 && (
                    <figure className={block.content ? "mt-6" : ""}>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-paper-2">
                        <Image
                          src={block.image}
                          alt={block.caption || block.title || product.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 720px"
                          className="object-contain p-5"
                        />
                      </div>
                      {block.caption && (
                        <figcaption className="mt-2.5 text-sm text-ink-muted">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {embed ? (
                    <div className={`${block.content || block.image ? "mt-6" : ""} overflow-hidden rounded-xl bg-paper-deep`}>
                      <iframe
                        src={embed.src}
                        title={embed.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="aspect-video w-full"
                      />
                    </div>
                  ) : block.video_url ? (
                    <a
                      href={block.video_url}
                      target="_blank"
                      rel="noopener"
                      className={`${block.content || block.image ? "mt-5" : ""} inline-flex font-ui text-sm font-medium text-brand hover:underline`}
                    >
                      {T("device.watchVideo", "ভিডিওটি দেখুন", "Watch the video")} →
                    </a>
                  ) : null}
                </Post>
              );
            })}

            {rawAbout && (
              <Post title={T("product.about.title", "এই মডেল সম্পর্কে", "About this model")} eyebrow={postedBy}>
                <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-ink-2">
                  {rawAbout}
                </p>
              </Post>
            )}

            {/* The limitations, set apart. A shortcoming printed in the same
                voice as the sales copy reads as sales copy. */}
            {limits.map((block, i) => (
              <Post
                key={i}
                tone="warn"
                title={block.title || T("product.not_for.title", "কাদের জন্য নয়", "Where it falls short")}
                eyebrow={T("product.not_for.eyebrow", "খোলাখুলি বলছি", "Worth knowing")}
              >
                <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-ink-2">
                  {block.content}
                </p>
              </Post>
            ))}

            {/* What the price covers. */}
            <Post title={T("price.included.title", "দামের সাথে যা যা আছে", "What the price covers")} eyebrow={postedBy}>
              <ul className="flex flex-col gap-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon className="mt-1 h-[18px] w-[18px] shrink-0 text-brand" />
                    <span className="text-base leading-relaxed text-ink-2">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-line bg-paper-2 p-5">
                <h3 className="font-ui text-base font-semibold text-ink">
                  {T("price.excluded.title", "যা এর মধ্যে নেই", "What it does not cover")}
                </h3>
                <ul className="mt-3.5 flex flex-col gap-3">
                  {notIncluded.map((item) => (
                    <li
                      key={item}
                      className="border-l-2 border-line-strong pl-4 text-base leading-relaxed text-ink-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Post>

            {/* The questions. */}
            <Post
              id="questions"
              title={T("product.faq.title", "যা সবচেয়ে বেশি জিজ্ঞেস করা হয়", "Questions people ask")}
              eyebrow={T("product.faq.note", "হোয়াটসঅ্যাপে লিখলে আমরা লিখেই উত্তর দিই।", "Write to us on WhatsApp — we answer in writing.")}
            >
              <div className="divide-y divide-line">
                {faq.map((item, i) => (
                  <details key={i} className="group py-4 first:pt-0">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-ui text-base font-semibold text-ink">
                      {item.question}
                      <span
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-brand transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-prose text-base leading-relaxed text-ink-2">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Post>

            {/* Nearby devices. */}
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-surface">
              <RelatedDevices current={device} all={others} lang={lang} dict={d} />
            </div>

            {/* The close. */}
            <Post tone="dark">
              <h2 className="max-w-[22ch] font-display text-3xl font-extrabold leading-[1.12] tracking-tightest">
                {T(
                  "product.cta.title",
                  "এই মেশিনটা কানে দিয়ে শুনে দেখতে চান?",
                  "Want to hear this one for yourself?"
                )}
              </h2>
              <p className="mt-3.5 max-w-prose text-base leading-relaxed text-ink-inverse/75">
                {T(
                  "product.cta.body",
                  "সেন্টারে এসে অডিওগ্রাম অনুযায়ী সেট করে শুনতে পারবেন — কেনার আগেই।",
                  "Come in and hear it set to your own audiogram, before you buy."
                )}
              </p>
              <div className="mt-6 grid max-w-lg gap-2.5 sm:grid-cols-2">
                <WhatsAppButton
                  lang={lang}
                  clinic={clinic}
                  d={d}
                  seed={fill(d.wa.product, { name: device.title })}
                />
              </div>
            </Post>
          </div>
        </div>
      </div>
    </article>
  );
}
