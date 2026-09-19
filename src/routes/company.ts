/**
 * Company data from the CMS.
 *
 * NOTE: /api/senso/company-settings/1 currently returns seeder placeholder
 * data — phone "01234567", address "Recusandae Et dolor". Nothing on the site
 * reads name, phone or address from here for that reason; those live in
 * src/lib/site.ts. Only the cover image is used. Once the CMS record is filled
 * in properly, move the values back here.
 */

import { CACHE, getData } from "@/routes/cms";

export interface CompanySettings {
  name: string;
  phone: { key: string; value: string }[];
  address: { key: string; value: string }[];
  logo: string;
  cover: string;
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  return getData<CompanySettings>("/api/senso/company-settings/1", CACHE.RARE);
}

export interface CompanyAbout {
  carousel_heading: string;
  slug: string;
  description: string;
  brand: string;
  carousel_image: string;
}

export async function getCompanyAbout(): Promise<CompanyAbout[]> {
  return (await getData<CompanyAbout[]>("/api/senso/company-abouts/select", CACHE.RARE)) ?? [];
}

/** Kept for the About components, which import this name. */
export type getCompanyAboutInterface = { about: CompanyAbout[] };
