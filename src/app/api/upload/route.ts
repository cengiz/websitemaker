import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUploadedImage, UploadError } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const siteId = formData.get("siteId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  let folder = `u-${session.user.id}`;
  if (typeof siteId === "string" && siteId) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || site.userId !== session.user.id) {
      return NextResponse.json({ error: "Site bulunamadı." }, { status: 404 });
    }
    folder = site.id;
  }

  try {
    const url = await saveUploadedImage(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
