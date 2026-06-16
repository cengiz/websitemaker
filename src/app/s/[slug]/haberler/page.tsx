import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const site = await getPublicSiteBySlug((await params).slug);
  if (!site) return {};
  return { title: "Haberler" };
}

export default async function SiteNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const posts = await prisma.newsPost.findMany({
    where: { siteId: site.id, published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Haberler</h1>

      {posts.length === 0 ? (
        <p className="text-[var(--site-muted)]">Henüz haber eklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/s/${site.slug}/haberler/${post.slug}`}
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
              <p className="mt-2 text-xs text-[var(--site-muted)]">
                {(post.publishedAt ?? post.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
