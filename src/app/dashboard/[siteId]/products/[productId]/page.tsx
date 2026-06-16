import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { ProductForm } from "../ProductForm";
import { updateProduct } from "../actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string; productId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { siteId, productId } = await params;
  const { error } = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const product = await prisma.product.findFirst({ where: { id: productId, siteId: site.id } });
  if (!product) notFound();

  const action = updateProduct.bind(null, site.id, product.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Ürünü Düzenle</h2>
        <Link href={`/dashboard/${site.id}/products`} className="text-sm text-zinc-500 hover:underline">
          ← Listeye dön
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Lütfen bilgileri kontrol edin.</p>
      )}

      <ProductForm siteId={site.id} siteSlug={site.slug} product={product} action={action} />
    </div>
  );
}
