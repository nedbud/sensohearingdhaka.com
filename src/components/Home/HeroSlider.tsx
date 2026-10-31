"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * ## Two cuts of the same poster
 *
 * The clinic's artwork is built the way a billboard is: the subject on the
 * right, the left deliberately empty for words. That is a landscape idea, and
 * a phone is not landscape. Cropping the wide plate to a tall viewport keeps
 * a narrow slice of the right-hand side and loses the subject out of the top
 * and bottom of it — an early pass did exactly that and produced a blurred
 * wall, an empty chevron and a patch of bokeh.
 *
 * Laying the picture above the text instead fixed the cropping and lost the
 * feeling: a band of photograph with a paragraph under it is a web page from
 * 2014. So each slide now has two files. The landscape one carries the site's
 * paper down its left-hand side; the portrait one carries it across the
 * bottom, with the subject above. Both are full-bleed, both have the words
 * over the picture rather than beside it, and neither crops a face.
 *
 * A `<picture>` with one media query picks between them, so the browser
 * fetches exactly one file per visitor and decides which before it fetches
 * anything. Which file is portrait is a field on the slide, not a filename
 * this component invents: deriving `x-p.webp` from `x.webp` held for the
 * seven files shipped here and 404'd for the fallback slide and for anything
 * the panel uploads. Without a portrait cut the same file serves both, and a
 * phone gets a less considered crop rather than a broken picture.
 *
 * ## One palette, carried by the artwork
 *
 * An earlier version poured each poster's own background behind the words and
 * set the type light or dark to suit. Four of the seven posters are a
 * saturated red, and each is a *different* one, so advancing the carousel
 * swung the whole screen between four palettes with the headline flipping
 * colour each time. The config one directory up says it plainly: a loud red
 * used everywhere reads as alarm, which is the wrong feeling for a clinic.
 *
 * So the colour decision lives in the pictures. Every file fades to the
 * site's own paper where the words go and has its reds pulled toward the
 * site's own brand red. The band never changes colour; only the photograph
 * does, and the type has exactly one treatment.
 *
 * ## The one thing that moves
 *
 * The picture drifts more slowly than the page scrolls. That is the entire
 * motion budget, spent on depth. `prefers-reduced-motion` stops the drift and
 * the auto-advance together.
 *
 * ## Choosing a slide
 *
 * Seven dots, and nothing else. A segmented progress rail was here and it
 * looked like a download: seven hairlines across the bottom of a clinic's
 * front page, each one a different length. The dots sit down the right-hand
 * margin on a wide screen and under the words on a narrow one, the live one
 * filled. Arrow keys and a swipe do the rest, which is what people actually
 * use.
 */
const INTERVAL = 7000;

/**
 * A slide's own button, drawn as the band's primary action.
 *
 * Deliberately the same pill as `WhatsAppButton` — same height, same radius,
 * same brand fill — because the two occupy one slot and a campaign swapping
 * one for the other must not change the shape of the band. The icon is the
 * only difference, and it is absent here: an arrow on a button whose
 * destination is already named is decoration.
 *
 * A slide that is not on show keeps its button in the layout, since the
 * copy blocks are stacked in one grid cell and removing it would collapse
 * the row. It is taken out of the tab order instead, which is what makes a
 * carousel navigable by keyboard rather than a list of seven hidden links.
 */
function SlideButton({
  href,
  on,
  children,
}: {
  href: string;
  on: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      tabIndex={on ? undefined : -1}
      data-analytics="hero-slide-button"
      className="inline-flex min-h-[52px] items-center justify-center rounded-full border-[1.5px] border-brand bg-brand px-5 py-1.5 font-ui text-lg leading-tight text-white transition-colors hover:border-brand-deep hover:bg-brand-deep focus-visible:outline focus-visible:outline-2"
    >
      {children}
    </Link>
  );
}

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
  const [paused, setPaused] = useState(false);
  const band = useRef<HTMLElement>(null);
  const many = slides.length > 1;

  /**
   * Which slides are allowed to fetch their photograph.
   *
   * `loading="lazy"` was already on every slide but the first and it did
   * nothing. All seven sit at `absolute inset-0`, so all seven are inside
   * the viewport and merely transparent — the browser defers what is off
   * screen, not what is invisible. A phone downloaded seven full-bleed
   * plates before it had painted one, which is most of what a Speed Index
   * of 10.6s is made of.
   *
   * So the markup decides instead of the loading attribute. Slide one
   * renders with the page; its neighbour is warmed 1.2s later, well inside
   * the seven seconds before the band moves; after that each slide warms
   * the one behind it as soon as it arrives. Nothing is ever shown
   * unloaded, and somebody who reads the first slide and taps WhatsApp
   * fetches one picture instead of seven.
   */
  const [warm, setWarm] = useState<readonly number[]>([0]);
  const warmUp = useCallback(
    (want: number) =>
      setWarm((had) => {
        const i = ((want % slides.length) + slides.length) % slides.length;
        return had.includes(i) ? had : [...had, i];
      }),
    [slides.length]
  );

  useEffect(() => {
    warmUp(index);
  }, [index, warmUp]);

  /**
   * The slide behind this one.
   *
   * Delayed on the first slide only, so the hero's own photograph is not
   * competing with the next one for the first second of the page. Every
   * later move warms its neighbour at once — by then the page is loaded and
   * the person is reading, and a slide that is not ready when the band
   * turns shows paper.
   */
  useEffect(() => {
    if (!many) return;
    const id = window.setTimeout(() => warmUp(index + 1), index === 0 ? 1200 : 0);
    return () => window.clearTimeout(id);
  }, [index, many, warmUp]);

  const prefix = lang === "en" ? "/en" : "";
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

  const tick = useRef(() => {});
  tick.current = () => setIndex((i) => (i + 1) % slides.length);

  const still = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!many || stopped || paused || still()) return;
    const id = window.setInterval(() => {
      if (!document.hidden) tick.current();
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [many, stopped, paused]);

  /**
   * The drift, written straight onto the element as a custom property.
   *
   * Through a state setter this would re-render every slide on every scroll
   * event. One rAF-throttled write to one node does the same job without
   * touching React, and it stops once the band leaves the screen.
   */
  useEffect(() => {
    const node = band.current;
    if (!node || still()) return;

    let frame = 0;
    let onScreen = true;

    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    watcher.observe(node);

    const paint = () => {
      frame = 0;
      if (!onScreen) return;
      const seen = Math.min(Math.max(-node.getBoundingClientRect().top, 0), node.offsetHeight);
      node.style.setProperty("--drift", `${(seen * 0.14).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      watcher.disconnect();
    };
  }, []);

  /**
   * The swipe, with the slide following the thumb.
   *
   * A threshold swipe — wait for 48px, then cut to the next slide — is how a
   * carousel is usually driven on a web page, and it is why web carousels
   * feel like web carousels. Nothing happens, nothing happens, and then the
   * screen changes by itself. An app moves while the thumb moves, and tells
   * you with resistance that you are at the end of the drag rather than at
   * the start of a new slide.
   *
   * So the offset is written live onto the band as `--swipe`, the words take
   * all of it and the picture takes a third — the same depth the scroll drift
   * uses, now under the thumb. Released past a third of the screen, or thrown
   * faster than 0.45px/ms, it advances; otherwise it springs back.
   *
   * `touch-action: pan-y` on the band is what lets this coexist with the page
   * scrolling: the browser keeps vertical, we take horizontal, and neither
   * has to call preventDefault inside a passive listener.
   */
  const drag = useRef({ x: 0, y: 0, at: 0, live: false });
  const [dragging, setDragging] = useState(false);

  const setSwipe = (px: number) => {
    band.current?.style.setProperty("--swipe", `${px}px`);
  };

  const dots = many && (
    <div
      className="pointer-events-none absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3.5 lg:flex xl:right-8"
      role="group"
      aria-label={d.pager.next}
    >
      {slides.map((slide, i) => (
        <button
          key={`dot-${slide.image}-${i}`}
          type="button"
          onClick={() => go(i)}
          aria-label={slideText(slide.title, lang, d.hero.title)}
          aria-current={i === index}
          className="pointer-events-auto group grid h-7 w-7 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        >
          <span
            className={`block rounded-full transition-all duration-300 ${
              i === index
                ? "h-2.5 w-2.5 bg-brand ring-[5px] ring-paper/75"
                : "h-2 w-2 bg-ink/35 ring-[3px] ring-paper/60 group-hover:bg-ink/60"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <section
      ref={band}
      aria-roledescription="carousel"
      aria-label={d.hero.eyebrow}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        const t0 = e.touches[0];
        if (!t0 || !many) return;
        drag.current = { x: t0.clientX, y: t0.clientY, at: Date.now(), live: false };
      }}
      onTouchMove={(e) => {
        const t0 = e.touches[0];
        if (!t0 || !many) return;
        const dx = t0.clientX - drag.current.x;
        const dy = t0.clientY - drag.current.y;

        // Which way this gesture is going is decided once, on the first few
        // pixels. Without that a slow diagonal scroll drags the carousel.
        if (!drag.current.live) {
          if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
          drag.current.live = true;
          setDragging(true);
          setPaused(true);
        }
        setSwipe(dx);
      }}
      onTouchEnd={(e) => {
        if (!drag.current.live) return;
        const dx = (e.changedTouches[0]?.clientX ?? drag.current.x) - drag.current.x;
        const speed = Math.abs(dx) / Math.max(Date.now() - drag.current.at, 1);
        const far = Math.abs(dx) > (band.current?.offsetWidth ?? 360) / 3;

        drag.current.live = false;
        setDragging(false);
        setSwipe(0);
        setPaused(false);
        if (far || speed > 0.45) go(index + (dx < 0 ? 1 : -1));
      }}
      className="relative isolate flex h-[100svh] min-h-[34rem] touch-pan-y flex-col overflow-hidden bg-paper [--drift:0px] [--swipe:0px] lg:h-[clamp(34rem,56vw,44rem)]"
    >
      {slides.map((slide, i) => {
        return (
          <div
            key={`art-${slide.image}-${i}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 bg-paper transition-opacity duration-700 ease-out motion-reduce:transition-none ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Taller than the band so the drift never exposes an edge. */}
            <div
              className={`absolute inset-x-0 -top-[4%] h-[108%] will-change-transform motion-reduce:translate-y-0 ${
                dragging ? "" : "transition-transform duration-500 ease-out"
              }`}
              style={{
                transform:
                  "translate3d(calc(var(--swipe) * 0.3), calc(var(--drift) * -1), 0)",
              }}
            >
              {/*
                A <picture>, not two <Image>s.

                Two next/image elements hidden at opposite breakpoints is the
                documented way to art-direct, and it has two faults that both
                showed up here. The browser cannot see a CSS class when it is
                choosing what to fetch, so every visitor downloaded the
                portrait *and* the landscape plate. And next/image routes
                through /_next/image, which transforms on first request — in
                development that is slow enough that a plain reload painted an
                empty band and a half-decoded picture, while a hard reload
                looked right because the transform was already warm.

                A <picture> with a media query fixes both: the browser picks
                one file before it fetches anything, and these plates are
                already webp at the size they are used, so there is nothing
                for an optimiser to do. `fetchPriority` on the first slide is
                what next/image's `priority` was doing.
              */}
              {warm.includes(i) && (
                <picture>
                  <source media="(min-width: 1024px)" srcSet={slide.image} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.portrait ?? slide.image}
                    alt={slideText(slide.alt, lang, d.hero.deviceAlt)}
                    width={1080}
                    height={2160}
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : "low"}
                    className="absolute inset-0 h-full w-full object-cover object-top lg:object-[88%_50%]"
                  />
                </picture>
              )}
            </div>

            {/* The pictures already fade to paper where the words go. These
                only guarantee the seam at a size the artwork was not cut for,
                and are invisible where it was. */}
            {/*
              The phone's wash.

              Earlier the picture dissolved into the page's cream where the
              words go, which kept one palette but ate the photograph: by the
              time the headline had somewhere to sit, a third of the picture
              was gone. A wash is the other answer, and the one an app uses —
              the photograph stays whole, edge to edge, and the words sit on a
              darkened part of it rather than on a patch of paper.

              Warm near-black rather than pure black, so it belongs to the
              same family as the ink everywhere else, and weighted to the
              bottom: the top fifth is untouched photograph.
            */}
            <div
              aria-hidden="true"
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  "linear-gradient(to top, rgba(20,16,13,0.92) 0%, rgba(20,16,13,0.8) 24%, rgba(20,16,13,0.46) 44%, rgba(20,16,13,0.12) 62%, rgba(20,16,13,0) 76%)",
              }}
            />

            <div className="absolute inset-0 hidden bg-gradient-to-r from-paper via-paper/70 to-transparent lg:block" />
          </div>
        );
      })}

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-5 pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+4rem))] sm:px-6 lg:justify-center lg:px-8 lg:pb-12">
        {/*
          The quiet is tied to the words, not to a height.

          A gradient across the whole band fades the picture wherever the
          designer guessed the words would be, and the words are not there: a
          short phone pushes them up over a face, a tall one leaves a pale
          strip under them. Anchored to the copy block instead, the picture is
          at full strength everywhere above the words and quiet exactly where
          they are, at any screen height — which is what an app does with a
          sheet, without drawing the sheet.
        */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -top-20 left-[-1.25rem] right-[-1.25rem] sm:left-[-1.5rem] sm:right-[-1.5rem] lg:hidden"
            style={{
              background:
                "linear-gradient(to top, rgba(20,16,13,0.74) 0, rgba(20,16,13,0.74) calc(100% - 5rem), rgba(20,16,13,0) 100%)",
            }}
          />

          <div className="relative grid">
          {slides.map((slide, i) => {
            const on = i === index;
            const title = slideText(slide.title, lang, d.hero.title);
            const lede = fill(slideText(slide.lede, lang, d.hero.lede), { minutes });
            const caption = slideText(slide.caption, lang, d.hero.deviceCaption);
            const captionLink = slideText(slide.captionLink, lang, d.hero.everyModel);
            /* No dictionary fallback: an empty label is the slide saying it
               wants the standing button, not a line to fill in. */
            const button = slide.button ? slideText(slide.button.label, lang, "") : "";

            return (
              <div
                key={`copy-${slide.image}-${i}`}
                aria-hidden={!on}
                className={`col-start-1 row-start-1 max-w-xl will-change-transform motion-reduce:transition-none lg:max-w-[34rem] ${
                  dragging ? "" : "transition-[opacity,transform] duration-700 ease-out"
                } ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}
                style={{
                  transform: `translate3d(var(--swipe), ${on ? "0" : "0.75rem"}, 0)`,
                }}
              >
                <p className="font-ui text-sm text-white lg:text-brand">
                  {slideText(slide.eyebrow, lang, d.hero.eyebrow)}
                </p>

                {/* Only the slide on show is a heading. Seven <h1>s, six of
                    them invisible, is a page with seven titles as far as a
                    crawler and a screen reader are concerned. */}
                {on ? (
                  <h1 className="mt-2.5 max-w-[14ch] font-display text-5xl font-extrabold leading-[1.06] tracking-tightest text-white sm:text-hero lg:text-ink">
                    {title}
                  </h1>
                ) : (
                  <p className="mt-2.5 max-w-[14ch] font-display text-5xl font-extrabold leading-[1.06] tracking-tightest text-white sm:text-hero lg:text-ink">
                    {title}
                  </p>
                )}

                <p className="mt-3.5 line-clamp-2 max-w-prose leading-relaxed text-white/90 sm:line-clamp-none sm:text-lg lg:text-ink-2">
                  {lede}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 lg:mt-7">
                  {/*
                    One button, and which one is the slide's decision.

                    A slide that names its own button gets it; every slide
                    the code ships with names none, so the band carries the
                    standing WhatsApp one — the channel this clinic's
                    enquiries actually arrive through. Showing both would
                    leave the hero with two primary actions, which is the
                    same as having none, so this is an either/or rather than
                    an addition.
                  */}
                  {button ? (
                    <SlideButton href={`${prefix}${slide.button?.href ?? ""}`} on={on}>
                      {button}
                    </SlideButton>
                  ) : (
                    <WhatsAppButton lang={lang} clinic={clinic} d={d} />
                  )}

                  <p className="text-sm text-white/85 lg:text-ink-2">
                    {caption}
                    <Link
                      href={`${prefix}${slide.href}`}
                      tabIndex={on ? undefined : -1}
                      className="underline underline-offset-4 hover:text-white lg:hover:text-ink"
                    >
                      {captionLink}
                    </Link>
                  </p>
                </div>

                <p className="mt-3 hidden max-w-md text-sm text-white/70 sm:block lg:mt-4 lg:text-ink-muted">
                  {d.hero.phoneShort}
                </p>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {dots}
    </section>
  );
}
