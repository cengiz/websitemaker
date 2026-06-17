"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";

const schema = z.object({
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  linkUrl: z.string().optional().default(""),
  linkLabel: z.string().optional().default(""),
  published: z.string().optional(),
});

export async function createSlide(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/slides`;
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${listUrl}/new?error=invalid`);

  await prisma.slide.create({
    data: {
      siteId: site.id,
      title: parsed.data.title || null,
      subtitle: parsed.data.subtitle || null,
      imageUrl: parsed.data.imageUrl || null,
      linkUrl: parsed.data.linkUrl || null,
      linkLabel: parsed.data.linkLabel || null,
      published: parsed.data.published === "on",
    },
  });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  redirect(`${listUrl}?success=created`);
}

export async function updateSlide(siteId: string, slideId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/slides`;
  const slide = await prisma.slide.findFirst({ where: { id: slideId, siteId: site.id } });
  if (!slide) redirect(`${listUrl}?error=not-found`);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${listUrl}/${slideId}?error=invalid`);

  await prisma.slide.update({
    where: { id: slide.id },
    data: {
      title: parsed.data.title || null,
      subtitle: parsed.data.subtitle || null,
      imageUrl: parsed.data.imageUrl || null,
      linkUrl: parsed.data.linkUrl || null,
      linkLabel: parsed.data.linkLabel || null,
      published: parsed.data.published === "on",
    },
  });

  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  redirect(`${listUrl}?success=updated`);
}

export async function deleteSlide(siteId: string, slideId: string) {
  const { site } = await requireSiteOwner(siteId);
  const listUrl = `/dashboard/${site.id}/slides`;
  await prisma.slide.deleteMany({ where: { id: slideId, siteId: site.id } });
  revalidatePath(listUrl);
  revalidatePath(`/s/${site.slug}`);
  redirect(`${listUrl}?success=deleted`);
}

export async function updateSlideOrder(siteId: string, orderedIds: string[]) {
  const { site } = await requireSiteOwner(siteId);
  await Promise.all(
    orderedIds.map((id, idx) =>
      prisma.slide.updateMany({ where: { id, siteId: site.id }, data: { sortOrder: idx } })
    )
  );
  revalidatePath(`/dashboard/${site.id}/slides`);
  revalidatePath(`/s/${site.slug}`);
}

export async function updateSliderType(siteId: string, sliderType: string) {
  const { site } = await requireSiteOwner(siteId);
  await prisma.site.update({ where: { id: site.id }, data: { sliderType } });
  revalidatePath(`/dashboard/${site.id}/slides`);
  revalidatePath(`/s/${site.slug}`);
}
