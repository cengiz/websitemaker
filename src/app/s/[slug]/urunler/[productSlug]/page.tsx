import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";
import { ProductGallery } from "@/components/site/ProductGallery";

const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) return {};
  const product = await prisma.product.findFirst({
    where: { siteId: site.id, slug: productSlug, published: true },
    select: { title: true, description: true, imageUrl: true },
  });
  if (!product) return {};
  const image = product.imageUrl
    ? product.imageUrl.startsWith("http") ? product.imageUrl : `${APP_URL}${product.imageUrl}`
    : undefined;
  return {
    title: product.title,
    description: product.description ?? undefined,
    openGraph: { title: product.title, description: product.description ?? undefined, images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", images: image ? [image] : undefined },
  };
}

export default async function SiteProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const product = await prisma.product.findFirst({
    where: { siteId: site.id, slug: productSlug, published: true },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href={`/s/${site.slug}/urunler`}
        className="text-sm text-[var(--site-muted)] underline-offset-2 hover:underline"
      >
        ← Tüm ürünler
      </Link>

      {(() => {
        let gallery: string[] = [];
        try { gallery = product.images ? JSON.parse(product.images) : []; } catch { gallery = []; }
        const allImages = [
          ...(product.imageUrl ? [product.imageUrl] : []),
          ...gallery,
        ];
        return allImages.length > 0 ? (
          <ProductGallery images={allImages} title={product.title} />
        ) : null;
      })()}

      <h1 className="mt-6 text-2xl font-bold">{product.title}</h1>
      {product.category && (
        <p className="mt-1 text-sm text-[var(--site-muted)]">{product.category}</p>
      )}
      {product.price != null && (
        <p className="mt-2 text-lg font-medium">
          {product.price.toLocaleString("tr-TR")} TL
        </p>
      )}
      {product.description && (
        <p className="mt-4 whitespace-pre-line text-[var(--site-fg)]">
          {product.description}
        </p>
      )}
    </div>
  );
}
