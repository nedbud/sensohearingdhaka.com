import Link from "next/link";
import { lines, type Lang } from "@/lib/i18n";
import { telFor } from "@/routes/clinic";
import { getSite } from "@/routes/site";

/**
 * The privacy notice.
 *
 * Written to be read, not to be survived. Bangladesh's data protection law
 * asks a controller to tell people six things — what is collected, why, who
 * else sees it, how long it is kept, how to say stop, and who to ask — and a
 * notice that buries those under two pages of "we value your privacy" fails
 * the point of the rule even where it satisfies the letter. Consent nobody
 * read is not consent.
 *
 * So: short sentences, the actual answers, and no promise this clinic cannot
 * keep. Every claim here is true of the code as it stands. If the code
 * changes — a new analytics tag, a transcript store switched on, images kept
 * on disk — this page changes with it or it becomes a lie.
 *
 * Which is exactly why the text is in the CMS rather than in this file. A
 * notice that only a developer can correct is a notice that stays wrong for
 * as long as the next deployment takes.
 */

type Block = { heading: string; paragraphs: string[] };

/**
 * The notice arrives as one field of text. A line beginning "## " opens a
 * section; every other line is a paragraph of the section it follows. A
 * paragraph before any heading is kept, under no heading, rather than
 * dropped — losing a sentence out of a privacy notice silently is the one
 * failure this page cannot have.
 */
function sections(body: string): Block[] {
  const blocks: Block[] = [];

  for (const line of lines(body)) {
    if (line.startsWith("## ")) {
      blocks.push({ heading: line.slice(3).trim(), paragraphs: [] });
      continue;
    }
    if (!blocks.length) blocks.push({ heading: "", paragraphs: [] });
    blocks[blocks.length - 1].paragraphs.push(line);
  }

  return blocks;
}

export default async function PrivacyView({ lang }: { lang: Lang }) {
  const { clinic, d } = await getSite(lang);
  const bn = lang === "bn";
  const c = d.privacy;
  const blocks = sections(c.body);

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      <h1 className="text-4xl text-ink">{c.title}</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-2">{c.intro}</p>

      <div className="mt-10 flex flex-col gap-9">
        {blocks.map((block, index) => (
          <section key={block.heading || index}>
            {block.heading && (
              <h2 className="mb-3 font-ui text-xl font-semibold text-ink">
                {block.heading}
              </h2>
            )}
            <div className="flex flex-col gap-2.5">
              {block.paragraphs.map((line) => (
                <p key={line} className="max-w-prose leading-relaxed text-ink-2">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-3 font-ui text-xl font-semibold text-ink">
            {c.contactHeading}
          </h2>
          <div className="flex flex-col gap-2.5 text-ink-2">
            <p className="max-w-prose leading-relaxed">
              {c.contactLede}
            </p>
            <p>
              <a href={telFor(clinic, clinic.phones[0])} className="num font-ui text-brand underline">
                {clinic.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${clinic.email}`} className="font-ui text-brand underline">
                {clinic.email}
              </a>
            </p>
            <p className="max-w-prose leading-relaxed">
              {bn ? clinic.address.lineBn : clinic.address.line},{" "}
              {bn
                ? `${clinic.address.cityBn}-${clinic.address.postcode}`
                : `${clinic.address.city}-${clinic.address.postcode}`}
            </p>
          </div>
        </section>
      </div>

      <p className="mt-12 border-t border-line pt-5 text-sm text-ink-muted">{c.updated}</p>

      <p className="mt-3 text-sm">
        <Link href={bn ? "/" : "/en"} className="font-ui text-brand underline">
          {c.back}
        </Link>
      </p>
    </article>
  );
}
