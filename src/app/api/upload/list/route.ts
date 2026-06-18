import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "siteId gerekli." }, { status: 400 });
  }

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.userId !== session.user.id) {
    return NextResponse.json({ error: "Site bulunamadı." }, { status: 404 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", site.id);
  let files: string[] = [];
  try {
    const entries = await readdir(dir);
    files = entries
      .filter((f) => /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(f))
      .map((f) => `/uploads/${site.id}/${f}`);
  } catch {
    // directory doesn't exist yet — return empty list
  }

  return NextResponse.json({ urls: files.reverse() });
}
