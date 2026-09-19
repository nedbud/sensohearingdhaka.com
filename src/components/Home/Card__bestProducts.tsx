import Link from "next/link";
import Image from "next/image";
import { formatTaka } from "@/lib/site";
import { type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { taxonomy } from "@/routes/taxonomy";
import { toDevice, lossRangeLabel, FORM_FACTOR } from "@/lib/catalogue";
import type { ProductMapInterface } from "@/routes/product";

/**
 * The product card.
 *
 * The old card rotated the image -6deg, coloured the name by array index,
 * and never showed the price — on cards whose titles literally end "...price
 * in Bangladesh".
 *
 * What it shows now is the line that actually helps someone choose: who the
 * device is for. Twelve cards reading "Resound Nexia 3xx" tell a visitor
 * nothing; twelve cards that each say which degree of hearing loss they are
 * fitted for turn a wall of model numbers into something you can scan. It
 * costs nothing — the catalogue already derives it.
 */
export default function ProductCard({
  item,
  lang,
  dict,
  priority = false,
}: {
  item: ProductMapInterface;
  lang: Lang;
  dict: Dict;
  priority?: boolean;
}) {
  const bn = lang === "bn";
  const t = taxonomy(dict);
  const href = `${lang === "en" ? "/en" : ""}/hearing-aids/${item.slug}`;
  const image =
    item.image && item.image.length > 50
      ? item.image
      : "/assets/Images/Common/senso_404_not_found.png";

  const d = toDevice(item);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-surface transition-all hover:-translate-y-0.5 hover:border-ink-2 hover:shadow-[0_10px_28px_-18px_rgba(34,31,27,0.45)]"
    >
      <div className="relative aspect-square w-full bg-paper-2">
        <Image
          src={image}
          alt={item.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm text-ink-muted">{item.series}</p>
        <p className="font-ui text-base font-semibold leading-snug text-ink">
          {d.title}
        </p>
        {!d.isAccessory && (
          <p className="mt-0.5 text-sm leading-snug text-ink-2">
            {t.range(d)}
            {dict.catalogue.lossSuffix}
            {d.formFactor && (
              <span className="hidden text-ink-muted sm:block">
                {t.form[d.formFactor].short}
              </span>
            )}
          </p>
        )}
        <p className="num mt-auto pt-3 font-ui text-xl font-bold text-ink">
          {formatTaka(item.price)}
        </p>
      </div>
    </Link>
  );
}
