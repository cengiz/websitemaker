import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function uniqueProductSlug(
  siteId: string,
  desired: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(desired) || "urun";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: { siteId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

export async function uniquePageSlug(
  siteId: string,
  desired: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(desired) || "sayfa";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.sitePage.findFirst({
      where: { siteId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

export async function uniqueNewsSlug(
  siteId: string,
  desired: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(desired) || "haber";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.newsPost.findFirst({
      where: { siteId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}
