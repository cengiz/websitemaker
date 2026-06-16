import { requireSiteOwner } from "@/lib/authz";
import { updateSiteTheme } from "./actions";
import { ThemeForm } from "./ThemeForm";

export default async function SiteThemePage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { siteId } = await params;
  const { success } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const action = updateSiteTheme.bind(null, site.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">Tema</h2>

      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Tema güncellendi.</p>
      )}

      <ThemeForm initialThemeKey={site.themeKey} initialThemeConfig={site.themeConfig} action={action} />
    </div>
  );
}
