"use client";

import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { SlugField } from "@/components/dashboard/SlugField";
import { GalleryField } from "@/components/dashboard/GalleryField";
import type { Product } from "@/generated/prisma/client";

export function ProductForm({
  siteId,
  siteSlug,
  product,
  action,
}: {
  siteId: string;
  siteSlug: string;
  product?: Product;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Ürün adı</span>
        <input className="input" name="title" defaultValue={product?.title ?? ""} required />
      </label>

      <SlugField urlPrefix={`/s/${siteSlug}/urunler/`} initialValue={product?.slug ?? ""} />

      <ImageUploadField name="imageUrl" siteId={siteId} initialUrl={product?.imageUrl} label="Ana görsel" />

      <GalleryField
        siteId={siteId}
        initialImages={(() => { try { return product?.images ? JSON.parse(product.images) : []; } catch { return []; } })()}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Fiyat (TL)</span>
          <input
            className="input"
            name="price"
            inputMode="decimal"
            defaultValue={product?.price?.toString() ?? ""}
            placeholder="Örn. 149.90"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Kategori</span>
          <input className="input" name="category" defaultValue={product?.category ?? ""} />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Açıklama</span>
        <textarea className="input min-h-28" name="description" defaultValue={product?.description ?? ""} />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? true} />
        Yayında
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Kaydet
      </button>
    </form>
  );
}
