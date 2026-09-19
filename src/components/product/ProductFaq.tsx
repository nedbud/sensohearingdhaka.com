import { FORM_FACTOR, LOSS_LABEL, TIER_MEANS, type Device } from "@/lib/catalogue";
import { formatTaka, toBengaliDigits } from "@/lib/site";
import { fill, type Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { taxonomy } from "@/routes/taxonomy";
import type { Clinic } from "@/routes/clinic";
import { say, type Part } from "@/routes/details";

/**
 * Questions answered per device, generated from its actual attributes.
 *
 * 109 product pages carrying the same boilerplate would be thin and
 * near-duplicate, which is worse than having no pages. Because these answers
 * are built from the device's own form factor, power class, battery type and
 * price, a CIC page and a super-power BTE page genuinely say different
 * things — which is the only honest way to have this many indexable pages.
 */
export function productFaq(
  d: Device,
  lang: Lang,
  clinic: Clinic,
  dict: Dict,
  parts: Part[]
) {
  const bn = lang === "bn";
  const n = (v: number | string) => (bn ? toBengaliDigits(v) : String(v));
  const tax = taxonomy(dict);
  const items: { question: string; answer: string }[] = [];

  // The battery line names whatever the panel has first in the parts list,
  // with its own unit, rather than repeating a price this file remembers.
  const battery = parts[0];
  const batteryLine = battery
    ? `${formatTaka(battery.price)}${
        say(battery.unit, lang) ? ` (${say(battery.unit, lang)})` : ""
      }`
    : "";

  const values = {
    name: d.title,
    from: tax.loss[d.lossFrom],
    to: tax.loss[d.lossTo],
    tier: tax.tierMeans[d.tier],
    price: formatTaka(d.priceValue),
    months: n(clinic.warranty.followUpMonths),
    years: n(clinic.warranty.years),
    testFee: formatTaka(clinic.testPackage.fee),
    battery: batteryLine,
  };
  const t = (template: string) => fill(template, values);

  items.push({
    question: t(dict.deviceFaq.whoFor),
    answer: t(dict.deviceFaq.whoForAnswer),
  });

  items.push({
    question: t(dict.deviceFaq.priceQ),
    answer: t(dict.deviceFaq.priceAnswer),
  });

  if (d.formFactor) {
    items.push({
      question: dict.deviceFaq.fitQ,
      answer: tax.form[d.formFactor].long,
    });
  }

  if (d.rechargeable !== undefined) {
    items.push({
      question: dict.deviceFaq.batteryQ,
      answer: d.rechargeable
        ? dict.deviceFaq.rechargeableAnswer
        : t(dict.deviceFaq.disposableAnswer),
    });
  }

  if (d.power === "superpower" || d.power === "power") {
    items.push({
      question: dict.deviceFaq.powerQ,
      answer: dict.deviceFaq.powerAnswer,
    });
  }

  items.push({
    question: dict.deviceFaq.tryQ,
    answer: dict.deviceFaq.tryAnswer,
  });

  return items;
}
