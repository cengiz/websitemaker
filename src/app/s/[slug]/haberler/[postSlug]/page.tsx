import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) return {};
  const post = await prisma.newsPost.findFirst({
    where: { siteId: site.id, slug: postSlug, published: true },
    select: { title: true, excerpt: true, coverImageUrl: true },
  });
  if (!post) return {};
  const image = post.coverImageUrl
    ? post.coverImageUrl.startsWith("http") ? post.coverImageUrl : `${APP_URL}${post.coverImageUrl}`
    : undefined;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined, images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", images: image ? [image] : undefined },
  };
}

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
        <div
          className="prose prose-sm mt-4 max-w-none text-[var(--site-fg)]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      )}
    </div>
  );
}
