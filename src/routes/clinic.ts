/**
 * The clinic's own details, from the CMS, over the top of what the code knows.
 *
 * Every fact about the business — the phones, the address, the opening hours,
 * what the warranty covers — was compiled into src/lib/site.ts, with a note at
 * the top explaining why: the CMS held seeder placeholders ("Recusandae Et
 * dolor", phone "01234567") and could not be trusted for them. The Company
 * Profile screen has real values in it now, so that reason is gone, and the
 * thing it caused — changing a phone number needs a developer and a deploy —
 * goes with it.
 *
 * Two rules make this safe to depend on:
 *
 *   The site never breaks because the CMS is down or a field is blank. SITE is
 *   the floor. A field arrives from the API only if it has something in it; a
 *   build with no API at all produces exactly the site we have today.
 *
 *   Nothing here decides anything. It merges and returns; every judgement about
 *   what to show stays in the component, where it can be read.
 */
import { SITE } from "@/lib/site";
import { CACHE, getData, pick, type Pair } from "@/routes/cms";

interface CompanyApi {
  name?: Pair;
  address?: {
    line?: Pair;
    city?: Pair;
    postcode?: string | null;
    country?: string | null;
    landmark?: Pair;
    floor_note?: Pair;
    maps_url?: string | null;
    geo?: { lat: number; lng: number } | null;
  };
  phones?: { number: string | null; display: string | null }[];
  whatsapp?: string | null;
  whatsapp_alt?: string | null;
  email?: string | null;
  social?: { facebook?: string; youtube?: string; instagram?: string };
  hours?: Record<string, [number, number] | null> | null;
  promises?: Record<string, number | null>;
  established_year?: number | null;
  dealer?: {
    status?: string | null;
    entity?: string | null;
    brand?: string | null;
    proof_url?: string | null;
  };
  service?: {
    brands?: string[];
    in_house_days?: number | null;
    overseas_weeks?: string | null;
  };
  warranty_excluded?: Pair;
  hospitals?: string[];
  outside_dhaka?: Record<string, number | string | null>;
}


/**
 * SITE is declared `as const`, so its type is the exact values it was written
 * with — `hospitals` is not string[], it is the tuple ["CMH", "BMU", …], and
 * `postcode` is the literal "1215". Useful for catching a typo in the file
 * itself; useless as the type of a record that came out of a database.
 *
 * This widens the literals back to their primitives and drops the readonly, so
 * the merged record has the same SHAPE as SITE without claiming to have the
 * same contents.
 */
type Widen<T> = T extends readonly (infer U)[]
  ? Widen<U>[]
  : T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T extends object
          ? { -readonly [K in keyof T]: Widen<T[K]> }
          : T;

export type Clinic = Widen<typeof SITE>;


/**
 * A mutable copy of the constant, once per call. SITE's arrays are readonly —
 * a consequence of `as const` — and spreading them straight into the merged
 * record is a type error at every one of them.
 *
 * A JSON round trip because SITE is nothing but data: no dates, no functions,
 * nothing a structured clone would preserve and this would not.
 */
const baseClinic = (): Clinic => JSON.parse(JSON.stringify(SITE)) as Clinic;

export async function getClinic(): Promise<Clinic> {
  const base = baseClinic();
  const c = await getData<CompanyApi>("/api/senso/company", CACHE.EDITED);
  if (!c) return base;

  const phones = (c.phones ?? []).filter((p) => p.number);
  const numbers = phones.map((p) => p.number as string);

  return {
    ...base,
    name: pick(c.name?.en, SITE.name),
    nameBn: pick(c.name?.bn, SITE.nameBn),

    address: {
      ...base.address,
      line: pick(c.address?.line?.en, SITE.address.line),
      lineBn: pick(c.address?.line?.bn, SITE.address.lineBn),
      city: pick(c.address?.city?.en, SITE.address.city),
      cityBn: pick(c.address?.city?.bn, SITE.address.cityBn),
      postcode: pick(c.address?.postcode, SITE.address.postcode),
      country: pick(c.address?.country, SITE.address.country),
      landmark: pick(c.address?.landmark?.en, SITE.address.landmark),
      landmarkBn: pick(c.address?.landmark?.bn, SITE.address.landmarkBn),
      floorNote: pick(c.address?.floor_note?.en, SITE.address.floorNote),
      floorNoteBn: pick(c.address?.floor_note?.bn, SITE.address.floorNoteBn),
      mapsUrl: pick(c.address?.maps_url, SITE.address.mapsUrl),
      geo: c.address?.geo
        ? { lat: c.address.geo.lat, lng: c.address.geo.lng }
        : SITE.address.geo,
    },

    // The first number is the one the call button dials, so an empty list has
    // to fall through rather than produce a tel: link to nothing.
    phones: numbers.length ? numbers : base.phones,
    phoneDisplay: pick(phones[0]?.display, SITE.phoneDisplay),
    phoneDisplay2: pick(phones[1]?.display, SITE.phoneDisplay2),
    whatsapp: pick(c.whatsapp, SITE.whatsapp),
    whatsappAlt: pick(c.whatsapp_alt, SITE.whatsappAlt),
    email: pick(c.email, SITE.email),

    social: {
      facebook: pick(c.social?.facebook, SITE.social.facebook),
      youtube: pick(c.social?.youtube, SITE.social.youtube),
    },

    hours: pick(c.hours, base.hours) as Clinic["hours"],

    dealer: {
      ...base.dealer,
      entity: pick(c.dealer?.entity, SITE.dealer.entity),
      brand: pick(c.dealer?.brand, SITE.dealer.brand),
      proofUrl: pick(c.dealer?.proof_url, SITE.dealer.proofUrl),
    },

    foundedYear: pick(c.established_year, SITE.foundedYear),

    testPackage: {
      fee: pick(c.promises?.assessment_fee, SITE.testPackage.fee),
      minutes: pick(c.promises?.assessment_minutes, SITE.testPackage.minutes),
    },

    warranty: {
      ...base.warranty,
      years: pick(c.promises?.warranty_years, SITE.warranty.years),
      accessoryYears: pick(c.promises?.warranty_accessory_years, SITE.warranty.accessoryYears),
      followUpMonths: pick(c.promises?.follow_up_months, SITE.warranty.followUpMonths),
      replacementDiscount: pick(c.promises?.replacement_discount, SITE.warranty.replacementDiscount),
      excluded: pick(c.warranty_excluded?.en, SITE.warranty.excluded),
      excludedBn: pick(c.warranty_excluded?.bn, SITE.warranty.excludedBn),
    },

    service: {
      ...base.service,
      inHouseDays: pick(c.service?.in_house_days, SITE.service.inHouseDays),
      overseasWeeks: pick(c.service?.overseas_weeks, SITE.service.overseasWeeks),
    },

    hospitals: pick(c.hospitals, base.hospitals),
  };
}

/** The two link helpers, against whichever clinic record the page is holding. */
export const telFor = (clinic: Clinic, phone?: string) => `tel:${phone ?? clinic.phones[0]}`;

export const whatsappFor = (clinic: Clinic, message: string) =>
  `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(message)}`;
