import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";

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
        <div className="mt-6 whitespace-pre-line text-[var(--site-fg)]">{page.body}</div>
      )}
    </div>
  );
}
