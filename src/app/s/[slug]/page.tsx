import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { prisma } from "@/lib/db";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CardCarousel } from "@/components/site/CardCarousel";
import { getTheme } from "@/lib/themes";
import type { ThemeLayout } from "@/lib/themes";
import type { Site } from "@/generated/prisma/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) return {};
  return { title: site.name };
}

/* ─── Hero section ─────────────────────────────── */

function HeroSection({ site, layout }: { site: Site; layout: ThemeLayout }) {
  if (layout === "editorial") {
    return (
      <section className="border-b border-[var(--site-border)] py-14">
        <div className="flex items-start gap-5">
          {site.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.logoUrl}
              alt={site.name}
              className="mt-1 h-12 w-12 flex-shrink-0 object-contain"
            />
          )}
          <div>
            <h1
              className="text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--site-heading-font)" }}
            >
              {site.name}
            </h1>
            {site.tagline && (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-0.5 w-8 shrink-0" style={{ background: "var(--site-primary)" }} />
                <p className="text-xs uppercase tracking-widest text-[var(--site-muted)]">
                  {site.tagline}
                </p>
              </div>
            )}
          </div>
        </div>
        {site.intro && (
          <p className="mt-8 max-w-2xl leading-relaxed opacity-75">{site.intro}</p>
        )}
      </section>
    );
  }

  if (layout === "minimal") {
    return (
      <section className="py-24 text-center">
        {site.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.logoUrl}
            alt={site.name}
            className="mx-auto mb-8 h-20 w-20 rounded-full object-contain"
          />
        )}
        <h1
          className="text-3xl font-light tracking-wide sm:text-5xl"
          style={{ fontFamily: "var(--site-heading-font)" }}
        >
          {site.name}
        </h1>
        {site.tagline && (
          <>
            <div
              className="mx-auto mt-6 h-px w-10"
              style={{ background: "var(--site-primary)" }}
            />
            <p className="mt-6 text-[var(--site-muted)]">{site.tagline}</p>
          </>
        )}
        {site.intro && (
          <p className="mx-auto mt-8 max-w-lg leading-relaxed opacity-80">{site.intro}</p>
        )}
      </section>
    );
  }

  /* classic + bold */
  return (
    <section className="flex flex-col items-start gap-4 py-12">
      {site.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.logoUrl} alt={site.name} className="h-20 w-20 rounded object-contain" />
      )}
      <h1 className="text-3xl font-bold sm:text-4xl">{site.name}</h1>
      {site.tagline && (
        <p className="text-lg text-[var(--site-muted)]">{site.tagline}</p>
      )}
      {site.intro && (
        <p className="max-w-2xl whitespace-pre-line text-[var(--site-fg)]">{site.intro}</p>
      )}
    </section>
  );
}

/* ─── Section heading ───────────────────────────── */

function SectionHeading({
  label,
  href,
  layout,
}: {
  label: string;
  href: string;
  layout: ThemeLayout;
}) {
  if (layout === "editorial") {
    return (
      <div className="mb-6 flex items-center gap-4">
        <h2
          className="text-xl font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--site-heading-font)" }}
        >
          {label}
        </h2>
        <div className="h-px flex-1" style={{ background: "var(--site-border)" }} />
        <Link
          href={href}
          className="text-xs uppercase tracking-widest text-[var(--site-muted)] hover:text-[var(--site-primary)] transition-colors"
        >
          Tümü →
        </Link>
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <div className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-widest text-[var(--site-muted)]">{label}</p>
        <div className="flex items-end justify-between">
          <div className="h-px w-8" style={{ background: "var(--site-primary)" }} />
          <Link
            href={href}
            className="text-xs text-[var(--site-muted)] underline-offset-2 hover:underline"
          >
            Tümünü gör
          </Link>
        </div>
      </div>
    );
  }

  /* classic + bold */
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">{label}</h2>
      <Link
        href={href}
        className="text-sm font-medium underline-offset-2 hover:underline"
      >
        Tümünü gör
      </Link>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────── */

export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const [products, news, slides] = await Promise.all([
    prisma.product.findMany({
      where: { siteId: site.id, published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.newsPost.findMany({
      where: { siteId: site.id, published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.slide.findMany({
      where: { siteId: site.id, published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const base = `/s/${site.slug}`;
  const sliderType = site.sliderType ?? "disabled";
  const layout = getTheme(site.themeKey).layout;

  return (
    <div>
      {sliderType === "hero" && slides.length > 0 && <HeroSlider slides={slides} />}
      {sliderType === "carousel" && slides.length > 0 && <CardCarousel slides={slides} />}

      <div className="mx-auto max-w-5xl px-4 py-4">
        <HeroSection site={site} layout={layout} />

        {products.length > 0 && (
          <section className="py-8">
            <SectionHeading label="Ürünler" href={`${base}/urunler`} layout={layout} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`${base}/urunler/${product.slug}`}
                  className="site-card p-4"
                >
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="mb-3 h-40 w-full object-cover"
                      style={{ borderRadius: "calc(var(--site-radius) / 2)" }}
                    />
                  ) : null}
                  <h3 className="font-medium">{product.title}</h3>
                  {product.price != null && (
                    <p className="mt-1 text-sm text-[var(--site-muted)]">
                      {product.price.toLocaleString("tr-TR")} TL
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {news.length > 0 && (
          <section className="py-8">
            <SectionHeading label="Blog" href={`${base}/blog`} layout={layout} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {news.map((post) => (
                <Link
                  key={post.id}
                  href={`${base}/blog/${post.slug}`}
                  className="site-card p-4"
                >
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="mb-3 h-40 w-full object-cover"
                      style={{ borderRadius: "calc(var(--site-radius) / 2)" }}
                    />
                  ) : null}
                  <h3 className="font-medium">{post.title}</h3>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-[var(--site-muted)] line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
