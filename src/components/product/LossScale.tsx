import { LOSS_LABEL, type Device, type LossLevel } from "@/lib/catalogue";
import { fill, type Lang } from "@/lib/i18n";
import { taxonomy } from "@/routes/taxonomy";
import type { Dict } from "@/routes/dict";

const ORDER: LossLevel[] = ["mild", "moderate", "severe", "profound"];

/**
 * Which part of the hearing range this device is fitted for.
 *
 * The audiogram is the one drawing every patient here leaves with, and its
 * logic — quiet at the top, loss deepening downward — is the only visual
 * language in this trade that is native rather than decorative. Here it is
 * turned on its side into a scale, so a person can place themselves on it
 * without being able to read an audiogram at all.
 */
export default function LossScale({
  device,
  lang,
  d,
}: {
  device: Device;
  lang: Lang;
  d: Dict;
}) {
  const t = taxonomy(d);
  const from = ORDER.indexOf(device.lossFrom);
  const to = ORDER.indexOf(device.lossTo);

  return (
    <div>
      <div className="flex gap-1.5" aria-hidden="true">
        {ORDER.map((level, i) => {
          const active = i >= from && i <= to;
          return (
            <div key={level} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  active ? "bg-brand" : "bg-line"
                }`}
                style={{ opacity: active ? 0.45 + (i - from) * 0.18 : 1 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {ORDER.map((level, i) => {
          const active = i >= from && i <= to;
          return (
            <p
              key={level}
              className={`flex-1 text-xs leading-tight ${
                active ? "font-medium text-ink" : "text-ink-muted"
              }`}
            >
              {t.loss[level]}
            </p>
          );
        })}
      </div>
      <p className="sr-only">
        {fill(d.deviceFaq.scaleNote, {
          from: t.loss[device.lossFrom],
          to: t.loss[device.lossTo],
        })}
      </p>
    </div>
  );
}
