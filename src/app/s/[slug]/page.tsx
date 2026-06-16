import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) return {};
  return { title: site.name };
}

export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const [products, news] = await Promise.all([
    prisma.product.findMany({
      where: { siteId: site.id, published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.newsPost.findMany({
      where: { siteId: site.id, published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const base = `/s/${site.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="flex flex-col items-start gap-4 py-12 text-center sm:text-left">
        {site.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.logoUrl}
            alt={site.name}
            className="h-20 w-20 rounded object-contain"
          />
        ) : null}
        <h1 className="text-3xl font-bold sm:text-4xl">{site.name}</h1>
        {site.tagline && (
          <p className="text-lg text-[var(--site-muted)]">{site.tagline}</p>
        )}
        {site.intro && (
          <p className="max-w-2xl whitespace-pre-line text-[var(--site-fg)]">
            {site.intro}
          </p>
        )}
      </section>

      {products.length > 0 && (
        <section className="py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ürünler</h2>
            <Link href={`${base}/urunler`} className="text-sm font-medium underline-offset-2 hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`${base}/urunler/${product.slug}`}
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
                {product.price != null && (
                  <p className="text-sm text-[var(--site-muted)]">
                    {product.price.toLocaleString("tr-TR")} TL
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Haberler</h2>
            <Link href={`${base}/haberler`} className="text-sm font-medium underline-offset-2 hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {news.map((post) => (
              <Link
                key={post.id}
                href={`${base}/haberler/${post.slug}`}
                className="rounded-lg border border-[var(--site-border)] bg-[var(--site-card)] p-4 transition hover:opacity-90"
              >
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="mb-3 h-32 w-full rounded object-cover"
                  />
                ) : null}
                <h3 className="font-medium">{post.title}</h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm text-[var(--site-muted)] line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
