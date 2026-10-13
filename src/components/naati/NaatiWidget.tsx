"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { phoneText } from "@/lib/site";
import NaatiFace, { type FaceState } from "./NaatiFace";
import { NAATI_OPEN } from "./AskNaatiButton";
import { consentRef, recordConsent } from "@/lib/consent";

/**
 * নাতি — the assistant, in the bottom corner of every page.
 *
 * Two decisions drive the whole layout. First, the people using this are
 * often elderly and often reading Bangla on a cheap phone, so the type is
 * large, the contrast is high and every target clears 48px. Second, they
 * frequently have nothing to say and a photograph to show, so the camera
 * sits beside the text box rather than behind a menu — sending a picture
 * has to be as easy as sending a word.
 *
 * On phones the panel takes the whole screen. A small floating box is
 * fashionable and useless to someone holding the phone at arm's length.
 */

type Attachment = { data: string; mimeType: string };
type Tone = "normal" | "urgent" | "done";
type Turn = {
  role: "user" | "assistant";
  text: string;
  attachments?: Attachment[];
  tone?: Tone;
};

const STORE_KEY = "naati.turns.v1";
const PHOTO_CONSENT_KEY = "naati.photo-consent.v1";

const T = {
  bn: {
    open: "নাতিকে জিজ্ঞেস করুন",
    name: "নাতি",
    byline: "Naati AI · সেনসো",
    close: "বন্ধ করুন",
    placeholder: "এখানে লিখুন…",
    send: "পাঠান",
    photo: "ছবি দিন",
    remove: "সরান",
    thinking: "লিখছে",
    restart: "নতুন করে শুরু",
    disclaimer: `নাতি ডাক্তার নয়। জরুরি হলে সরাসরি ফোন করুন ${phoneText("bn")}।`,
    privacy: "গোপনীয়তা",
    consent: "আপনি যা লেখেন তা উত্তর দেওয়ার জন্য পড়া হয়। সিরিয়াল নিতে চাইলে শুধু নাম আর নম্বর লাগবে।",
    photoTitle: "ছবি পাঠানোর আগে একটু জেনে নিন",
    photoBody:
      "প্রেসক্রিপশন বা রিপোর্টে সাধারণত নাম, বয়স আর রোগের কথা লেখা থাকে। ছবিটা পড়ার জন্য দেশের বাইরের একটি সেবায় যাবে। পড়া হবে, উত্তর দেব — ছবিটা আমরা কোথাও জমা রাখি না।",
    photoAgree: "ঠিক আছে, পাঠাই",
    photoDecline: "বরং লিখে বলি",
    photoNote: "ছবি পড়ার জন্য দেশের বাইরে যায়, জমা রাখা হয় না।",
    failed: `উত্তর আনতে পারলাম না। আবার চেষ্টা করুন, অথবা ফোন করুন ${phoneText("bn")}।`,
    photoAlt: "আপনার পাঠানো ছবি",
  },
  en: {
    open: "Ask Naati",
    name: "Naati",
    byline: "Naati AI · by Senso",
    close: "Close",
    placeholder: "Write here…",
    send: "Send",
    photo: "Add a photo",
    remove: "Remove",
    thinking: "typing",
    restart: "Start again",
    disclaimer: `Naati is not a doctor. If it's urgent, call ${phoneText("en")}.`,
    privacy: "Privacy",
    consent: "What you write here is read in order to answer you. Booking needs only your name and number.",
    photoTitle: "Before you send a photo",
    photoBody:
      "A prescription or report usually carries a name, an age and a diagnosis. To be read, the photo is sent to a service outside Bangladesh. It is read, you get an answer, and we keep no copy of it.",
    photoAgree: "That's fine, send it",
    photoDecline: "I'll type it instead",
    photoNote: "Photos are read abroad and never stored.",
    failed: `I couldn't get an answer. Try again, or call ${phoneText("en")}.`,
    photoAlt: "The photo you sent",
  },
} as const;

/** Phone photos are enormous and none of that detail survives the model. */
async function shrink(file: File): Promise<Attachment> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const url = canvas.toDataURL("image/jpeg", 0.82);
  return { data: url.split(",")[1] ?? "", mimeType: "image/jpeg" };
}

export default function NaatiWidget({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<Attachment | null>(null);
  const [busy, setBusy] = useState(false);

  /**
   * Whether this visitor has agreed, this visit, to a photo being read abroad.
   *
   * Asked once per visit rather than once ever. Consent to send a photograph
   * of a medical document is not a preference to be remembered forever on a
   * device that may be shared — a son hands his phone to his father and the
   * father has agreed to nothing. sessionStorage forgets when the tab closes,
   * which is the right length of memory for this.
   */
  const [photoOk, setPhotoOk] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Survives a page change. An older reader who taps a link mid-question
  // should not come back to an empty box.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PHOTO_CONSENT_KEY) === "1") setPhotoOk(true);
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) setTurns(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      // The images are dropped on the way in — they are large, and they are
      // the one thing that should not sit in a browser after the answer.
      sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify(turns.map(({ role, text }) => ({ role, text })))
      );
    } catch {}
  }, [turns]);

  useEffect(() => {
    if (open) feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, open]);

  // Every call-to-action on the site opens this panel.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const seed = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (seed) setDraft(seed);
      setOpen(true);
    };
    window.addEventListener(NAATI_OPEN, onOpen);
    return () => window.removeEventListener(NAATI_OPEN, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /**
   * Whether this message may go at all.
   *
   * There are three ways to send — the button, Enter in the box, and the
   * form's own submit — and a disabled button stops exactly one of them. An
   * un-agreed photo slipping out because someone pressed Enter would make the
   * check-in decorative.
   */
  const blockedByPhoto = !!pending && !photoOk;

  const send = useCallback(
    async (text: string, image?: Attachment | null) => {
      const body = text.trim();
      if ((!body && !image) || busy) return;

      const mine: Turn = { role: "user", text: body, attachments: image ? [image] : [] };
      const history = [...turns, mine];

      setTurns(history);
      setDraft("");
      setPending(null);
      setBusy(true);

      try {
        const res = await fetch("/api/naati/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lang, consentRef: consentRef(), turns: history }),
        });
        const json = await res.json().catch(() => null);
        const reply = json?.reply ?? json?.message ?? t.failed;
        const tone: Tone = json?.tone === "urgent" || json?.tone === "done" ? json.tone : "normal";
        setTurns((prev) => [...prev, { role: "assistant", text: reply, tone }]);
      } catch {
        setTurns((prev) => [...prev, { role: "assistant", text: t.failed }]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, lang, t.failed, turns]
  );

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPending(await shrink(file));
      inputRef.current?.focus();
    } catch {}
  }

  const last = turns[turns.length - 1];
  const face: FaceState = busy
    ? (last?.attachments?.length ?? 0) > 0
      ? "reading"
      : "thinking"
    : draft.trim() || pending
    ? "listening"
    : last?.role === "assistant" && last.tone === "urgent"
    ? "concerned"
    : last?.role === "assistant" && last.tone === "done"
    ? "done"
    : "idle";

  const greeting = lang === "bn"
    ? "আসসালামু আলাইকুম। আমি নাতি, সেনসো হিয়ারিং সেন্টার থেকে।\n\nকী নিয়ে জানতে চান বলুন — অথবা প্রেসক্রিপশন, রিপোর্ট বা মেশিনের ছবি থাকলে সরাসরি পাঠিয়ে দিন, আমি দেখে বলছি।"
    : "Hello — I'm Naati, from Senso Hearing Centre.\n\nTell me what you need, or just send a photo of a prescription, a report or your device and I'll read it for you.";

  const chips = lang === "bn"
    ? ["আজ কি খোলা আছে?", "কানের মেশিনের দাম কত?", "কান পরীক্ষায় কত সময় লাগে?", "ঠিকানাটা দিন"]
    : ["Are you open today?", "How much does a hearing aid cost?", "How long does a test take?", "What's the address?"];

  return (
    <>
      {/* Sits clear of the mobile contact bar, which owns bottom-0 below md. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.open}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-line-strong bg-paper-surface py-2 pl-2 pr-4 shadow-[0_6px_24px_rgba(34,31,27,0.16)] transition hover:border-brand md:bottom-6 md:right-6"
        >
          <Face state="idle" className="h-10 w-10" />
          <span className="text-left leading-tight">
            <span className="block font-ui text-sm font-semibold text-ink">{t.name}</span>
            <span className="block font-ui text-micro text-ink-muted">{t.open}</span>
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t.name}
          className="fixed inset-0 z-[60] flex flex-col bg-paper-surface md:inset-auto md:bottom-6 md:right-6 md:h-[min(38rem,calc(100vh-6rem))] md:w-[24rem] md:rounded-2xl md:border-[1.5px] md:border-line-strong md:shadow-[0_16px_48px_rgba(34,31,27,0.22)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3 md:rounded-t-2xl">
            <Face state={face} className="h-10 w-10" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="font-display text-base text-ink">{t.name}</p>
              <p className="font-ui text-micro text-ink-muted">{t.byline}</p>
            </div>
            {turns.length > 0 && (
              <button
                type="button"
                onClick={() => setTurns([])}
                className="hidden font-ui text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline sm:block"
              >
                {t.restart}
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          {/* Feed */}
          <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <Bubble who="naati" text={greeting} />

            {turns.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => send(c)}
                    className="rounded-full border border-line-strong bg-paper px-3.5 py-2 font-ui text-sm text-ink-2 transition hover:border-brand hover:text-ink"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {turns.map((turn, i) => (
              <Bubble
                key={i}
                who={turn.role === "user" ? "me" : "naati"}
                text={turn.text}
                image={turn.attachments?.[0]}
                imageAlt={t.photoAlt}
              />
            ))}

            {busy && (
              <div className="flex items-center gap-2 pl-1" aria-live="polite">
                <span className="sr-only">{t.thinking}</span>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-ink-muted"
                    style={{ animationDelay: `${i * 140}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-line bg-paper px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:rounded-b-2xl md:pb-3">
            {pending && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-line-strong bg-paper-surface p-2">
                <img
                  src={`data:${pending.mimeType};base64,${pending.data}`}
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                />
                <span className="flex-1 font-ui text-xs text-ink-2">{t.photo}</span>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="px-2 font-ui text-xs text-brand"
                >
                  {t.remove}
                </button>
              </div>
            )}

            {/* The check-in, at the one moment it belongs.
                A photograph of a prescription is the only thing in this widget
                that leaves the country, and the only thing carrying a name, an
                age and a diagnosis together. The law wants explicit consent for
                exactly that, and explicit means a decision the person actually
                made — not a line of grey text under a button they already
                pressed.
                So it is asked here: after the photo is chosen, before it can
                go, with a real way out that is not "give up". Declining does
                not end the conversation, it just puts the cursor back in the
                box and offers to take it in words instead, which works nearly
                as well and is the honest alternative rather than a punishment.
                Once per visit, not once per photo: asking three times in one
                conversation stops reading as care and starts reading as a
                nag. */}
            {!!pending && !photoOk && (
              <div className="mb-2 rounded-lg border-[1.5px] border-brand/40 bg-brand/[0.04] p-3">
                <p className="font-ui text-sm font-semibold text-ink">{t.photoTitle}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{t.photoBody}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoOk(true);
                      // Filed now, at the moment of the decision, rather than
                      // when the photo is finally sent — they agreed either way.
                      recordConsent("chat_image", lang);
                      try {
                        sessionStorage.setItem(PHOTO_CONSENT_KEY, "1");
                      } catch {
                        // A locked-down browser must not cost them the answer.
                        // The consent still holds for this render either way.
                      }
                      inputRef.current?.focus();
                    }}
                    className="inline-flex min-h-[38px] items-center rounded-lg border-[1.5px] border-brand bg-brand px-3.5 font-ui text-sm font-semibold text-white hover:bg-brand-deep"
                  >
                    {t.photoAgree}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPending(null);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex min-h-[38px] items-center rounded-lg border-[1.5px] border-line-strong px-3.5 font-ui text-sm text-ink-2 hover:border-ink-2 hover:text-ink"
                  >
                    {t.photoDecline}
                  </button>

                  <a
                    href={lang === "bn" ? "/gopaniyota" : "/en/privacy"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-ui text-xs text-ink-muted underline hover:text-brand"
                  >
                    {t.privacy}
                  </a>
                </div>
              </div>
            )}

            {/* Once they have agreed, the reminder shrinks back to a note. */}
            {!!pending && photoOk && (
              <p className="pb-2 text-micro leading-snug text-ink-muted">
                {t.photoNote}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (blockedByPhoto) return;
                send(draft, pending);
              }}
              className="flex items-end gap-2"
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={t.photo}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-line-strong bg-paper-surface text-ink-2 hover:border-brand hover:text-brand"
              >
                <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" aria-hidden="true">
                  <path d="M4 8.5A1.5 1.5 0 015.5 7h1.9l1.2-1.8A1 1 0 019.4 4.7h5.2a1 1 0 01.8.5L16.6 7h1.9A1.5 1.5 0 0120 8.5v8A1.5 1.5 0 0118.5 18h-13A1.5 1.5 0 014 16.5v-8z" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12.2" r="3.1" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (blockedByPhoto) return;
                    send(draft, pending);
                  }
                }}
                placeholder={t.placeholder}
                className="max-h-32 min-h-[48px] flex-1 resize-none rounded-lg border-[1.5px] border-line-strong bg-paper-surface px-3 py-3 font-sans text-base text-ink outline-none placeholder:text-ink-muted focus:border-brand"
              />

              <button
                type="submit"
                disabled={busy || (!draft.trim() && !pending) || blockedByPhoto}
                aria-label={t.send}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-brand bg-brand text-white transition disabled:border-line-strong disabled:bg-paper-2 disabled:text-ink-muted"
              >
                <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" aria-hidden="true">
                  <path d="M4.5 12h13m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            {/* Not a checkbox and not a dialogue. Consent has to be informed,
                but a wall you must click through before you may ask a question
                is where an elderly person stops — and stopping them is the one
                thing this widget exists to prevent. So: say it plainly, keep it
                visible the whole time, and link the rest. */}
            <p className="pt-2 text-center font-ui text-micro leading-snug text-ink-muted">
              {t.disclaimer}
              <br />
              {t.consent}{" "}
              <a
                href={lang === "bn" ? "/gopaniyota" : "/en/privacy"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-brand"
              >
                {t.privacy}
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The picture is the whole character — there is no illustration set and no
 * animation, just one photograph. If it has not been dropped in yet the
 * initial stands in, so the widget never renders as a broken image.
 */
function Face({ state, className = "" }: { state: FaceState; className?: string }) {
  return (
    <span className={`relative shrink-0 ${className}`}>
      <NaatiFace
        state={state}
        className="h-full w-full rounded-full ring-[1.5px] ring-line-strong"
      />
      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-paper-surface bg-open" />
    </span>
  );
}

function Bubble({
  who,
  text,
  image,
  imageAlt,
}: {
  who: "me" | "naati";
  text: string;
  image?: Attachment;
  imageAlt?: string;
}) {
  const mine = who === "me";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 font-sans text-sm leading-relaxed ${
          mine
            ? "rounded-br-md bg-brand-tint text-ink"
            : "rounded-bl-md border border-line bg-paper text-ink"
        }`}
      >
        {image && (
          <img
            src={`data:${image.mimeType};base64,${image.data}`}
            alt={imageAlt ?? ""}
            className="mb-2 max-h-52 w-full rounded-lg object-cover"
          />
        )}
        {text.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className={i ? "mt-2" : ""}>
              {para}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
}
