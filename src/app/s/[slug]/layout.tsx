import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug } from "@/lib/sites";
import { resolveThemeVars, themeVarsToStyle, getTheme } from "@/lib/themes";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

function absoluteUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${APP_URL}${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) return {};

  const description = site.seoDescription || site.tagline || undefined;
  const ogImage = absoluteUrl(site.ogImageUrl ?? site.logoUrl);

  return {
    title: {
      template: `%s | ${site.name}`,
      default: site.name,
    },
    description,
    openGraph: {
      siteName: site.name,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const vars = resolveThemeVars(site.themeKey, site.themeConfig);
  const fontUrl = getTheme(site.themeKey).fontUrl;

  return (
    <div
      style={{ ...themeVarsToStyle(vars), fontFamily: vars["--site-font"] }}
      className="flex min-h-screen flex-col bg-[var(--site-bg)] text-[var(--site-fg)]"
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      {fontUrl && <style dangerouslySetInnerHTML={{ __html: `@import url('${fontUrl}');` }} />}
      {site.gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${site.gaId}');
          `}</Script>
        </>
      )}

      {site.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${site.metaPixelId}');fbq('track','PageView');
        `}</Script>
      )}

      <SiteHeader site={site} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </div>
  );
}
