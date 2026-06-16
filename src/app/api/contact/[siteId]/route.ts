import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } });
  if (!site) {
    return NextResponse.json({ error: "Site bulunamadı." }, { status: 404, headers: CORS });
  }

  let data: Record<string, string> = {};
  const ct = req.headers.get("content-type") ?? "";

  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    data = body as Record<string, string>;
  } else {
    const fd = await req.formData().catch(() => null);
    if (fd) {
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") data[k] = v;
      }
    }
  }

  const name = data.name?.trim();
  const email = data.email?.trim();
  const message = data.message?.trim();
  const phone = data.phone?.trim() || null;

  if (!name || !email || !message) {
    const isJson = ct.includes("application/json") || req.headers.get("accept")?.includes("application/json");
    if (isJson) {
      return NextResponse.json({ error: "Ad, e-posta ve mesaj gereklidir." }, { status: 400, headers: CORS });
    }
    return NextResponse.redirect(`${APP_URL}/api/contact/${siteId}/error`, { headers: CORS });
  }

  await prisma.contactMessage.create({
    data: { siteId: site.id, name, email, phone, message },
  });

  const isJson = ct.includes("application/json") || req.headers.get("accept")?.includes("application/json");
  if (isJson) {
    return NextResponse.json({ ok: true }, { status: 201, headers: CORS });
  }

  // Native form submission → redirect to a simple success page
  return NextResponse.redirect(`${APP_URL}/api/contact/${siteId}/success`, { headers: CORS });
}
