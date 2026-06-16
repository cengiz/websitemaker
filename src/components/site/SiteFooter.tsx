import type { Site } from "@/generated/prisma/client";
import { parseSocials } from "@/lib/sites";

export function SiteFooter({ site }: { site: Site }) {
  const socials = parseSocials(site.socials);
  const socialEntries = Object.entries(socials).filter(([, url]) => url);

  return (
    <footer className="border-t border-[var(--site-border)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-[var(--site-muted)]">
        <p className="font-medium text-[var(--site-fg)]">{site.name}</p>

        <div className="flex flex-wrap gap-4">
          {site.contactEmail && <span>{site.contactEmail}</span>}
          {site.contactPhone && <span>{site.contactPhone}</span>}
          {site.address && <span>{site.address}</span>}
        </div>

        {socialEntries.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {socialEntries.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="capitalize underline-offset-2 hover:underline"
              >
                {key}
              </a>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
