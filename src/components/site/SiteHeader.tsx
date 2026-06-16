import Link from "next/link";
import type { Site } from "@/generated/prisma/client";
import { parseMenu, buildMenuItems } from "@/lib/menu";

export function SiteHeader({ site }: { site: Site }) {
  const base = `/s/${site.slug}`;
  const menuItems = buildMenuItems(base, parseMenu(site.menuConfig));

  return (
    <header className="border-b border-[var(--site-border)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href={base} className="flex items-center gap-3">
          {site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.logoUrl}
              alt={site.name}
              className="h-10 w-10 rounded object-contain"
            />
          ) : null}
          <span className="text-lg font-semibold">{site.name}</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
