"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import { uniquePageSlug } from "@/lib/uniqueSlug";
import { parseMenu } from "@/lib/menu";
import type { MenuItem } from "@/lib/menu";

const ALLOWED_HTML = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "blockquote", "pre", "code", "hr",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "sub", "sup", "mark",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt", "width", "height"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    p: ["style"],
    h1: ["style"], h2: ["style"], h3: ["style"], h4: ["style"],
    li: ["data-checked", "data-type"],
    ul: ["data-type"],
  },
  allowedStyles: {
    "*": { "text-align": [/.*/], "color": [/.*/], "background-color": [/.*/] },
  },
};

const schema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli."),
  slug: z.string().optional().default(""),
  body: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  images: z.string().optional().default("[]"),
  seoDescription: z.string().optional().default(""),
  published: z.string().optional(),
});

export async function createPage(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/pages`;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${listUrl}/new?error=invalid`);

  const slugBase = parsed.data.slug.trim() || parsed.data.title;
  const slug = await uniquePageSlug(site.id, slugBase);
  const published = parsed.data.published === "on";
  const body = parsed.data.body ? sanitizeHtml(parsed.data.body, ALLOWED_HTML) : null;

  const page = await prisma.sitePage.create({
    data: {
      siteId: site.id,
      title: parsed.data.title,
      slug,
      body: body || null,
      imageUrl: parsed.data.imageUrl || null,
      images: parsed.data.images !== "[]" ? parsed.data.images : null,
      seoDescription: parsed.data.seoDescription || null,
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

  const slugBase = parsed.data.slug.trim() || parsed.data.title;
  const slug = await uniquePageSlug(site.id, slugBase, page.id);

  const published = parsed.data.published === "on";
  const body = parsed.data.body ? sanitizeHtml(parsed.data.body, ALLOWED_HTML) : null;

  await prisma.sitePage.update({
    where: { id: page.id },
    data: {
      title: parsed.data.title,
      slug,
      body: body || null,
      imageUrl: parsed.data.imageUrl || null,
      images: parsed.data.images !== "[]" ? parsed.data.images : null,
      seoDescription: parsed.data.seoDescription || null,
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

export async function updatePageOrder(siteId: string, orderedIds: string[]) {
  const { site } = await requireSiteOwner(siteId);
  await Promise.all(
    orderedIds.map((id, idx) =>
      prisma.sitePage.updateMany({ where: { id, siteId: site.id }, data: { sortOrder: idx } })
    )
  );
  revalidatePath(`/dashboard/${site.id}/pages`);
  revalidatePath(`/s/${site.slug}`);
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
