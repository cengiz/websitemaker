import { existsSync } from "node:fs";
import { Readable } from "node:stream";
import { ZipArchive } from "archiver";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { exportDirFor } from "@/lib/staticExport";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const { siteId } = await params;
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.userId !== session.user.id) {
    return NextResponse.json({ error: "Site bulunamadı." }, { status: 404 });
  }

  const dir = exportDirFor(site.slug);
  if (!existsSync(dir)) {
    return NextResponse.json({ error: "Önce statik dışa aktarım yapmalısınız." }, { status: 404 });
  }

  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.directory(dir, false);
  void archive.finalize();

  return new NextResponse(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${site.slug}.zip"`,
    },
  });
}
