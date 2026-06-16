"use client";

import { useState } from "react";

export function ImageUploadField({
  name,
  siteId,
  initialUrl,
  label,
}: {
  name: string;
  siteId: string;
  initialUrl?: string | null;
  label: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Yükleme başarısız oldu.");
        return;
      }
      setUrl(json.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-16 w-16 rounded border border-zinc-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-zinc-300 text-xs text-zinc-400">
            Görsel
          </div>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => void handleChange(e.target.files?.[0])}
        />
      </div>
      {uploading && <p className="text-xs text-zinc-500">Yükleniyor...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </label>
  );
}
