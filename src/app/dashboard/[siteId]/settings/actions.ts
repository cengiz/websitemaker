"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";
import { slugify } from "@/lib/slug";
import { removeStaticExport } from "@/lib/staticExport";

const schema = z.object({
  name: z.string().trim().min(2, "Site adı en az 2 karakter olmalı."),
  slug: z.string().trim().min(2, "Adres en az 2 karakter olmalı."),
  logoUrl: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
  intro: z.string().optional().default(""),
  contactEmail: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  website: z.string().optional().default(""),
  published: z.string().optional(),
});

export async function updateSiteSettings(siteId: string, formData: FormData) {
  const { site } = await requireSiteOwner(siteId);

  const settingsUrl = `/dashboard/${site.id}/settings`;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${settingsUrl}?error=invalid`);
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    redirect(`${settingsUrl}?error=invalid`);
  }

  if (slug !== site.slug) {
    const existing = await prisma.site.findUnique({ where: { slug } });
    if (existing) {
      redirect(`${settingsUrl}?error=slug-taken`);
    }
  }

  const socials = {
    instagram: parsed.data.instagram,
    facebook: parsed.data.facebook,
    twitter: parsed.data.twitter,
    website: parsed.data.website,
  };
  const hasSocials = Object.values(socials).some((v) => v);

  await prisma.site.update({
    where: { id: site.id },
    data: {
      name: parsed.data.name,
      slug,
      logoUrl: parsed.data.logoUrl || null,
      tagline: parsed.data.tagline || null,
      intro: parsed.data.intro || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      address: parsed.data.address || null,
      socials: hasSocials ? JSON.stringify(socials) : null,
      published: parsed.data.published === "on",
    },
  });

  // Remove stale static exports so they don't keep serving outdated/unpublished content.
  if (slug !== site.slug) {
    await removeStaticExport(site.slug);
  }
  if (parsed.data.published !== "on") {
    await removeStaticExport(slug);
  }

  revalidatePath(`/dashboard/${site.id}`);
  revalidatePath(settingsUrl);
  revalidatePath(`/s/${site.slug}`);
  if (slug !== site.slug) revalidatePath(`/s/${slug}`);

  redirect(`${settingsUrl}?success=1`);
}
