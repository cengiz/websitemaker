import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

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

      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.title}
          className="mt-4 h-64 w-full rounded-lg object-cover"
        />
      ) : null}

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
