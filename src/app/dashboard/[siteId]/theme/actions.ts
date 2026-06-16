"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import { THEMES, DEFAULT_THEME_KEY, getTheme } from "@/lib/themes";

export async function updateSiteTheme(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);

  const themeUrl = `/dashboard/${site.id}/theme`;

  const themeKeyRaw = formData.get("themeKey");
  const themeKey = THEMES.some((t) => t.key === themeKeyRaw) ? String(themeKeyRaw) : DEFAULT_THEME_KEY;

  const primaryColor = String(formData.get("primaryColor") ?? "");
  const base = getTheme(themeKey).vars;

  let themeConfig: string | null = null;
  if (primaryColor && primaryColor.toLowerCase() !== base["--site-primary"].toLowerCase()) {
    themeConfig = JSON.stringify({ "--site-primary": primaryColor });
  }

  await prisma.site.update({
    where: { id: site.id },
    data: { themeKey, themeConfig },
  });

  revalidatePath(`/dashboard/${site.id}`);
  revalidatePath(themeUrl);
  revalidatePath(`/s/${site.slug}`, "layout");

  redirect(`${themeUrl}?success=1`);
}
