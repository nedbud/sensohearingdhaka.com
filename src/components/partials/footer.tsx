import Image from "next/image";
import Link from "next/link";
import { type Clinic, telFor } from "@/routes/clinic";
import type { Lang } from "@/lib/i18n";
import type { Dict } from "@/routes/dict";
import SocialLinks from "@/components/ui/SocialLinks";

export default function Footer({ lang, clinic,
  d,
}: { lang: Lang; clinic: Clinic;
  d: Dict;
}) {
  const bn = lang === "bn";

  return (
    <footer className="border-t border-line bg-paper-surface pb-24 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Image
            src="/assets/Images/Common/sensoLogo.png"
            alt="Senso Hearing Centre"
            width={379}
            height={229}
            className="h-12 w-auto"
          />
          <p className="text-ink-2">
            {bn ? clinic.address.lineBn : clinic.address.line}
            <br />
            {bn
              ? `${clinic.address.cityBn}-${clinic.address.postcode}`
              : `${clinic.address.city}-${clinic.address.postcode}`}
            <br />
            <span className="text-sm text-ink-muted">
              {bn ? clinic.address.landmarkBn : clinic.address.landmark}
              <br />
              {bn ? clinic.address.floorNoteBn : clinic.address.floorNote}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-ui text-base font-bold text-ink">
            {d.footer.contact}
          </p>
          {clinic.phones.map((phone, i) => (
            <a
              key={phone}
              href={telFor(clinic, phone)}
              className="num block text-ink-2 hover:text-brand"
            >
              {i === 0 ? clinic.phoneDisplay : i === 1 ? clinic.phoneDisplay2 : phone.replace("+88", "")}
            </a>
          ))}
          <a
            href={`mailto:${clinic.email}`}
            className="block text-ink-2 hover:text-brand"
          >
            {clinic.email}
          </a>
          {/* One reachable place from every page — which is all a privacy
              notice needs, and more than it usually gets. */}
          <Link
            href={bn ? "/gopaniyota" : "/en/privacy"}
            prefetch={false}
            className="block pt-1 text-ink-2 underline hover:text-brand"
          >
            {d.social.privacy}
          </Link>
        </div>

        <div className="space-y-2">
          <p className="font-ui text-base font-bold text-ink">
            {d.footer.hours}
          </p>
          <p className="text-ink-2">
            {d.footer.hoursValue}
            <br />
            {d.footer.closedFriday}
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-ui text-base font-bold text-ink">
            {d.social.heading}
          </p>
          <SocialLinks lang={lang} clinic={clinic} d={d} />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-line px-4 pt-6 lg:px-8">
        <p className="max-w-prose text-sm leading-relaxed text-ink-muted">
          {d.footer.distributor}
        </p>
      </div>
    </footer>
  );
}
