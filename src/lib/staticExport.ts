import { mkdir, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./db";

const EXPORTS_DIR = path.join(process.cwd(), "public", "exports");
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

// depth 0: index.html, urunler.html, haberler.html, iletisim.html (all in the export root)
// depth 1: urunler/<slug>.html, haberler/<slug>.html (one directory below the root)
const REL_PREFIX = ["./", "../"];

export class ExportError extends Error {}

export function exportDirFor(slug: string) {
  return path.join(EXPORTS_DIR, slug);
}

export async function removeStaticExport(slug: string) {
  await rm(exportDirFor(slug), { recursive: true, force: true });
}

type PageSpec = { urlPath: string; outFile: string; depth: number };

type ProcessCtx = {
  slug: string;
  depth: number;
  exportDir: string;
  cssChunks: Map<string, string>;
  copiedUploads: Set<string>;
};

export async function generateStaticExport(siteId: string) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) throw new ExportError("Site bulunamadı.");
  if (!site.published) throw new ExportError("Önce siteyi yayınlamalısınız.");

  const [products, news, sitePages] = await Promise.all([
    prisma.product.findMany({ where: { siteId, published: true } }),
    prisma.newsPost.findMany({ where: { siteId, published: true } }),
    prisma.sitePage.findMany({ where: { siteId, published: true } }),
  ]);

  const pages: PageSpec[] = [
    { urlPath: `/s/${site.slug}`, outFile: "index.html", depth: 0 },
    { urlPath: `/s/${site.slug}/urunler`, outFile: "urunler.html", depth: 0 },
    { urlPath: `/s/${site.slug}/haberler`, outFile: "haberler.html", depth: 0 },
    { urlPath: `/s/${site.slug}/iletisim`, outFile: "iletisim.html", depth: 0 },
    ...products.map((p) => ({
      urlPath: `/s/${site.slug}/urunler/${p.slug}`,
      outFile: `urunler/${p.slug}.html`,
      depth: 1,
    })),
    ...news.map((n) => ({
      urlPath: `/s/${site.slug}/haberler/${n.slug}`,
      outFile: `haberler/${n.slug}.html`,
      depth: 1,
    })),
    ...sitePages.map((pg) => ({
      urlPath: `/s/${site.slug}/sayfa/${pg.slug}`,
      outFile: `sayfa/${pg.slug}.html`,
      depth: 1,
    })),
  ];

  const exportDir = exportDirFor(site.slug);
  await rm(exportDir, { recursive: true, force: true });
  await mkdir(exportDir, { recursive: true });

  const cssChunks = new Map<string, string>();
  const copiedUploads = new Set<string>();

  for (const pg of pages) {
    const res = await fetch(`${APP_URL}${pg.urlPath}`, { cache: "no-store" });
    if (!res.ok) continue;

    let html = await res.text();
    html = await processHtml(html, {
      slug: site.slug,
      depth: pg.depth,
      exportDir,
      cssChunks,
      copiedUploads,
    });

    const outPath = path.join(exportDir, pg.outFile);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf-8");
  }

  const assetsDir = path.join(exportDir, "assets");
  await mkdir(assetsDir, { recursive: true });
  const combinedCss = [...cssChunks.values()].join("\n\n");
  await writeFile(path.join(assetsDir, "styles.css"), combinedCss, "utf-8");

  return { exportDir, publicPath: `/exports/${site.slug}/` };
}

async function processHtml(html: string, ctx: ProcessCtx): Promise<string> {
  const relPrefix = REL_PREFIX[ctx.depth];

  // 1. Collect + inline stylesheets into a single shared assets/styles.css
  const linkRe = /<link[^>]*rel=["']stylesheet["'][^>]*>/g;
  for (const tag of html.match(linkRe) ?? []) {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (ctx.cssChunks.has(href)) continue;

    const cssRes = await fetch(`${APP_URL}${href}`, { cache: "no-store" });
    if (!cssRes.ok) continue;

    let css = await cssRes.text();
    css = css.replace(/url\((\/[^)'"]+)\)/g, (_m, p) => `url(${APP_URL}${p})`);
    ctx.cssChunks.set(href, css);
  }
  html = html.replace(linkRe, "");
  html = html.replace("</head>", `<link rel="stylesheet" href="${relPrefix}assets/styles.css"></head>`);

  // 2. Strip Next.js runtime scripts — public site has no client interactivity
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  html = html.replace(/<script\b[^>]*\/>/g, "");

  // 3. Remaining absolute /_next/... references (e.g. font preloads) point back to the SaaS app
  html = html.replace(/(["'(])\/_next\//g, `$1${APP_URL}/_next/`);

  // 4. Copy referenced /uploads/... images into assets/uploads and rewrite src
  const imgRe = /(src=["'])(\/uploads\/[^"']+)(["'])/g;
  for (const m of [...html.matchAll(imgRe)]) {
    const uploadPath = m[2];
    if (ctx.copiedUploads.has(uploadPath)) continue;

    const src = path.join(process.cwd(), "public", uploadPath);
    const dest = path.join(ctx.exportDir, "assets", "uploads", uploadPath.replace(/^\/uploads\//, ""));
    try {
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(src, dest);
      ctx.copiedUploads.add(uploadPath);
    } catch {
      // source file missing — leave as absolute URL below
    }
  }
  html = html.replace(imgRe, (full, p1, p2, p3) => {
    if (ctx.copiedUploads.has(p2)) {
      return `${p1}${relPrefix}assets/uploads/${p2.replace(/^\/uploads\//, "")}${p3}`;
    }
    return `${p1}${APP_URL}${p2}${p3}`;
  });

  // 5. Rewrite internal nav links (/s/<slug>...) to relative .html file links
  const base = `/s/${ctx.slug}`;
  const hrefRe = new RegExp(
    `href=(["'])${escapeRegExp(base)}(?:/(urunler|haberler|iletisim|sayfa))?(?:/([a-zA-Z0-9-]+))?\\1`,
    "g"
  );
  html = html.replace(hrefRe, (_m, quote: string, section?: string, slug?: string) => {
    let target: string;
    if (!section) target = "index.html";
    else if (!slug) target = `${section}.html`;
    else target = `${section}/${slug}.html`;
    return `href=${quote}${relPrefix}${target}${quote}`;
  });

  return html;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
