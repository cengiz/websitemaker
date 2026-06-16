"use client";

import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import type { SitePage } from "@/generated/prisma/client";

export function PageForm({
  siteId,
  page,
  action,
}: {
  siteId: string;
  page?: SitePage;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Başlık</span>
        <input className="input" name="title" defaultValue={page?.title ?? ""} required />
      </label>

      <ImageUploadField name="imageUrl" siteId={siteId} initialUrl={page?.imageUrl} label="Görsel" />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">İçerik</span>
        <textarea className="input min-h-60" name="body" defaultValue={page?.body ?? ""} />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input type="checkbox" name="published" defaultChecked={page?.published ?? true} />
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
