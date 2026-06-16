import { existsSync, statSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { getTheme } from "@/lib/themes";
import { exportDirFor } from "@/lib/staticExport";
import { exportStaticSite } from "./export/actions";

export default async function SiteOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { siteId } = await params;
  const { error, success } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const [productCount, newsCount] = await Promise.all([
    prisma.product.count({ where: { siteId: site.id } }),
    prisma.newsPost.count({ where: { siteId: site.id } }),
  ]);

  const theme = getTheme(site.themeKey);

  const exportIndex = path.join(exportDirFor(site.slug), "index.html");
  const exported = existsSync(exportIndex);
  const exportedAt = exported ? statSync(exportIndex).mtime : null;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "export-failed"
            ? "Statik dışa aktarım yapılamadı. Siteniz yayında olmalı."
            : "Bir hata oluştu."}
        </p>
      )}
      {success === "exported" && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Statik dosya seti oluşturuldu.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Ürünler" value={productCount} href={`/dashboard/${site.id}/products`} />
        <StatCard label="Haberler" value={newsCount} href={`/dashboard/${site.id}/news`} />
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Tema</p>
          <p className="mt-1 text-lg font-semibold">{theme.name}</p>
          <Link
            href={`/dashboard/${site.id}/theme`}
            className="mt-2 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
          >
            Değiştir
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-500">Durum</p>
        <p className="mt-1 font-medium">
          {site.published ? "Siteniz yayında." : "Siteniz taslak modunda, ziyaretçiler göremiyor."}
        </p>
        <Link
          href={`/dashboard/${site.id}/settings`}
          className="mt-2 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
        >
          Yayın ayarlarını düzenle
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-500">Statik dışa aktarım</p>
        {exported ? (
          <>
            <p className="mt-1 text-sm text-zinc-700">
              Son yayınlama: {exportedAt!.toLocaleString("tr-TR")}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <a
                href={`/exports/${site.slug}/index.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-900 underline-offset-2 hover:underline"
              >
                Statik sayfayı görüntüle ↗
              </a>
              <a
                href={`/api/export/${site.id}/download`}
                className="font-medium text-zinc-900 underline-offset-2 hover:underline"
              >
                Zip indir
              </a>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">Henüz dışa aktarılmadı.</p>
        )}

        {site.published ? (
          <form action={exportStaticSite.bind(null, site.id)} className="mt-3">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {exported ? "Yeniden Yayınla" : "Statik Olarak Yayınla"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-amber-600">
            Dışa aktarmak için önce siteyi yayınlamalısınız (Ayarlar).
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </Link>
  );
}
