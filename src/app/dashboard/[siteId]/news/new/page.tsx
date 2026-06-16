import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { NewsForm } from "../NewsForm";
import { createNewsPost } from "../actions";

export default async function NewNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId } = await params;
  const { error } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const action = createNewsPost.bind(null, site.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Yeni Haber</h2>
        <Link href={`/dashboard/${site.id}/news`} className="text-sm text-zinc-500 hover:underline">
          ← Listeye dön
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Lütfen bilgileri kontrol edin.</p>
      )}

      <NewsForm siteId={site.id} action={action} />
    </div>
  );
}
