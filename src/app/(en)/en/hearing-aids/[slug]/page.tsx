import type { Metadata } from "next";
import ProductView from "@/components/views/ProductView";
import { getProduct, getProducts, getProductsOrFail } from "@/routes/product";
import { getDict } from "@/routes/dict";
import { getSite } from "@/routes/site";
import { formatTaka, altLanguages } from "@/lib/site";
import { fill } from "@/lib/i18n";

export const revalidate = 3600;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const products = await getProductsOrFail();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [res, d] = await Promise.all([getProduct(params.slug), getDict("en")]);
  const product = res?.data;
  if (!product) return { title: "Not found" };

  const display = product.name
    .replace(/\s*hearing aid price in bangladesh\s*$/i, "")
    .trim();

  return {
    title: `${display} — ${formatTaka(product.price)}`,
    description:
      product.description?.slice(0, 300) ||
      fill(d.seo.productDescription, {
        name: display,
        price: formatTaka(product.price),
      }),
    alternates: {
      canonical: `/en/hearing-aids/${params.slug}`,
      languages: altLanguages(
        `/hearing-aids/${params.slug}`,
        `/en/hearing-aids/${params.slug}`
      ),
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      title: display,
      description: product.description?.slice(0, 300),
      images: product.avatar ? [{ url: product.avatar }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  // The product page shows nearby devices, so it needs the catalogue as
  // well as the product. Both fetches are revalidated hourly and the list
  // is the same one every other page asks for, so this is one cache read.
  const [site, res, catalogue] = await Promise.all([
    getSite("en"),
    getProduct(params.slug),
    getProducts(),
  ]);
  const { clinic, d, details, copy } = site;
  return (
    <ProductView
      clinic={clinic}
      d={d}
      product={res?.data ?? null}
      catalogue={catalogue}
      lang="en"
      slug={params.slug}
      copy={copy}
      parts={details.parts}
    />
  );
}
