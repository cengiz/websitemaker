import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const site = await getPublicSiteBySlug((await params).slug);
  if (!site) return {};
  return { title: "Ürünler" };
}

export default async function SiteProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { slug } = await params;
  const { kategori } = await searchParams;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const allProducts = await prisma.product.findMany({
    where: { siteId: site.id, published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const categories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean) as string[])
  );

  const products = kategori
    ? allProducts.filter((p) => p.category === kategori)
    : allProducts;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Ürünler</h1>

      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={`/s/${site.slug}/urunler`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !kategori
                ? "bg-[var(--site-primary)] text-white"
                : "border border-[var(--site-border)] hover:bg-[var(--site-card)]"
            }`}
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/s/${site.slug}/urunler?kategori=${encodeURIComponent(cat)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                kategori === cat
                  ? "bg-[var(--site-primary)] text-white"
                  : "border border-[var(--site-border)] hover:bg-[var(--site-card)]"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-[var(--site-muted)]">Bu kategoride ürün yok.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/s/${site.slug}/urunler/${product.slug}`}
              className="site-card p-4"
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="mb-3 h-32 w-full rounded object-cover"
                />
              ) : null}
              <h3 className="font-medium">{product.title}</h3>
              {product.category && (
                <p className="text-xs text-[var(--site-muted)]">{product.category}</p>
              )}
              {product.price != null && (
                <p className="mt-1 text-sm text-[var(--site-muted)]">
                  {product.price.toLocaleString("tr-TR")} TL
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
