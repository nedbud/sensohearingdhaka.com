import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CMS_TAG } from "@/routes/cms";

export const dynamic = "force-dynamic";

/**
 * The door the CMS knocks on when something it holds has changed.
 *
 * ## Why this file did not exist, and what it cost
 *
 * The panel has had the other half of this for months: an `outbox` table, a
 * `publishOutbox` job, a retry counter, a `lastError` column — a careful
 * delivery mechanism POSTing to `${SITE_URL}/api/revalidate`. There was no
 * such route here. Every knock went to a 404, was recorded as a failed
 * delivery, and retried against the same 404 forever.
 *
 * So the only thing that ever refreshed this site was the one-hour window in
 * `CACHE.EDITED`. Somebody would change a price in the panel, reload the
 * site, see the old price, and conclude the CMS had not saved it. It had.
 *
 * ## What it does
 *
 * Drops the cache tag every CMS fetch carries, so the next visitor gets fresh
 * data and nobody else waits for it. Not `revalidatePath`: the same CMS
 * reads feed several pages, and listing which page shows which field is a
 * list that goes stale the first time somebody adds a section.
 *
 * ## The token
 *
 * A shared secret, compared in constant time, and the route refuses
 * everything when none is configured. An open revalidation endpoint is not a
 * data leak but it is a free way to make this site rebuild itself as fast as
 * somebody can send requests.
 */

/** The same secret the panel sends. Nothing is accepted without it. */
const SECRET = process.env.SITE_REVALIDATE_TOKEN ?? "";

/**
 * Compared without leaking length or position through timing.
 *
 * `timingSafeEqual` throws on a length mismatch, which is itself a signal, so
 * the lengths are checked first and a mismatch returns the same `false` the
 * slow path would.
 */
function sameSecret(given: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!SECRET) {
    // Named rather than silent: a site deployed without the secret should say
    // so the first time the panel knocks, not behave like a 404 again.
    console.warn("[revalidate] SITE_REVALIDATE_TOKEN is not set — refusing.");
    return NextResponse.json({ ok: false, why: "not configured" }, { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!sameSecret(given)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  /**
   * The body is a courtesy, not a requirement.
   *
   * The panel sends `{ tag: "hero-slides" }` so a reader can see in the log
   * which collection caused the refresh. This site drops one tag either way
   * — it has a handful of pages reading a handful of endpoints, and the
   * bookkeeping to refresh a third of them is worth less than the certainty
   * that nothing is ever left stale.
   */
  const body = (await request.json().catch(() => null)) as { tag?: unknown } | null;
  const tag = typeof body?.tag === "string" ? body.tag : "unknown";

  revalidateTag(CMS_TAG);
  console.info(`[revalidate] ${tag} -> dropped ${CMS_TAG}`);

  return NextResponse.json({ ok: true, tag, dropped: CMS_TAG });
}
