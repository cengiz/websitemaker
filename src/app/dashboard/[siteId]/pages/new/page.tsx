import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { PageForm } from "../PageForm";
import { createPage } from "../actions";

export default async function NewPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId } = await params;
  const { error } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const action = createPage.bind(null, site.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Yeni Sayfa</h2>
        <Link href={`/dashboard/${site.id}/pages`} className="text-sm text-zinc-500 hover:underline">
          ← Listeye dön
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Lütfen bilgileri kontrol edin.
        </p>
      )}

      <PageForm siteId={site.id} action={action} />
    </div>
  );
}
