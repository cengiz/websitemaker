import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { NewsForm } from "../NewsForm";
import { updateNewsPost } from "../actions";

export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string; postId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId, postId } = await params;
  const { error } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const post = await prisma.newsPost.findFirst({ where: { id: postId, siteId: site.id } });
  if (!post) notFound();

  const action = updateNewsPost.bind(null, site.id, post.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Haberi Düzenle</h2>
        <Link href={`/dashboard/${site.id}/news`} className="text-sm text-zinc-500 hover:underline">
          ← Listeye dön
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Lütfen bilgileri kontrol edin.</p>
      )}

      <NewsForm siteId={site.id} post={post} action={action} />
    </div>
  );
}
