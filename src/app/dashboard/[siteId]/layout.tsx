import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";

const NAV_ITEMS = [
  { href: "", label: "Genel Bakış" },
  { href: "/settings", label: "Ayarlar" },
  { href: "/theme", label: "Tema" },
  { href: "/products", label: "Ürünler" },
  { href: "/news", label: "Haberler" },
  { href: "/pages", label: "Sayfalar" },
  { href: "/slides", label: "Slider" },
  { href: "/menu", label: "Menü" },
  { href: "/messages", label: "Mesajlar" },
] as const;

export default async function SiteDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { site } = await requireSiteOwner(siteId);

  const base = `/dashboard/${site.id}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{site.name}</h1>
          <p className="text-sm text-zinc-500">/s/{site.slug}</p>
        </div>
        <Link
          href={`/s/${site.slug}`}
          target="_blank"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
        >
          Siteyi görüntüle ↗
        </Link>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto sm:w-48 sm:flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={`${base}${item.href}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
