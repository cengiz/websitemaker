import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { deletePage } from "./actions";

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

      {pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
          Henüz sayfa eklenmemiş.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{page.title}</p>
                <p className="text-sm text-zinc-500">/sayfa/{page.slug}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  page.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {page.published ? "Yayında" : "Taslak"}
              </span>
              <Link
                href={`/dashboard/${site.id}/pages/${page.id}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
              >
                Düzenle
              </Link>
              <form action={deletePage.bind(null, site.id, page.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
