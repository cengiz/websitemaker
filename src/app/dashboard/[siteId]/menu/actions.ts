"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import type { MenuItem } from "@/lib/menu";

export async function saveMenu(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const menuUrl = `/dashboard/${site.id}/menu`;

  const raw = formData.get("menu");
  if (typeof raw !== "string") redirect(`${menuUrl}?error=invalid`);

  let items: MenuItem[];
  try {
    items = JSON.parse(raw) as MenuItem[];
  } catch {
    redirect(`${menuUrl}?error=invalid`);
  }

  await prisma.site.update({
    where: { id: site.id },
    data: { menuConfig: JSON.stringify(items) },
  });

  revalidatePath(`/s/${site.slug}`);
  revalidatePath(menuUrl);

  redirect(`${menuUrl}?success=1`);
}
