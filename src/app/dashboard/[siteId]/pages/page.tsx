import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { deletePage } from "./actions";
import { SortablePageList } from "@/components/dashboard/SortablePageList";

const SUCCESS_MESSAGES: Record<string, string> = {
  created: "Sayfa eklendi.",
  updated: "Sayfa güncellendi.",
  deleted: "Sayfa silindi.",
};

export default async function PagesListPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { siteId } = await params;
  const { success } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const pages = await prisma.sitePage.findMany({
    where: { siteId: site.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  async function handleDelete(id: string) {
    "use server";
    await deletePage(site.id, id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Sayfalar</h2>
        <Link
          href={`/dashboard/${site.id}/pages/new`}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Yeni sayfa
        </Link>
      </div>

      {success && SUCCESS_MESSAGES[success] && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {SUCCESS_MESSAGES[success]}
        </p>
      )}

      <SortablePageList
        siteId={site.id}
        initialPages={pages}
        deleteAction={handleDelete}
      />
    </div>
  );
}
