"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import { uniquePageSlug } from "@/lib/uniqueSlug";
import { parseMenu } from "@/lib/menu";
import type { MenuItem } from "@/lib/menu";

const schema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli."),
  body: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  published: z.string().optional(),
});

export async function createPage(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/pages`;

  console.log("[createPage] formData keys:", [...formData.keys()]);
  console.log("[createPage] imageUrl:", formData.get("imageUrl"));
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${listUrl}/new?error=invalid`);

  const slug = await uniquePageSlug(site.id, parsed.data.title);
  const published = parsed.data.published === "on";

  const page = await prisma.sitePage.create({
    data: {
      siteId: site.id,
      title: parsed.data.title,
      slug,
      body: parsed.data.body || null,
      imageUrl: parsed.data.imageUrl || null,
      published,
    },
  });

  if (published) {
    const currentMenu = parseMenu(site.menuConfig);
    const already = currentMenu.some((i) => i.key === `page:${page.id}`);
    if (!already) {
      const newItem: MenuItem = {
        key: `page:${page.id}`,
        label: page.title,
        path: `sayfa/${page.slug}`,
        enabled: true,
      };
      await prisma.site.update({
        where: { id: site.id },
        data: { menuConfig: JSON.stringify([...currentMenu, newItem]) },
      });
    }
  }

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);

  redirect(`${listUrl}?success=created`);
}

export async function updatePage(siteId: string, pageId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/pages`;
  const editUrl = `${listUrl}/${pageId}`;

  const page = await prisma.sitePage.findFirst({ where: { id: pageId, siteId: site.id } });
  if (!page) redirect(`${listUrl}?error=not-found`);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${editUrl}?error=invalid`);

  const slug =
    parsed.data.title.trim() === page.title
      ? page.slug
      : await uniquePageSlug(site.id, parsed.data.title, page.id);

  const published = parsed.data.published === "on";

  await prisma.sitePage.update({
    where: { id: page.id },
    data: {
      title: parsed.data.title,
      slug,
      body: parsed.data.body || null,
      imageUrl: parsed.data.imageUrl || null,
      published,
    },
  });

  // Keep menu label/path in sync if slug or title changed
  const currentMenu = parseMenu(site.menuConfig);
  const menuIdx = currentMenu.findIndex((i) => i.key === `page:${page.id}`);
  if (menuIdx !== -1) {
    currentMenu[menuIdx] = {
      ...currentMenu[menuIdx],
      label: parsed.data.title,
      path: `sayfa/${slug}`,
    };
    await prisma.site.update({
      where: { id: site.id },
      data: { menuConfig: JSON.stringify(currentMenu) },
    });
  } else if (published) {
    const newItem: MenuItem = {
      key: `page:${page.id}`,
      label: parsed.data.title,
      path: `sayfa/${slug}`,
      enabled: true,
    };
    await prisma.site.update({
      where: { id: site.id },
      data: { menuConfig: JSON.stringify([...currentMenu, newItem]) },
    });
  }

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/sayfa/${page.slug}`);
  if (slug !== page.slug) revalidatePath(`/s/${site.slug}/sayfa/${slug}`);

  redirect(`${listUrl}?success=updated`);
}

export async function deletePage(siteId: string, pageId: string) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/pages`;

  const page = await prisma.sitePage.findFirst({ where: { id: pageId, siteId: site.id } });
  if (!page) redirect(`${listUrl}?error=not-found`);

  await prisma.sitePage.delete({ where: { id: page.id } });

  const currentMenu = parseMenu(site.menuConfig);
  const filtered = currentMenu.filter((i) => i.key !== `page:${page.id}`);
  if (filtered.length !== currentMenu.length) {
    await prisma.site.update({
      where: { id: site.id },
      data: { menuConfig: JSON.stringify(filtered) },
    });
  }

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);

  redirect(`${listUrl}?success=deleted`);
}
