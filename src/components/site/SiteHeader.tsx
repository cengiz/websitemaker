"use client";

import { useState } from "react";
import Link from "next/link";
import type { Site } from "@/generated/prisma/client";
import { parseMenu, buildMenuItems } from "@/lib/menu";

export function SiteHeader({ site }: { site: Site }) {
  const [open, setOpen] = useState(false);
  const base = `/s/${site.slug}`;
  const menuItems = buildMenuItems(base, parseMenu(site.menuConfig));

  return (
    <header className="border-b border-[var(--site-border)] bg-[var(--site-bg)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        {/* Logo + site name */}
        <Link href={base} className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logoUrl} alt={site.name} className="h-10 w-10 rounded object-contain" />
          ) : null}
          <span className="text-lg font-semibold">{site.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium sm:flex">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-70 transition-opacity">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger button — mobile only */}
        {menuItems.length > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-md p-2 sm:hidden"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
          >
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-300"
              style={{
                background: "var(--site-fg)",
                transform: open ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-300"
              style={{ background: "var(--site-fg)", opacity: open ? 0 : 1 }}
            />
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-300"
              style={{
                background: "var(--site-fg)",
                transform: open ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        )}
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav className="border-t border-[var(--site-border)] px-4 py-3 sm:hidden">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-[var(--site-card)] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
