"use client";

import { useRef } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  published: boolean;
};

export function SlideForm({
  siteId,
  slide,
  action,
}: {
  siteId: string;
  slide?: Slide;
  action: (formData: FormData) => Promise<void>;
}) {
  const imageRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("siteId", siteId);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      if (imageRef.current) imageRef.current.value = data.url;
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">Başlık</label>
        <input
          name="title"
          defaultValue={slide?.title ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">Alt Başlık</label>
        <textarea
          name="subtitle"
          defaultValue={slide?.subtitle ?? ""}
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">Görsel</label>
        {slide?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.imageUrl} alt="" className="mb-2 h-36 w-full rounded-lg object-cover" />
        )}
        <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-zinc-600" />
        <input
          ref={imageRef}
          type="hidden"
          name="imageUrl"
          defaultValue={slide?.imageUrl ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Link URL</label>
          <input
            name="linkUrl"
            defaultValue={slide?.linkUrl ?? ""}
            placeholder="/urunler veya https://..."
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Link Etiketi</label>
          <input
            name="linkLabel"
            defaultValue={slide?.linkLabel ?? ""}
            placeholder="İncele, Daha Fazla..."
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          defaultChecked={slide ? slide.published : true}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <label htmlFor="published" className="text-sm font-medium text-zinc-700">Yayında</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          {slide ? "Güncelle" : "Oluştur"}
        </button>
        <Link
          href={`/dashboard/${siteId}/slides`}
          className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
