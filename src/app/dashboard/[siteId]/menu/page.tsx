import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { parseMenu, DEFAULT_MENU } from "@/lib/menu";
import { MenuEditor } from "./MenuEditor";
import { saveMenu } from "./actions";

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { siteId } = await params;
  const { success, error } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const allPages = await prisma.sitePage.findMany({
    where: { siteId: site.id, published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, slug: true },
  });

  const currentMenu = parseMenu(site.menuConfig);

  // Ensure all built-in items exist (in case menuConfig was saved before a new built-in was added)
  const menuKeys = new Set(currentMenu.map((i) => i.key));
  const merged = [
    ...currentMenu,
    ...DEFAULT_MENU.filter((d) => !menuKeys.has(d.key)),
  ];

  const action = saveMenu.bind(null, site.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">Menü Düzenle</h2>

      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Menü kaydedildi.</p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Bir hata oluştu.</p>
      )}

      <p className="text-sm text-zinc-500">
        Menü öğelerini etkinleştir/devre dışı bırak ve sırasını ayarla. Özel sayfalarını da menüye ekleyebilirsin.
      </p>

      <MenuEditor
        siteId={site.id}
        initialItems={merged}
        availablePages={allPages}
        action={action}
      />
    </div>
  );
}
