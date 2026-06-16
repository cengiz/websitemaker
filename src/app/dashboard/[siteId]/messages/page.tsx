import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { markRead } from "./actions";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { site } = await requireSiteOwner(siteId);

  const messages = await prisma.contactMessage.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Mesajlar
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount} yeni
            </span>
          )}
        </h2>
      </div>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          Henüz mesaj yok.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border bg-white p-5 ${msg.read ? "border-zinc-200" : "border-zinc-900"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900">
                    {msg.name}
                    {!msg.read && (
                      <span className="ml-2 rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                        yeni
                      </span>
                    )}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-sm text-zinc-500">
                    <a href={`mailto:${msg.email}`} className="hover:underline">
                      {msg.email}
                    </a>
                    {msg.phone && <span>{msg.phone}</span>}
                    <span>{new Date(msg.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                {!msg.read && (
                  <form action={markRead.bind(null, site.id, msg.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      Okundu işaretle
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-zinc-700">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
