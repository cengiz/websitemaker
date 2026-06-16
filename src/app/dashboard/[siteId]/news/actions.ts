"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import { uniqueNewsSlug } from "@/lib/uniqueSlug";

const schema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli."),
  slug: z.string().optional().default(""),
  excerpt: z.string().optional().default(""),
  body: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  published: z.string().optional(),
});

export async function createNewsPost(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/news`;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listUrl}/new?error=invalid`);
  }

  const slugBase = parsed.data.slug.trim() || parsed.data.title;
  const slug = await uniqueNewsSlug(site.id, slugBase);
  const published = parsed.data.published === "on";

  await prisma.newsPost.create({
    data: {
      siteId: site.id,
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body || null,
      coverImageUrl: parsed.data.coverImageUrl || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/haberler`);

  redirect(`${listUrl}?success=created`);
}

export async function updateNewsPost(siteId: string, postId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/news`;
  const editUrl = `${listUrl}/${postId}`;

  const post = await prisma.newsPost.findFirst({ where: { id: postId, siteId: site.id } });
  if (!post) redirect(`${listUrl}?error=not-found`);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${editUrl}?error=invalid`);
  }

  const slugBase = parsed.data.slug.trim() || parsed.data.title;
  const slug = await uniqueNewsSlug(site.id, slugBase, post.id);

  const published = parsed.data.published === "on";

  await prisma.newsPost.update({
    where: { id: post.id },
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body || null,
      coverImageUrl: parsed.data.coverImageUrl || null,
      published,
      publishedAt: published ? (post.publishedAt ?? new Date()) : post.publishedAt,
    },
  });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/haberler`);
  revalidatePath(`/s/${site.slug}/haberler/${post.slug}`);
  if (slug !== post.slug) revalidatePath(`/s/${site.slug}/haberler/${slug}`);

  redirect(`${listUrl}?success=updated`);
}

export async function deleteNewsPost(siteId: string, postId: string) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/news`;

  const post = await prisma.newsPost.findFirst({ where: { id: postId, siteId: site.id } });
  if (!post) redirect(`${listUrl}?error=not-found`);

  await prisma.newsPost.delete({ where: { id: post.id } });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  revalidatePath(`/s/${site.slug}/haberler`);

  redirect(`${listUrl}?success=deleted`);
}
