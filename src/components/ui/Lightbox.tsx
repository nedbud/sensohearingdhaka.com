"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

export type LightboxItem = {
  src: string;
  alt: string;
  caption?: string;
};

type Props = {
  items: LightboxItem[];
  /** The picture on show, or null when the viewer is shut. */
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
  /** Already in the reader's language, and already counted in their numerals. */
  labels: { close: string; previous: string; next: string; counter: string };
};

/**
 * A full-screen photo viewer.
 *
 * Written rather than installed. Every lightbox package on npm brings a
 * bundle between 15 and 60 kB for what is, honestly, an overlay with two
 * arrows — and this site is read on Bangladeshi mobile data, where that is
 * a real fraction of the page. What a lightbox actually has to get right is
 * not the animation, it is the things a package is bought for and then
 * still has to be checked: the page behind must not scroll, Escape must
 * close it, a thumb must be able to swipe, and the keyboard must be able to
 * reach and leave it. Those are the four things below.
 *
 * Deliberately NOT here: zoom, pinch, captions overlaid on the picture,
 * thumbnails along the bottom, slideshow. These are four photographs of a
 * doorway. Anything more is decoration on a wayfinding aid.
 */
export default function Lightbox({ items, index, onIndex, onClose, labels }: Props) {
  const open = index !== null && index >= 0 && index < items.length;
  const closeRef = useRef<HTMLButtonElement>(null);

  /**
   * Where focus was before the viewer opened.
   *
   * Without this, closing drops the caret at the top of the document and a
   * keyboard reader has to travel the whole page again to reach the next
   * photograph. Restoring it is two lines and the difference between usable
   * and technically-accessible.
   */
  const returnTo = useRef<Element | null>(null);

  const go = useCallback(
    (by: number) => {
      if (index === null) return;
      onIndex((index + by + items.length) % items.length);
    },
    [index, items.length, onIndex]
  );

  useEffect(() => {
    if (!open) return;

    returnTo.current = document.activeElement;
    closeRef.current?.focus();

    // The page behind must not scroll under the overlay — on a phone that
    // reads as the picture drifting for no reason.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, go, onClose]);

  // Swipe. One number, no library: where the thumb went down, and whether it
  // travelled far enough sideways to have meant it.
  const startX = useRef<number | null>(null);

  if (!open || index === null) return null;

  const item = items[index];
  const many = items.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || item.alt}
      className="fixed inset-0 z-[100] flex flex-col bg-paper-deep/[0.97] backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => { startX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        const from = startX.current;
        startX.current = null;
        if (from === null || !many) return;
        const delta = (e.changedTouches[0]?.clientX ?? from) - from;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
      }}
    >
      <header className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="font-ui text-sm tabular-nums text-ink-inverse/70">
          {labels.counter}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="grid h-11 w-11 place-items-center rounded-full text-ink-inverse/80 transition-colors hover:bg-ink-inverse/10 hover:text-ink-inverse"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {/* Stops a click on the picture itself from closing the viewer — which
          is the click a reader makes when they want to look closer. */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full w-full">
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.previous}
              className="absolute left-1 grid h-12 w-12 place-items-center rounded-full bg-paper-deep/75 text-ink-inverse ring-1 ring-ink-inverse/20 transition-colors hover:bg-paper-deep hover:ring-ink-inverse/40 sm:left-3"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="absolute right-1 grid h-12 w-12 place-items-center rounded-full bg-paper-deep/75 text-ink-inverse ring-1 ring-ink-inverse/20 transition-colors hover:bg-paper-deep hover:ring-ink-inverse/40 sm:right-3"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {item.caption && (
        <p
          className="shrink-0 px-6 pb-7 pt-4 text-center text-base leading-snug text-ink-inverse/90"
          onClick={(e) => e.stopPropagation()}
        >
          {item.caption}
        </p>
      )}
    </div>
  );
}
