import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { resolveThemeVars, themeVarsToStyle } from "@/lib/themes";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const vars = resolveThemeVars(site.themeKey, site.themeConfig);

  return (
    <div
      style={{ ...themeVarsToStyle(vars), fontFamily: vars["--site-font"] }}
      className="flex min-h-screen flex-col bg-[var(--site-bg)] text-[var(--site-fg)]"
    >
      <SiteHeader site={site} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </div>
  );
}
