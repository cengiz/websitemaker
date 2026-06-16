"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { slugify } from "@/lib/slug";
import { DEFAULT_THEME_KEY, THEMES } from "@/lib/themes";

const socialsSchema = z.object({
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

const wizardSchema = z.object({
  name: z.string().trim().min(2, "Site adı en az 2 karakter olmalı."),
  slug: z.string().trim().min(2, "Slug en az 2 karakter olmalı."),
  logoUrl: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
  intro: z.string().optional().default(""),
  contactEmail: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  socials: socialsSchema,
  themeKey: z.string().default(DEFAULT_THEME_KEY),
});

export type WizardData = z.infer<typeof wizardSchema>;

export async function checkSlugAvailable(rawSlug: string): Promise<boolean> {
  const slug = slugify(rawSlug);
  if (!slug) return false;

  const existing = await prisma.site.findUnique({ where: { slug } });
  return !existing;
}

export async function createSite(
  data: WizardData
): Promise<{ error: string } | never> {
  const user = await requireUser();

  const parsed = wizardSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    return { error: "Geçerli bir slug girin." };
  }

  const existing = await prisma.site.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu site adresi (slug) zaten kullanılıyor." };
  }

  const themeKey = THEMES.some((t) => t.key === parsed.data.themeKey)
    ? parsed.data.themeKey
    : DEFAULT_THEME_KEY;

  const socials = parsed.data.socials;
  const hasSocials = Object.values(socials).some((v) => v);

  const site = await prisma.site.create({
    data: {
      userId: user.id,
      slug,
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl || null,
      tagline: parsed.data.tagline || null,
      intro: parsed.data.intro || null,
      themeKey,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      address: parsed.data.address || null,
      socials: hasSocials ? JSON.stringify(socials) : null,
      published: true,
    },
  });

  redirect(`/dashboard/${site.id}`);
}
