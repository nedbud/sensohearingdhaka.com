/**
 * The way in, in pictures.
 *
 * The address alone has never been enough here. "57/9, Artisan Center (4th
 * floor), Panthapath Signal" describes a building that carries nine
 * signboards on its face and whose entrance is a gap between two shutters,
 * and patients ring from the footpath outside it. A photograph of the
 * signboard settles in a second what a sentence cannot settle at all.
 *
 * Same contract as everything else under this folder: a dead CMS is an empty
 * list, not a throw, and an empty list means the address renders on its own
 * exactly as it did before these pictures existed. There is deliberately no
 * compiled fallback — unlike a headline, a photograph of a building is not
 * something the code should be asserting when the CMS has gone quiet.
 */
import type { Lang } from "@/lib/i18n";
import { CACHE, getData, say, type Pair } from "@/routes/cms";

export type VisitPhoto = {
  image: string;
  alt: Pair;
  caption: Pair;
};

interface VisitPhotoApi {
  image: string | null;
  alt: Pair;
  caption: Pair;
}

/**
 * Pictures of a building change a few times a year at most — a shutter is
 * repainted, a neighbour's signboard comes down — so they are read on the
 * slower of the two clocks.
 */
export async function getVisitPhotos(): Promise<VisitPhoto[]> {
  const api = await getData<VisitPhotoApi[]>("/api/senso/visit-photos", CACHE.RARE);
  if (!api) return [];

  return api
    .filter((p) => p.image)
    .map((p) => ({
      image: p.image as string,
      alt: p.alt ?? { bn: null, en: null },
      caption: p.caption ?? { bn: null, en: null },
    }));
}

/**
 * The description read aloud to a blind visitor, falling back to the caption.
 *
 * An empty alt on a photograph that carries information — which signboard,
 * which door — is worse than a short one, and the caption is always at least
 * about the right picture.
 */
export const photoAlt = (photo: VisitPhoto, lang: Lang): string =>
  say(photo.alt, lang) || say(photo.caption, lang);

export const photoCaption = (photo: VisitPhoto, lang: Lang): string =>
  say(photo.caption, lang);
