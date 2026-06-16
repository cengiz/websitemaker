import { cache } from "react";
import { prisma } from "@/lib/db";

export const getPublicSiteBySlug = cache(async (slug: string) => {
  return prisma.site.findFirst({
    where: { slug, published: true },
  });
});

export function parseSocials(socialsJson: string | null | undefined) {
  if (!socialsJson) return {} as Record<string, string>;
  try {
    return JSON.parse(socialsJson) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}
