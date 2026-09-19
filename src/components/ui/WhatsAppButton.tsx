import { WhatsAppIcon } from "./Icons";
import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import { whatsappFor, type Clinic } from "@/routes/clinic";

/**
 * The site's primary action, on every page.
 *
 * It was "Talk to Naati" until the assistant was taken down for the admin
 * work, and the button went with it in the worst possible way: it stayed on
 * the page and stopped doing anything. `openNaati()` dispatches an event, the
 * widget that listened for it is commented out in RootShell, so the main call
 * to action on every page of a live site has been a button that swallows the
 * tap. Nothing logs it, so nothing would ever have reported it.
 *
 * WhatsApp is the honest thing to put there in the meantime — it is where
 * this clinic's enquiries actually arrive, and it needs no server of ours to
 * be working. It is a link, not a button: it opens in the app on a phone and
 * web.whatsapp.com on a desktop, it survives having JavaScript fail, and the
 * browser can offer "copy link address" on it.
 *
 * `seed` fills the message box, so the page the person was reading arrives
 * with them and Senso is not asking "which device?" to someone who has just
 * spent four minutes on that device's page.
 */
export default function WhatsAppButton({
  lang,
  clinic,
  d,
  size = "large",
  label,
  seed,
  className = "",
}: {
  lang: Lang;
  clinic: Clinic;
  d: Dict;
  size?: "large" | "compact";
  label?: string;
  /** Pre-fills the message — used where the page already knows the question. */
  seed?: string;
  className?: string;
}) {
  const text = label ?? d.nav.whatsapp;
  const message = seed ?? d.wa.appointment;

  const box =
    size === "large"
      ? "min-h-[52px] gap-2.5 px-5 text-lg"
      : "min-h-[44px] gap-2 px-3 text-sm sm:px-4";

  return (
    <a
      href={whatsappFor(clinic, message)}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics="whatsapp"
      className={`inline-flex items-center justify-center rounded-full border-[1.5px] border-brand bg-brand py-1.5 font-ui leading-tight text-white transition-colors hover:border-brand-deep hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 ${box} ${className}`}
    >
      <WhatsAppIcon className={size === "large" ? "h-6 w-6" : "h-5 w-5"} />
      <span className={size === "compact" ? "hidden sm:inline" : undefined}>
        {text}
      </span>
    </a>
  );
}
