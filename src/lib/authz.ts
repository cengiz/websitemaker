import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

/**
 * Ensures the current user owns the given site. Returns the site if so,
 * otherwise redirects (no session) or 404s (site missing / not owned).
 */
export async function requireSiteOwner(siteId: string) {
  const user = await requireUser();

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.userId !== user.id) {
    notFound();
  }

  return { user, site };
}
