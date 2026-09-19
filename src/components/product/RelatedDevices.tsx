"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatTaka } from "@/lib/site";
import { lossRangeLabel, type Device } from "@/lib/catalogue";
import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { taxonomy } from "@/routes/taxonomy";

/**
 * Other devices worth looking at, as a carousel.
 *
 * Chosen by proximity rather than by "customers also viewed": somebody on a
 * product page is almost never choosing between this device and a random
 * other one — they are choosing between this and the next one up or down,
 * either in the same family or at a nearby price. That ordering is also what
 * turns a hundred pages into a connected set rather than a hundred dead ends.
 *
 * A four-column grid put four cards into a column that also holds a sidebar,
 * which left each card about as wide as its own price. A track that scrolls
 * gives every card room, shows more than four, and needs no layout breakpoint
 * to work on a phone — a horizontal scroller with snap points is the gesture
 * people already use there.
 *
 * The automatic movement is deliberately timid. It stops the moment anyone
 * touches, hovers or scrolls it, it never restarts after that, it does not
 * run while the section is off screen, and it does not run at all for anyone
 * who has asked their system to reduce motion. Its only job is to show that
 * the row moves; after that the reader is in charge.
 */
export default function RelatedDevices({
  current,
  all,
  lang,
  // Named `dict` rather than `d` because every card in the track is already a
  // `d`: this component maps over devices called d.
  dict,
}: {
  current: Device;
  all: Device[];
  lang: Lang;
  dict: Dict;
}) {
  const t = taxonomy(dict);
  const pool = all.filter((d) => d.slug !== current.slug);
  const distance = (d: Device) => Math.abs(d.priceValue - current.priceValue);

  const sameSeries = pool
    .filter((d) => d.series === current.series)
    .sort((a, b) => distance(a) - distance(b));

  const nearby = pool
    .filter((d) => d.series !== current.series)
    .sort((a, b) => distance(a) - distance(b));

  const picks = [...sameSeries, ...nearby].slice(0, 10);

  const bn = lang === "bn";
  const prefix = lang === "en" ? "/en" : "";

  const trackRef = useRef<HTMLDivElement>(null);
  const [taken, setTaken] = useState(false); // the reader has taken over
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);

  /**
   * The track carries its own horizontal padding.
   *
   * Scrolled content passing underneath a parent's padding reads as a
   * rendering fault — the first card clipped mid-word with a strip of white
   * beside it. Padding on the scroller itself, plus a matching scroll-padding
   * so snapping lands flush, keeps every card starting at the same edge.
   */
  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const by = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: by * dir, behavior: "smooth" });
  }, []);

  // Where we are, for the arrows and the dots.
  const readPosition = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);

    const card = el.querySelector<HTMLElement>("[data-card]");
    const by = card ? card.offsetWidth + 16 : 1;
    setActive(Math.round(el.scrollLeft / by));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    readPosition();
    el.addEventListener("scroll", readPosition, { passive: true });
    return () => el.removeEventListener("scroll", readPosition);
  }, [readPosition]);

  useEffect(() => {
    if (taken || picks.length < 3) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = trackRef.current;
    if (!el) return;

    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { threshold: 0.35 }
    );
    io.observe(el);

    const timer = window.setInterval(() => {
      if (!visible) return;
      const max = el.scrollWidth - el.clientWidth;
      // At the end, go back to the beginning rather than stopping dead.
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        step(1);
      }
    }, 4000);

    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [taken, picks.length, step]);

  if (!picks.length) return null;

  const stop = () => setTaken(true);

  return (
    <section className="scroll-mt-24 py-6" aria-roledescription="carousel">
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 sm:px-7">
        <div>
          <h2 className="font-ui text-lg font-semibold leading-tight text-ink">
            {dict.related.heading}
          </h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-muted">
            {dict.related.lede}
          </p>
        </div>

        {/* Arrows are a desktop affordance. On a phone the gesture is the
            control, and a pair of buttons would only take room from the cards. */}
        <div className="hidden shrink-0 gap-1.5 sm:flex">
          <button
            type="button"
            aria-label={dict.pager.previous}
            disabled={atStart}
            onClick={() => {
              stop();
              step(-1);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-ink-muted hover:text-ink disabled:opacity-30 disabled:hover:border-line-strong"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={dict.pager.next}
            disabled={atEnd}
            onClick={() => {
              stop();
              step(1);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-ink-muted hover:text-ink disabled:opacity-30 disabled:hover:border-line-strong"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onPointerDown={stop}
        onWheel={stop}
        onMouseEnter={stop}
        onTouchStart={stop}
        className="senso-track mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-1 sm:scroll-pl-7 sm:px-7"
      >
        {picks.map((d) => {
          const image =
            d.image && d.image.length > 50
              ? d.image
              : "/assets/Images/Common/senso_404_not_found.png";
          const diff = d.priceValue - current.priceValue;

          return (
            <Link
              key={d.slug}
              data-card
              href={`${prefix}/hearing-aids/${d.slug}`}
              className="group flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-paper-surface transition hover:border-ink-2 hover:shadow-sm sm:w-[232px]"
            >
              <div className="relative aspect-[4/3] w-full bg-paper-2">
                <Image
                  src={image}
                  alt={d.name}
                  fill
                  sizes="232px"
                  className="object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 p-4">
                <p className="font-ui text-micro uppercase tracking-[0.1em] text-ink-muted">
                  {d.series}
                </p>
                <p className="font-ui text-sm font-semibold leading-snug text-ink">
                  {d.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-ink-2">
                  {t.range(d)}
                  {dict.catalogue.lossSuffix}
                </p>
                <p className="num mt-auto pt-3 font-ui text-lg font-bold text-ink">
                  {formatTaka(d.priceValue)}
                </p>
                {diff !== 0 && (
                  <p className="num text-xs text-ink-muted">
                    {diff > 0 ? "+" : "−"} {formatTaka(Math.abs(diff))}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dots, so the row admits how long it is. Small, and not clickable —
          a five-pixel target is a promise nobody can keep on a phone. */}
      {picks.length > 2 && (
        <div className="mt-4 flex justify-center gap-1.5 px-5 sm:px-7" aria-hidden="true">
          {picks.map((d, i) => (
            <span
              key={d.slug}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === active ? "w-5 bg-brand" : "w-1 bg-line-strong"
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        .senso-track { scrollbar-width: none; -ms-overflow-style: none; }
        .senso-track::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
