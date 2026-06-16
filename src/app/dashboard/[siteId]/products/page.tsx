import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { deleteProduct } from "./actions";
import { SortableProductList } from "@/components/dashboard/SortableProductList";

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

  async function handleDelete(id: string) {
    "use server";
    await deleteProduct(site.id, id);
  }

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

      <SortableProductList
        siteId={site.id}
        initialProducts={products}
        deleteAction={handleDelete}
      />
    </div>
  );
}
