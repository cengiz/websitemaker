import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicSiteBySlug, parseSocials } from "@/lib/sites";
import { ContactForm } from "@/components/site/ContactForm";

const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const site = await getPublicSiteBySlug((await params).slug);
  if (!site) return {};
  return { title: "İletişim" };
}

export default async function SiteContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublicSiteBySlug(slug);
  if (!site) notFound();

  const socials = parseSocials(site.socials);
  const socialEntries = Object.entries(socials).filter(([, url]) => url);

  const hasContactInfo =
    site.contactEmail || site.contactPhone || site.address || socialEntries.length > 0;

  const apiUrl = `${APP_URL}/api/contact/${site.id}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">İletişim</h1>

      {hasContactInfo && (
        <div className="mb-8 flex flex-col gap-3 rounded-lg border border-[var(--site-border)] bg-[var(--site-card)] p-6">
          {site.contactEmail && (
            <div>
              <p className="text-sm text-[var(--site-muted)]">E-posta</p>
              <a href={`mailto:${site.contactEmail}`} className="font-medium hover:underline">
                {site.contactEmail}
              </a>
            </div>
          )}
          {site.contactPhone && (
            <div>
              <p className="text-sm text-[var(--site-muted)]">Telefon</p>
              <a href={`tel:${site.contactPhone}`} className="font-medium hover:underline">
                {site.contactPhone}
              </a>
            </div>
          )}
          {site.address && (
            <div>
              <p className="text-sm text-[var(--site-muted)]">Adres</p>
              <p className="font-medium whitespace-pre-line">{site.address}</p>
            </div>
          )}
          {socialEntries.length > 0 && (
            <div>
              <p className="text-sm text-[var(--site-muted)]">Sosyal medya</p>
              <div className="mt-1 flex flex-wrap gap-3">
                {socialEntries.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium capitalize hover:underline"
                  >
                    {key}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-[var(--site-border)] bg-[var(--site-card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">Mesaj Gönder</h2>
        <ContactForm apiUrl={apiUrl} />
      </div>
    </div>
  );
}
