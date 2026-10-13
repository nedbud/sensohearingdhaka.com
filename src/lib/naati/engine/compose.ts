import { ENGINE_RULES } from "./rules";
import type { Lang, Tenant } from "./types";

/**
 * Assembles the system prompt: engine rules, then who the tenant is, then
 * what it knows.
 *
 * The order matters. Rules first means a tenant cannot accidentally write
 * away a safety behaviour by adding persona text, and knowledge last means
 * the largest and most volatile block sits at the end where a provider's
 * prefix cache can keep the rest stable.
 */
/**
 * The next fortnight, written out.
 *
 * A model has no clock. Without this, "আগামীকাল" or "next Thursday" cannot
 * become the YYYY-MM-DD an appointment book needs, and the failure is silent:
 * it picks a plausible date and books the wrong morning.
 */
function calendar(timezone: string): string {
  const day = (offset: number) => {
    const d = new Date(Date.now() + offset * 86_400_000);
    const iso = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    const weekday = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "long",
    }).format(d);
    return { iso, weekday };
  };

  const today = day(0);
  const tomorrow = day(1);

  const rest = Array.from({ length: 12 }, (_, i) => day(i + 2))
    .map((d) => `  ${d.iso}  ${d.weekday}`)
    .join("\n");

  return [
    `Today is ${today.weekday}, ${today.iso}, clinic time.`,
    `Tomorrow is ${tomorrow.weekday}, ${tomorrow.iso}.`,
    "After that:",
    rest,
    "",
    "Work out the date yourself before calling anything. Never ask someone to",
    "give you a date in YYYY-MM-DD — they will say \u201cnext Thursday\u201d and that is",
    "your job to translate.",
  ].join("\n");
}

export async function composeSystemPrompt(tenant: Tenant, lang: Lang): Promise<string> {
  const knowledge = await tenant.knowledge();

  const languageRule =
    lang === "bn"
      ? "Reply in Bangla — চলিত বাংলা, আপনি. If the visitor writes in English or Banglish, reply in the language they used."
      : "Reply in English. If the visitor writes in Bangla or Banglish, switch to Bangla (চলিত, আপনি) and stay there.";

  /**
   * The rules are clinic-independent, so the one number in them is a token.
   * It used to be Senso's number, typed into a string whose own comment said
   * it was independent of which clinic — which would have put Senso's phone
   * in the second clinic's prompt.
   */
  const rules = ENGINE_RULES.replace(/\{\{PHONE\}\}/g, tenant.contact.phone[lang]);

  return [
    rules,
    "",
    "# Who you are, here",
    tenant.persona.trim(),
    "",
    "# Today",
    calendar(tenant.timezone),
    "",
    "# Language",
    languageRule,
    "",
    "# Words",
    `Use: ${tenant.vocabulary.prefer.join(", ")}`,
    `Never use: ${tenant.vocabulary.avoid.join(", ")}`,
    "",
    "# Urgent — stop and send them to a person",
    tenant.urgentSigns.map((s) => `- ${s}`).join("\n"),
    "",
    "# Claims you must never make",
    tenant.forbiddenClaims.map((s) => `- ${s}`).join("\n"),
    "",
    "# What you know",
    "Everything below is fact. Anything not below, you do not know.",
    "",
    knowledge,
  ].join("\n");
}
