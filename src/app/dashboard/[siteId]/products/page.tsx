import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { deleteProduct } from "./actions";

const SUCCESS_MESSAGES: Record<string, string> = {
  created: "Ürün eklendi.",
  updated: "Ürün güncellendi.",
  deleted: "Ürün silindi.",
};

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { siteId } = await params;
  const { success } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const products = await prisma.product.findMany({
    where: { siteId: site.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Ürünler</h2>
        <Link
          href={`/dashboard/${site.id}/products/new`}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Yeni ürün
        </Link>
      </div>

      {success && SUCCESS_MESSAGES[success] && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{SUCCESS_MESSAGES[success]}</p>
      )}

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
          Henüz ürün eklenmemiş.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.title} className="h-12 w-12 rounded object-cover" />
              ) : (
                <div className="h-12 w-12 rounded bg-zinc-100" />
              )}
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{product.title}</p>
                <p className="text-sm text-zinc-500">
                  {product.price != null ? `${product.price.toLocaleString("tr-TR")} TL` : "Fiyat yok"}
                  {product.category ? ` · ${product.category}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  product.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {product.published ? "Yayında" : "Taslak"}
              </span>
              <Link
                href={`/dashboard/${site.id}/products/${product.id}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
              >
                Düzenle
              </Link>
              <form action={deleteProduct.bind(null, site.id, product.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
