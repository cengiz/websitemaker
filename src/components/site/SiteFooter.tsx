import type { Site } from "@/generated/prisma/client";
import { parseSocials } from "@/lib/sites";
import type { ThemeLayout } from "@/lib/themes";

export function SiteFooter({ site, layout }: { site: Site; layout: ThemeLayout }) {
  const socials = parseSocials(site.socials);
  const socialEntries = Object.entries(socials).filter(([, url]) => url);

  const isBold = layout === "bold";
  const isEditorial = layout === "editorial";

  const footerStyle = isBold
    ? { background: "var(--site-primary)" }
    : isEditorial
    ? { background: "var(--site-fg)" }
    : undefined;

  const footerClass = isBold || isEditorial ? "mt-auto" : "mt-auto border-t border-[var(--site-border)]";

  const textColor = isBold
    ? "var(--site-primary-fg)"
    : isEditorial
    ? "var(--site-bg)"
    : "var(--site-fg)";

  const mutedStyle: React.CSSProperties = {
    color: isBold || isEditorial ? textColor : "var(--site-muted)",
    opacity: isBold || isEditorial ? 0.75 : 1,
  };

  return (
    <footer className={footerClass} style={footerStyle}>
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm">
        <p className="font-semibold" style={{ color: textColor }}>
          {site.name}
        </p>

        <div className="flex flex-wrap gap-4" style={mutedStyle}>
          {site.contactEmail && <span>{site.contactEmail}</span>}
          {site.contactPhone && <span>{site.contactPhone}</span>}
          {site.address && <span>{site.address}</span>}
        </div>

        {socialEntries.length > 0 && (
          <div className="flex flex-wrap gap-4" style={mutedStyle}>
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

        <p className="mt-4 text-xs" style={{ color: textColor, opacity: 0.45 }}>
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
