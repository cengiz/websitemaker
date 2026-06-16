import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { PageForm } from "../PageForm";
import { updatePage } from "../actions";

export default async function EditPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId, pageId } = await params;
  const { error } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const page = await prisma.sitePage.findFirst({ where: { id: pageId, siteId: site.id } });
  if (!page) notFound();

  const action = updatePage.bind(null, site.id, page.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Sayfayı Düzenle</h2>
        <Link href={`/dashboard/${site.id}/pages`} className="text-sm text-zinc-500 hover:underline">
          ← Listeye dön
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Lütfen bilgileri kontrol edin.
        </p>
      )}

      <PageForm siteId={site.id} siteSlug={site.slug} page={page} action={action} />
    </div>
  );
}
