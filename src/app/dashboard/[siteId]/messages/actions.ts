"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSiteOwner } from "@/lib/authz";

export async function markRead(siteId: string, messageId: string) {
  const { site } = await requireSiteOwner(siteId);
  await prisma.contactMessage.updateMany({
    where: { id: messageId, siteId: site.id },
    data: { read: true },
  });
  revalidatePath(`/dashboard/${site.id}/messages`);
}
