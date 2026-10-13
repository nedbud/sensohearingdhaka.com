import { SITE, cityLine } from "@/lib/site";
import { dict, type Lang } from "@/lib/i18n";
import AskNaatiButton from "@/components/naati/AskNaatiButton";

/**
 * Asking someone with hearing loss to phone you as the price of admission is
 * the wrong default for a hearing clinic, so this section leads with writing.
 *
 * There used to be a callback form under here — name, phone, best time to
 * call, and a box headed "what is happening with your hearing?". It posted
 * from the visitor's browser straight to EmailJS, a company in the United
 * States. That box is where someone types "ডান কানে শুনি না", which makes it
 * health data about an identified person, leaving the country, with nothing
 * said to them about it. Bangladesh has had a data protection law since the
 * 2025 Ordinance and the 2026 Act, and this was the clearest breach of it on
 * the site.
 *
 * It is gone rather than rerouted, because the thing it was for is now done
 * better anyway: Naati takes the same name and number, understands the
 * problem, and puts an actual serial in the clinic's book instead of adding
 * a row to somebody's inbox.
 */
export default function Contact({ lang }: { lang: Lang }) {
  const d = dict(lang);
  const bn = lang === "bn";

  return (
    <section id="contact" className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h2 className="mb-3 text-2xl text-ink">
        {bn ? "যোগাযোগ করুন" : "Get in touch"}
      </h2>
      <p className="mb-6 max-w-prose text-xl text-ink-2">
        {bn
          ? "নাতিকে লিখুন — দাম, পরীক্ষা, ঠিকানা, যা জানার আছে। সময় লাগবে না।"
          : "Write to Naati — prices, tests, directions, whatever you need to know."}
      </p>

      <div className="mb-8">
        <AskNaatiButton lang={lang} />
      </div>


      <div className="mt-8 flex flex-col gap-2 text-base text-ink-2">
        <p className="font-ui text-ink">
          {bn ? "কোথায় আসবেন" : "Where to find us"}
        </p>
        <p>
          {bn ? SITE.address.lineBn : SITE.address.line},{" "}
          {cityLine(SITE.address, lang)}
          <br />
          <span className="text-ink-muted">
            {bn ? SITE.address.landmarkBn : SITE.address.landmark}
          </span>
        </p>
        <a
          href={SITE.address.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-ui text-brand underline"
        >
          {d.common.map}
        </a>
      </div>
    </section>
  );
}
