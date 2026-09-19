"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toBengaliDigits } from "@/lib/site";
import { fill, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import type { Clinic } from "@/routes/clinic";
import { slideText, type Slide } from "@/routes/slides";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

/**
 * The top of the home page.
 *
 * One slide and it is a still picture — no dots, no arrows, no timer, and no
 * client work at all beyond what the page already does. The controls appear
 * because there is something to control, not because the component is a
 * carousel.
 *
 * The words move with the picture. That is the whole point of the change: a
 * slider whose headline stays put while the photograph changes underneath is
 * a screensaver, and the headline is the only part most visitors read.
 *
 * Every slide is rendered, always, and the inactive ones are hidden with
 * `aria-hidden` and pointer-events rather than removed. Two reasons: the
 * height stays fixed, so the page below does not jump each time a slide with
 * a longer headline comes round; and the first slide's picture is a real
 * `priority` image that Google measures for LCP whether or not JavaScript
 * ever runs.
 *
 * It advances on its own every seven seconds, and stops for good the moment
 * somebody touches a control — a person who has chosen a slide should not
 * have it taken away from them two seconds later. It also stops while the tab
 * is in the background, and never starts if the reader has asked for reduced
 * motion.
 */
const INTERVAL = 7000;

export default function HeroSlider({
  lang,
  clinic,
  d,
  slides,
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
  slides: Slide[];
}) {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const many = slides.length > 1;

  const prefix = lang === "en" ? "/en" : "";
  // Bangla numerals in Bangla prose. The figure comes from the clinic record
  // as a plain number, and the live page read "শুরুটা হোক একটা পরীক্ষা দিয়ে।
  // 35 মিনিট" — Western digits in a Bangla sentence, directly above a number
  // band setting ৩৫ correctly. Same mistake as the trust band, one file over.
  const minutes =
    lang === "bn"
      ? toBengaliDigits(clinic.testPackage.minutes)
      : String(clinic.testPackage.minutes);

  const go = useCallback(
    (to: number) => {
      setStopped(true);
      setIndex((to + slides.length) % slides.length);
    },
    [slides.length]
  );

  // The timer lives in a ref so that re-rendering on each advance does not
  // restart the interval and make the last slide linger.
  const tick = useRef(() => {});
  tick.current = () => setIndex((i) => (i + 1) % slides.length);

  useEffect(() => {
    if (!many || stopped) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (!document.hidden) tick.current();
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [many, stopped]);

  return (
    <div className="relative isolate overflow-hidden border-b border-line bg-paper-2">
        {/* A single soft light behind the device, so it sits in the page
            rather than floating on a flat panel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[22%] h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/4 lg:left-auto lg:right-[-6%] lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2"
          style={{
            background:
              "radial-gradient(circle, rgba(255,253,250,0.95) 0%, rgba(255,253,250,0.55) 45%, rgba(255,253,250,0) 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 lg:px-8 lg:pb-16 lg:pt-14">
          <div className="grid">
            {slides.map((slide, i) => {
              const on = i === index;
              const title = slideText(slide.title, lang, d.hero.title);
              const lede = fill(slideText(slide.lede, lang, d.hero.lede), { minutes });
              const caption = slideText(slide.caption, lang, d.hero.deviceCaption);
              const captionLink = slideText(slide.captionLink, lang, d.hero.everyModel);

              return (
                <div
                  key={`${slide.image}-${i}`}
                  aria-hidden={!on}
                  className={`col-start-1 row-start-1 grid items-center gap-6 transition-opacity duration-500 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12 ${
                    on ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="order-2 lg:order-1">
                    <p className="font-ui text-sm text-brand">
                      {slideText(slide.eyebrow, lang, d.hero.eyebrow)}
                    </p>

                    {/* Only the slide on show is a heading. Seven <h1>s, six of
                        them invisible, is a page with seven titles as far as a
                        crawler and a screen reader are concerned. */}
                    {on ? (
                      <h1 className="mt-2 max-w-[13ch] font-display text-hero font-extrabold leading-[1.05] tracking-tightest text-ink">
                        {title}
                      </h1>
                    ) : (
                      <p className="mt-2 max-w-[13ch] font-display text-hero font-extrabold leading-[1.05] tracking-tightest text-ink">
                        {title}
                      </p>
                    )}

                    <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-2">
                      {lede}
                    </p>

                    <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:max-w-lg">
                      <WhatsAppButton lang={lang} clinic={clinic} d={d} />
                    </div>

                    <p className="mt-3 text-sm text-ink-muted">{d.hero.phoneShort}</p>
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="relative mx-auto aspect-[4/3] w-full max-w-[26rem] lg:max-w-none">
                      <Image
                        src={slide.image}
                        alt={slideText(slide.alt, lang, d.hero.deviceAlt)}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1024px) 90vw, 520px"
                        className="object-contain"
                      />
                    </div>

                    <p className="mt-1 text-center text-sm text-ink-muted lg:text-left">
                      {caption}
                      <Link
                        href={`${prefix}${slide.href}`}
                        tabIndex={on ? undefined : -1}
                        className="underline underline-offset-4 hover:text-ink"
                      >
                        {captionLink}
                      </Link>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {many && (
            <div className="relative mt-6 flex items-center justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label={d.pager.previous}
                className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-paper-surface text-ink-2 transition hover:border-ink-2 hover:text-ink"
              >
                ‹
              </button>

              <div className="flex items-center gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={`dot-${slide.image}-${i}`}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={slideText(slide.title, lang, d.hero.title)}
                    aria-current={i === index}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index
                        ? "w-7 bg-brand"
                        : "w-2.5 bg-line-strong hover:bg-ink-muted"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label={d.pager.next}
                className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-paper-surface text-ink-2 transition hover:border-ink-2 hover:text-ink"
              >
                ›
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
