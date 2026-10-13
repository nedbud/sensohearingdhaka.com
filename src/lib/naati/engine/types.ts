/**
 * The contract between the engine and whoever it is speaking for.
 *
 * Everything in this file is deliberately free of Senso. The engine knows
 * how a clinic front desk should behave; a tenant supplies who it is, what
 * it sells, what it must never claim, and what counts as an emergency in
 * its field. That split is the whole reason this can become a product for
 * a second clinic later instead of a fork of this one.
 */

export type Lang = "bn" | "en";

export type ChatRole = "user" | "assistant";

/** An image the visitor attached, already base64 and without the data: prefix. */
export type Attachment = {
  data: string;
  mimeType: string;
};

export type ChatTurn = {
  role: ChatRole;
  text: string;
  attachments?: Attachment[];
};

export type Bilingual = { bn: string; en: string };

export type Tenant = {
  id: string;

  /** What the assistant is called, as the visitor sees it. */
  assistantName: Bilingual;
  /** Rendered under the name: "by Senso". */
  byline: Bilingual;
  businessName: Bilingual;

  defaultLang: Lang;

  /**
   * Where this business is, in clock terms. The model has no idea what day it
   * is, and "আগামীকাল" has to resolve to a real date before it can be looked
   * up in an appointment book.
   */
  timezone: string;

  /** Who this assistant is. Character, not rules — the rules are the engine's. */
  persona: string;

  /** Words this business uses, and words it must not. */
  vocabulary: { prefer: string[]; avoid: string[] };

  /**
   * What stops the conversation. In hearing care that is sudden one-sided
   * loss; in another field it would be something else entirely, which is
   * exactly why it lives here and not in the engine.
   */
  urgentSigns: string[];

  /** Claims staff have made that are not true, and must never be repeated. */
  forbiddenClaims: string[];

  /**
   * Things that would be a lie if the assistant ever said them, because it
   * has no system behind it that could make them true. Checked on the way
   * out; a prompt rule alone is not enough when the cost of getting it wrong
   * is a patient crossing the city for an appointment nobody made.
   */
  neverClaims: string[];

  /**
   * How this business is reached when the assistant gives up.
   *
   * On the tenant and not in the engine rules, where Senso's number used to
   * sit inside a string that calls itself clinic-independent. The printed
   * form differs by language — Bangla pages print Bengali digits — so both
   * are carried rather than converted at the point of use.
   */
  contact: { phone: Bilingual; whatsapp: string };

  /** Said instead, when it does. */
  handover: Bilingual;

  /**
   * Phrases in this tenant's own replies that should change the assistant's
   * face. Best-effort and cosmetic — a missed match shows the wrong
   * expression, never the wrong answer — but when the words say do not wait,
   * a smiling avatar beside them undoes the sentence.
   */
  toneMarkers: { urgent: string[]; done: string[] };

  /** Everything the assistant may state as fact, rendered as plain text. */
  knowledge: () => Promise<string>;

  /** First thing the visitor reads when the panel opens. */
  greeting: Bilingual;

  /** Taps offered before they have typed anything. */
  prompts: { bn: string[]; en: string[] };
};
