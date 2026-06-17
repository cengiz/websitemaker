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
  params: Promise<{ slug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) return {};
  const page = await prisma.sitePage.findFirst({
    where: { siteId: site.id, slug: pageSlug, published: true },
    select: { title: true, seoDescription: true, imageUrl: true },
  });
  if (!page) return {};
  const image = page.imageUrl
    ? page.imageUrl.startsWith("http") ? page.imageUrl : `${APP_URL}${page.imageUrl}`
    : undefined;
  return {
    title: page.title,
    description: page.seoDescription ?? undefined,
    openGraph: { title: page.title, description: page.seoDescription ?? undefined, images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", images: image ? [image] : undefined },
  };
}

export default async function SiteCustomPage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug, pageSlug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const page = await prisma.sitePage.findFirst({
    where: { siteId: site.id, slug: pageSlug, published: true },
  });
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href={`/s/${site.slug}`}
        className="text-sm text-[var(--site-muted)] underline-offset-2 hover:underline"
      >
        ← Anasayfa
      </Link>

      <h1 className="mt-6 text-2xl font-bold">{page.title}</h1>

      {page.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.imageUrl}
          alt={page.title}
          className="mt-6 w-full rounded-xl object-cover"
        />
      )}

      {page.body && (
        <div
          className="prose prose-sm mt-6 max-w-none text-[var(--site-fg)]"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      )}

      {page.images && (
        <div className="mt-8">
          <ProductGallery
            images={[
              ...(page.imageUrl ? [page.imageUrl] : []),
              ...JSON.parse(page.images),
            ]}
            title={page.title}
          />
        </div>
      )}
    </div>
  );
}
