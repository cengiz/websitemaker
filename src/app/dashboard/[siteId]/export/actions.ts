"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSiteOwner } from "@/lib/authz";
import { generateStaticExport, ExportError } from "@/lib/staticExport";

export async function exportStaticSite(siteId: string) {
  const { site } = await requireSiteOwner(siteId);

  try {
    await generateStaticExport(site.id);
  } catch (error) {
    if (error instanceof ExportError) {
      redirect(`/dashboard/${siteId}?error=export-failed`);
    }
    throw error;
  }

  revalidatePath(`/dashboard/${siteId}`);
  redirect(`/dashboard/${siteId}?success=exported`);
}
