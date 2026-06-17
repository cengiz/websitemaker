import { mkdir, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./db";

const EXPORTS_DIR = path.join(process.cwd(), "public", "exports");
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

// depth 0: root files (index.html, urunler.html …)
// depth 1: sub-directory files (urunler/<slug>.html …)
const REL_PREFIX = ["./", "../"];

export class ExportError extends Error {}

export function exportDirFor(slug: string) {
  return path.join(EXPORTS_DIR, slug);
}

export async function removeStaticExport(slug: string) {
  await rm(exportDirFor(slug), { recursive: true, force: true });
}

// Vanilla JS that replaces React interactivity for hero sliders and carousels.
// Reads data-* attributes written by the React components so it works on plain HTML.
const INTERACTIONS_JS = `(function(){
  // ── Hero Slider ────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-hero-slider]').forEach(function(el){
    var slides = Array.from(el.querySelectorAll('[data-slide]'));
    var dots   = Array.from(el.querySelectorAll('[data-dot]'));
    var prev   = el.querySelector('[data-prev]');
    var next   = el.querySelector('[data-next]');
    var current = 0;
    var timer;

    function activate(idx){
      slides[current].style.opacity = '0';
      slides[current].style.zIndex  = '0';
      if(dots[current]){ dots[current].style.width='8px'; dots[current].style.background='rgba(255,255,255,0.5)'; }
      current = (idx + slides.length) % slides.length;
      slides[current].style.opacity = '1';
      slides[current].style.zIndex  = '1';
      if(dots[current]){ dots[current].style.width='24px'; dots[current].style.background='white'; }
    }

    function start(){ timer = setInterval(function(){ activate(current+1); }, 5000); }
    function stop() { clearInterval(timer); }

    if(slides.length > 1){
      start();
      if(prev) prev.addEventListener('click', function(){ stop(); activate(current-1); start(); });
      if(next) next.addEventListener('click', function(){ stop(); activate(current+1); start(); });
      dots.forEach(function(d,i){ d.addEventListener('click', function(){ stop(); activate(i); start(); }); });
      el.addEventListener('mouseenter', stop);
      el.addEventListener('mouseleave', start);
      document.addEventListener('keydown', function(e){
        if(e.key==='ArrowLeft'){ stop(); activate(current-1); start(); }
        else if(e.key==='ArrowRight'){ stop(); activate(current+1); start(); }
      });
    }
  });

  // ── Card Carousel ──────────────────────────────────────────────────────────
  document.querySelectorAll('[data-carousel]').forEach(function(el){
    var track = el.querySelector('[data-track]');
    var cards = Array.from(el.querySelectorAll('[data-card]'));
    var dots  = Array.from(el.querySelectorAll('[data-dot]'));
    var prev  = el.querySelector('[data-prev]');
    var next  = el.querySelector('[data-next]');
    var GAP = 16, PEEK = 48;
    var current = 0;

    function cardWidth(){ return el.offsetWidth - PEEK - GAP; }

    function goTo(idx){
      current = Math.max(0, Math.min(cards.length-1, idx));
      track.style.transform = 'translateX('+(-current*(cardWidth()+GAP))+'px)';
      dots.forEach(function(d,i){
        d.style.width  = i===current ? '24px' : '6px';
        d.style.background = i===current ? 'var(--site-primary)' : 'var(--site-border)';
      });
      if(prev) prev.disabled = current===0;
      if(next) next.disabled = current===cards.length-1;
    }

    if(cards.length > 1){
      if(prev) prev.addEventListener('click', function(){ goTo(current-1); });
      if(next) next.addEventListener('click', function(){ goTo(current+1); });
      dots.forEach(function(d,i){ d.addEventListener('click', function(){ goTo(i); }); });
      window.addEventListener('resize', function(){ goTo(current); });
    }
    goTo(0);
  });
})();`;

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
    { urlPath: `/s/${site.slug}/blog`, outFile: "blog.html", depth: 0 },
    { urlPath: `/s/${site.slug}/iletisim`, outFile: "iletisim.html", depth: 0 },
    ...products.map((p) => ({
      urlPath: `/s/${site.slug}/urunler/${p.slug}`,
      outFile: `urunler/${p.slug}.html`,
      depth: 1,
    })),
    ...news.map((n) => ({
      urlPath: `/s/${site.slug}/blog/${n.slug}`,
      outFile: `blog/${n.slug}.html`,
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
    html = await processHtml(html, { slug: site.slug, depth: pg.depth, exportDir, cssChunks, copiedUploads });

    const outPath = path.join(exportDir, pg.outFile);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf-8");
  }

  const assetsDir = path.join(exportDir, "assets");
  await mkdir(assetsDir, { recursive: true });
  await writeFile(path.join(assetsDir, "styles.css"), [...cssChunks.values()].join("\n\n"), "utf-8");
  await writeFile(path.join(assetsDir, "interactions.js"), INTERACTIONS_JS, "utf-8");

  return { exportDir, publicPath: `/exports/${site.slug}/` };
}

async function processHtml(html: string, ctx: ProcessCtx): Promise<string> {
  const relPrefix = REL_PREFIX[ctx.depth] ?? "../";

  // 1. Collect local stylesheets → assets/styles.css; keep external links (Google Fonts etc.)
  const linkRe = /<link[^>]*rel=["']stylesheet["'][^>]*>/g;
  const externalLinks: string[] = [];
  for (const tag of html.match(linkRe) ?? []) {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (/^https?:\/\//.test(href)) { externalLinks.push(tag); continue; }
    if (ctx.cssChunks.has(href)) continue;
    const cssRes = await fetch(`${APP_URL}${href}`, { cache: "no-store" });
    if (!cssRes.ok) continue;
    let css = await cssRes.text();
    css = css.replace(/url\((\/[^)'"]+)\)/g, (_m, p) => `url(${APP_URL}${p})`);
    ctx.cssChunks.set(href, css);
  }
  html = html.replace(linkRe, "");
  html = html.replace(
    "</head>",
    `${externalLinks.join("\n")}\n<link rel="stylesheet" href="${relPrefix}assets/styles.css"></head>`
  );

  // 2. Strip Next.js runtime scripts
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script\b[^>]*\/>/gi, "");

  // 3. Rewrite remaining /_next/ references to point back to SaaS (fonts, preloads)
  html = html.replace(/(["'(])\/_next\//g, `$1${APP_URL}/_next/`);

  // 4. Copy /uploads/ images into assets/uploads and rewrite src to relative
  const imgRe = /(src=["'])(\/uploads\/[^"']+)(["'])/g;
  for (const m of [...html.matchAll(imgRe)]) {
    const uploadPath = m[2];
    if (ctx.copiedUploads.has(uploadPath)) continue;
    const src  = path.join(process.cwd(), "public", uploadPath);
    const dest = path.join(ctx.exportDir, "assets", "uploads", uploadPath.replace(/^\/uploads\//, ""));
    try { await mkdir(path.dirname(dest), { recursive: true }); await copyFile(src, dest); ctx.copiedUploads.add(uploadPath); }
    catch { /* missing file — fall through to absolute URL */ }
  }
  html = html.replace(imgRe, (_full, p1, p2, p3) =>
    ctx.copiedUploads.has(p2)
      ? `${p1}${relPrefix}assets/uploads/${p2.replace(/^\/uploads\//, "")}${p3}`
      : `${p1}${APP_URL}${p2}${p3}`
  );

  // 5. Rewrite contact form action to absolute URL
  html = html.replace(/action="\/api\/contact\/([^"]+)"/g, `action="${APP_URL}/api/contact/$1"`);

  // 6. Rewrite internal /s/<slug>/... nav links to relative .html paths
  const base = `/s/${ctx.slug}`;
  const hrefRe = new RegExp(
    `href=(["'])${escapeRegExp(base)}(?:/(urunler|blog|iletisim|sayfa))?(?:/([a-zA-Z0-9-]+))?\\1`,
    "g"
  );
  html = html.replace(hrefRe, (_m, quote: string, section?: string, itemSlug?: string) => {
    const target = !section ? "index.html" : !itemSlug ? `${section}.html` : `${section}/${itemSlug}.html`;
    return `href=${quote}${relPrefix}${target}${quote}`;
  });

  // 7. Inject interactions.js before </body>
  html = html.replace("</body>", `<script src="${relPrefix}assets/interactions.js"></script></body>`);

  return html;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
