"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";

/**
 * Bangla lives at the existing URLs (/, /hearing-aids, ...) so no ranking
 * equity is lost; English mirrors them under /en. Separate URLs are what
 * Google requires for hreflang — a client-side toggle cannot be annotated.
 *
 * Which side is lit comes from the URL in the address bar, not from the prop.
 * The prop says what the server rendered; the pathname says where the reader
 * actually is, and when those two disagree it is the pathname that is right.
 * They disagreed across the whole /en subtree until the two root layouts were
 * split apart, and the visible symptom was a toggle that never left বাংলা.
 */
export default function LangSwitch({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const path = pathname || (lang === "en" ? "/en" : "/");
  const onEnglish = path === "/en" || path.startsWith("/en/");

  const bnPath = onEnglish ? path.replace(/^\/en/, "") || "/" : path;
  const enPath = onEnglish ? path : `/en${path === "/" ? "" : path}`;

  /**
   * The href stays clean so a crawler sees the plain translated URL, but a
   * reader who has narrowed the catalogue down to rechargeable Nexia models
   * and then wants to read it in English should not be dropped back at an
   * unfiltered list. The query string is carried across at click time.
   *
   * It is read from `window` in the handler rather than from
   * `useSearchParams`, which would opt every page that renders this header —
   * that is, all of them — out of static rendering.
   */
  const carryQuery = (target: string) => (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    const query = window.location.search;
    if (!query) return;
    event.preventDefault();
    window.location.assign(target + query);
  };

  const item = (active: boolean) =>
    `px-3 py-1.5 min-h-[38px] inline-flex items-center font-ui text-sm leading-none transition-colors ${
      active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <div className="flex overflow-hidden rounded-full border-[1.5px] border-line-strong bg-paper-surface">
      <Link
        href={bnPath}
        prefetch={false}
        onClick={carryQuery(bnPath)}
        className={item(!onEnglish)}
        hrefLang="bn"
        aria-current={!onEnglish ? "page" : undefined}
      >
        বাংলা
      </Link>
      <Link
        href={enPath}
        prefetch={false}
        onClick={carryQuery(enPath)}
        className={item(onEnglish)}
        hrefLang="en"
        aria-current={onEnglish ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}
