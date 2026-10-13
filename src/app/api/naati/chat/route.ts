import { NextResponse, type NextRequest } from "next/server";
import { composeSystemPrompt } from "@/lib/naati/engine/compose";
import { generate, generateWithTools, ModelError } from "@/lib/naati/engine/model";
import { BOOKING_TOOLS, createBookingTools, wantsBooking } from "@/lib/naati/engine/tools";
import type { ChatTurn, Lang } from "@/lib/naati/engine/types";
import { senso } from "@/lib/naati/tenants/senso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One tenant today, looked up rather than hardcoded, because the whole
 * point of the engine/tenant split is that the second clinic is a new file
 * here and nothing else.
 */
const TENANTS = { senso } as const;
const TENANT_ID: keyof typeof TENANTS = "senso";

const MAX_TURNS = 24;
const MAX_CHARS = 2000;
const MAX_IMAGES = 2;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Best-effort rate limiting, per IP, in memory.
 *
 * There is no login on this widget, so without it one bored visitor can
 * burn the day's model quota and the panel goes dead for actual patients —
 * which is a worse failure than being slow. In memory means it resets when
 * the process recycles and is not shared across instances; that is fine for
 * one clinic's traffic and is the first thing to replace if this ever
 * serves several.
 */
const WINDOW = 60_000;
const PER_WINDOW = 12;
const PER_DAY = 120;
const seen = new Map<string, { minute: number[]; day: number[] }>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const rec = seen.get(ip) ?? { minute: [], day: [] };
  rec.minute = rec.minute.filter((t) => now - t < WINDOW);
  rec.day = rec.day.filter((t) => now - t < 86_400_000);
  if (rec.minute.length >= PER_WINDOW || rec.day.length >= PER_DAY) {
    seen.set(ip, rec);
    return true;
  }
  rec.minute.push(now);
  rec.day.push(now);
  seen.set(ip, rec);
  if (seen.size > 5000) seen.clear();
  return false;
}

/**
 * What happened, without the photograph.
 *
 * The picture a patient sends is the most sensitive thing in the whole
 * system — a prescription carries their name, their age and their
 * diagnosis — so the file is passed to the model and never written down.
 * What is worth keeping is what the assistant made of it, which is free:
 * it had to read the image to reply anyway. A month of these is how the
 * prompt gets better, and it is the only record that a serial was ever
 * asked for.
 *
 * Off unless NAATI_TRANSCRIPT_URL is set, so nothing is stored by default.
 */
async function record(entry: {
  lang: Lang;
  asked: string;
  hadImage: boolean;
  answered: string;
}) {
  const url = process.env.NAATI_TRANSCRIPT_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.NAATI_TRANSCRIPT_TOKEN
          ? { authorization: `Bearer ${process.env.NAATI_TRANSCRIPT_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ ...entry, tenant: TENANT_ID, at: new Date().toISOString() }),
    });
  } catch {
    // A transcript must never be the reason a patient does not get an answer.
  }
}

/**
 * Did it say a serial was held when none was?
 *
 * It did once — it asked for a name and a time and then wrote "আপনার জন্য
 * সকাল ৯টায় একটি সিরিয়াল রাখা হয়েছে", with no booking system anywhere behind
 * it. There is one now, so the claim is no longer forbidden; it is checked
 * against what actually happened. This function only gets consulted when
 * nothing was written to the clinic's database during the turn, which makes
 * any such sentence a lie whatever the prompt said.
 */
function claimsTheImpossible(
  reply: string,
  tenant: (typeof TENANTS)[keyof typeof TENANTS]
): boolean {
  const hay = reply.toLowerCase();
  return tenant.neverClaims.some((c) => hay.includes(c.toLowerCase()));
}

const CORRECTION = `
STOP. Your previous answer said a serial was held, booked or confirmed, and
no booking was made. book_appointment either was never called or did not
succeed, so nothing exists.

Answer again. Do not claim anything was booked. If you still need a detail
from them, ask for that one thing. If the booking failed, say so plainly,
give the phone number and the WhatsApp number, and tell them what to say.`;

/** Which face to wear beside this reply. Cosmetic, and deliberately cheap. */
function toneOf(reply: string, tenant: (typeof TENANTS)[keyof typeof TENANTS]) {
  const hay = reply.toLowerCase();
  if (tenant.toneMarkers.urgent.some((m) => hay.includes(m.toLowerCase()))) return "urgent";
  if (tenant.toneMarkers.done.some((m) => hay.includes(m.toLowerCase()))) return "done";
  return "normal";
}

function clean(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_TURNS)
    .map((t: any): ChatTurn => {
      const attachments = Array.isArray(t?.attachments)
        ? t.attachments
            .slice(0, MAX_IMAGES)
            .filter(
              (a: any) =>
                typeof a?.data === "string" &&
                typeof a?.mimeType === "string" &&
                a.mimeType.startsWith("image/") &&
                a.data.length < MAX_IMAGE_BYTES
            )
            .map((a: any) => ({ data: a.data as string, mimeType: a.mimeType as string }))
        : [];
      return {
        role: t?.role === "assistant" ? "assistant" : "user",
        text: typeof t?.text === "string" ? t.text.slice(0, MAX_CHARS) : "",
        attachments,
      };
    })
    .filter((t) => t.text.trim() || (t.attachments?.length ?? 0) > 0);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (tooMany(ip)) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          `একটু বেশি হয়ে যাচ্ছে। একটু পরে আবার লিখুন, অথবা সরাসরি ফোন করুন ${senso.contact.phone.bn}।`,
      },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const lang: Lang = body?.lang === "en" ? "en" : "bn";
  const turns = clean(body?.turns);
  if (!turns.length) return NextResponse.json({ error: "no_turns" }, { status: 400 });

  const tenant = TENANTS[TENANT_ID];

  // Fresh per request. The ledger of which times were actually offered, and
  // the record of whether a booking really landed, must not leak between two
  // people's conversations.
  // Passed through from the widget so a booking made in this conversation can
  // be traced to the notice the same visitor was shown.
  const consentRef =
    typeof body?.consentRef === "string" && /^[A-Za-z0-9_-]{12,64}$/.test(body.consentRef)
      ? body.consentRef
      : undefined;

  const booking = createBookingTools(lang, consentRef);

  try {
    const system = await composeSystemPrompt(tenant, lang);

    // Tools only when the conversation is actually heading for a visit. They
    // are not free: they mean the larger model, the declarations in every
    // request, and several round trips where one would do. Most of what a
    // clinic is asked — hours, prices, the address — needs none of that, and
    // answering it on the cheap model is the difference between a quota that
    // lasts the day and one that does not.
    const booking_conversation = wantsBooking(turns);

    let reply = booking_conversation
      ? await generateWithTools(system, turns, BOOKING_TOOLS, booking.dispatch)
      : await generate(system, turns);

    // The guard now asks a question it can actually answer: did a row go into
    // the clinic's database this turn? If one did, "সিরিয়াল রাখা হয়েছে" is
    // simply true. If none did, it is a lie however confident it sounds.
    if (!booking.booking && claimsTheImpossible(reply, tenant)) {
      console.warn("[naati] unbacked booking claim, retrying");
      reply = await generate(`${system}\n\n${CORRECTION}`, turns);
      if (claimsTheImpossible(reply, tenant)) {
        console.error("[naati] unbacked booking claim on retry, using hand-over");
        reply = tenant.handover[lang];
      }
    }

    const last = turns[turns.length - 1];
    void record({
      lang,
      asked: last.text,
      hadImage: (last.attachments?.length ?? 0) > 0,
      answered: reply,
    });

    return NextResponse.json({
      reply,
      tone: toneOf(reply, tenant),
      // Present only when a booking really went in. Nothing renders it today;
      // it is here so the widget can show a card later without this route
      // having to guess from the text what happened.
      booking: booking.booking
        ? {
            id: booking.booking.id,
            date: booking.booking.test_date,
            time: booking.booking.label,
            service: booking.booking.service,
          }
        : undefined,
    });
  } catch (e) {
    const status = e instanceof ModelError ? e.status : 500;
    console.error("[naati]", e instanceof Error ? e.message : e);

    // Whatever broke, the person on the other end still needs the clinic.
    return NextResponse.json(
      {
        error: "unavailable",
        // In development the actual failure travels with the reply. Hunting it
        // in a scrolling dev-server log is a waste of everyone's afternoon, and
        // a model provider's error text is where the answer usually is. Never
        // in production: it can carry request fragments.
        ...(process.env.NODE_ENV !== "production"
          ? { detail: e instanceof Error ? e.message : String(e) }
          : {}),
        message:
          lang === "bn"
            ? `দুঃখিত, এই মুহূর্তে আমি উত্তর দিতে পারছি না। সরাসরি ফোন করুন ${senso.contact.phone.bn} — পান্থপথ সিগনাল, আর্টিসান সেন্টার, ৪র্থ তলা।`
            : `Sorry — I can't answer right now. Please call ${senso.contact.phone.en}. We're at Artisan Center, 4th floor, Panthapath Signal.`,
      },
      { status: status >= 500 ? 502 : status }
    );
  }
}
