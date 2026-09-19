/**
 * The catalogue's own vocabulary, resolved from the CMS.
 *
 * "mild to severe", "behind the ear, speaker inside", "enough for quiet rooms
 * and one or two people" — this is prose, it appears on all 109 product pages,
 * and it lived in lookup tables in src/lib/catalogue.ts where nobody at the
 * clinic could reach it. The tables are still there as the fallback; this
 * reads the same values out of the dictionary, which the CMS overlays.
 *
 * Built once per render and handed down, rather than each component reaching
 * for the dictionary with its own string keys — a typo in "form_cic_short"
 * silently renders nothing, and there is no reason for six components to each
 * get the chance to make it.
 */
import type { Dict } from "@/routes/dict";
import { fill } from "@/lib/i18n";
import type { Device, FormFactor, LossLevel, Tier } from "@/lib/catalogue";

export type Taxonomy = ReturnType<typeof taxonomy>;

export function taxonomy(d: Dict) {
  const t = d.taxonomy;

  const loss: Record<LossLevel, string> = {
    mild: t.loss_mild,
    moderate: t.loss_moderate,
    severe: t.loss_severe,
    profound: t.loss_profound,
  };

  const feels: Record<LossLevel, string> = {
    mild: t.feels_mild,
    moderate: t.feels_moderate,
    severe: t.feels_severe,
    profound: t.feels_profound,
  };

  const tierLabel: Record<Tier, string> = {
    entry: t.tier_entry,
    mid: t.tier_mid,
    premium: t.tier_premium,
  };

  const tierMeans: Record<Tier, string> = {
    entry: t.means_entry,
    mid: t.means_mid,
    premium: t.means_premium,
  };

  const form: Record<FormFactor, { short: string; long: string }> = {
    rie: { short: t.form_rie_short, long: t.form_rie_long },
    bte: { short: t.form_bte_short, long: t.form_bte_long },
    cic: { short: t.form_cic_short, long: t.form_cic_long },
    itc: { short: t.form_itc_short, long: t.form_itc_long },
    iic: { short: t.form_iic_short, long: t.form_iic_long },
    ite: { short: t.form_ite_short, long: t.form_ite_long },
  };

  /** "mild to severe", or just "mild" when a device covers one degree. */
  const range = (device: Device) =>
    device.lossFrom === device.lossTo
      ? loss[device.lossFrom]
      : fill(t.lossRange, {
          from: loss[device.lossFrom],
          to: loss[device.lossTo],
        });

  return { loss, feels, tierLabel, tierMeans, form, range };
}
