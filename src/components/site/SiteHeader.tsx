"use client";

import { useState } from "react";
import Link from "next/link";
import type { Site } from "@/generated/prisma/client";
import { parseMenu, buildMenuItems } from "@/lib/menu";
import type { ThemeLayout } from "@/lib/themes";

export function SiteHeader({ site, layout }: { site: Site; layout: ThemeLayout }) {
  const [open, setOpen] = useState(false);
  const base = `/s/${site.slug}`;
  const menuItems = buildMenuItems(base, parseMenu(site.menuConfig));

  const isBold = layout === "bold";
  const isEditorial = layout === "editorial";
  const isMinimal = layout === "minimal";

  // Background for bold/editorial headers
  const headerStyle = isBold
    ? { background: "var(--site-primary)" }
    : isEditorial
    ? { background: "var(--site-fg)" }
    : undefined;

  // Foreground color for text/icons in the header
  const fgColor = isBold
    ? "var(--site-primary-fg)"
    : isEditorial
    ? "var(--site-bg)"
    : "var(--site-fg)";

  const mutedColor = isBold || isEditorial ? fgColor : "var(--site-muted)";

  const drawerBorderColor = isBold
    ? "rgba(255,255,255,0.2)"
    : isEditorial
    ? "rgba(255,255,255,0.15)"
    : "var(--site-border)";

  const headerClass = [
    "sticky top-0 z-40",
    isBold || isEditorial ? "" : "bg-[var(--site-bg)]",
    isMinimal ? "" : !isBold && !isEditorial ? "border-b border-[var(--site-border)]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass} style={headerStyle}>
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 ${
          isMinimal ? "py-6" : "py-4"
        }`}
      >
        {/* Logo + site adı */}
        <Link href={base} className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.logoUrl}
              alt={site.name}
              className="h-10 w-10 rounded object-contain"
            />
          ) : null}
          <span
            className={isMinimal ? "text-sm font-medium tracking-widest uppercase" : "text-lg font-semibold"}
            style={{
              color: fgColor,
              fontFamily: isEditorial ? "var(--site-heading-font)" : undefined,
            }}
          >
            {site.name}
          </span>
        </Link>

        {/* Masaüstü nav */}
        <nav
          className={`hidden items-center gap-6 sm:flex ${
            isMinimal || isEditorial ? "text-xs uppercase tracking-widest" : "text-sm font-medium"
          }`}
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-opacity hover:opacity-70"
              style={{ color: isMinimal ? mutedColor : fgColor }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger — yalnızca mobil */}
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
                background: fgColor,
                transform: open ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-300"
              style={{ background: fgColor, opacity: open ? 0 : 1 }}
            />
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-300"
              style={{
                background: fgColor,
                transform: open ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        )}
      </div>

      {/* Mobil çekmece menü */}
      {open && (
        <nav
          className="px-4 py-3 sm:hidden"
          style={{
            borderTop: `1px solid ${drawerBorderColor}`,
            background: isBold
              ? "var(--site-primary)"
              : isEditorial
              ? "var(--site-fg)"
              : "var(--site-bg)",
          }}
        >
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: fgColor }}
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
