import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

export default async function SiteNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug, postSlug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const post = await prisma.newsPost.findFirst({
    where: { siteId: site.id, slug: postSlug, published: true },
  });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href={`/s/${site.slug}/haberler`}
        className="text-sm text-[var(--site-muted)] underline-offset-2 hover:underline"
      >
        ← Tüm haberler
      </Link>

      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mt-4 h-64 w-full rounded-lg object-cover"
        />
      ) : null}

      <h1 className="mt-6 text-2xl font-bold">{post.title}</h1>
      <p className="mt-1 text-sm text-[var(--site-muted)]">
        {(post.publishedAt ?? post.createdAt).toLocaleDateString("tr-TR")}
      </p>
      {post.body && (
        <p className="mt-4 whitespace-pre-line text-[var(--site-fg)]">{post.body}</p>
      )}
    </div>
  );
}
