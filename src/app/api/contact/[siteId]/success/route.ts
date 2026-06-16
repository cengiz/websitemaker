import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"/><title>Mesajınız Alındı</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f4f4f5}.card{background:#fff;border-radius:12px;padding:2.5rem 3rem;text-align:center;max-width:400px;box-shadow:0 2px 16px rgba(0,0,0,.08)}h1{font-size:1.5rem;margin:0 0 .5rem}p{color:#71717a;margin:0 0 1.5rem}a{color:#18181b;font-weight:500;text-decoration:underline}</style></head><body><div class="card"><h1>✓ Mesajınız alındı!</h1><p>En kısa sürede size geri döneceğiz.</p><a href="javascript:history.back()">← Geri dön</a></div></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
