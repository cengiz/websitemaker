import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

export default async function SiteProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const products = await prisma.product.findMany({
    where: { siteId: site.id, published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Ürünler</h1>

      {products.length === 0 ? (
        <p className="text-[var(--site-muted)]">Henüz ürün eklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/s/${site.slug}/urunler/${product.slug}`}
              className="rounded-lg border border-[var(--site-border)] bg-[var(--site-card)] p-4 transition hover:opacity-90"
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
