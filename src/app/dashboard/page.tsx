import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Sitelerim</h1>
        <Link
          href="/onboarding"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Yeni site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
          Henüz bir siteniz yok.{" "}
          <Link href="/onboarding" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
            Hemen oluşturun
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/${site.id}`}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400"
            >
              <div className="flex items-center gap-3">
                {site.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={site.logoUrl} alt={site.name} className="h-10 w-10 rounded object-contain" />
                ) : (
                  <div className="h-10 w-10 rounded bg-zinc-100" />
                )}
                <div>
                  <p className="font-medium text-zinc-900">{site.name}</p>
                  <p className="text-sm text-zinc-500">/s/{site.slug}</p>
                </div>
              </div>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                  site.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {site.published ? "Yayında" : "Taslak"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
