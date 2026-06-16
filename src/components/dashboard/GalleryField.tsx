"use client";

import { useState, useRef, useEffect } from "react";

export function GalleryField({
  siteId,
  initialImages = [],
}: {
  siteId: string;
  initialImages?: string[];
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  function sync(imgs: string[]) {
    if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(imgs);
  }

  useEffect(() => {
    sync(images);
  }, [images]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("siteId", siteId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => {
          const next = [...prev, data.url];
          sync(next);
          return next;
        });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(url: string) {
    setImages((prev) => {
      const next = prev.filter((u) => u !== url);
      sync(next);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">Galeri görselleri</span>
      <input
        ref={hiddenRef}
        type="hidden"
        name="images"
        defaultValue={JSON.stringify(initialImages)}
      />

      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500 hover:bg-zinc-100">
          {uploading ? "Yükleniyor..." : "+ Görsel ekle"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
