"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import { uniqueProductSlug } from "@/lib/uniqueSlug";

const schema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli."),
  slug: z.string().optional().default(""),
  description: z.string().optional().default(""),
  price: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  category: z.string().optional().default(""),
  published: z.string().optional(),
});

function parsePrice(value: string): number | null {
  if (!value.trim()) return null;
  const normalized = value.replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export async function createProduct(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/products`;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listUrl}/new?error=invalid`);
  }

  const slugBase = parsed.data.slug.trim() || parsed.data.title;
  const slug = await uniqueProductSlug(site.id, slugBase);

  await prisma.product.create({
    data: {
      siteId: site.id,
      title: parsed.data.title,
      slug,
      description: parsed.data.description || null,
      price: parsePrice(parsed.data.price),
      imageUrl: parsed.data.imageUrl || null,
      category: parsed.data.category || null,
      published: parsed.data.published === "on",
    },
  });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/urunler`);

  redirect(`${listUrl}?success=created`);
}

export async function updateProduct(siteId: string, productId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/products`;
  const editUrl = `${listUrl}/${productId}`;

  const product = await prisma.product.findFirst({ where: { id: productId, siteId: site.id } });
  if (!product) redirect(`${listUrl}?error=not-found`);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${editUrl}?error=invalid`);
  }

  const slugBase = parsed.data.slug.trim() || parsed.data.title;
  const slug = await uniqueProductSlug(site.id, slugBase, product.id);

  await prisma.product.update({
    where: { id: product.id },
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description || null,
      price: parsePrice(parsed.data.price),
      imageUrl: parsed.data.imageUrl || null,
      category: parsed.data.category || null,
      published: parsed.data.published === "on",
    },
  });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/urunler`);
  revalidatePath(`/s/${site.slug}/urunler/${product.slug}`);
  if (slug !== product.slug) revalidatePath(`/s/${site.slug}/urunler/${slug}`);

  redirect(`${listUrl}?success=updated`);
}

export async function deleteProduct(siteId: string, productId: string) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/products`;

  const product = await prisma.product.findFirst({ where: { id: productId, siteId: site.id } });
  if (!product) redirect(`${listUrl}?error=not-found`);

  await prisma.product.delete({ where: { id: product.id } });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/urunler`);

  redirect(`${listUrl}?success=deleted`);
}
