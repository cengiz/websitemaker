"use client";

import { useState, useEffect, useRef } from "react";
import { slugify } from "@/lib/slug";

export function SlugField({
  name = "slug",
  urlPrefix,
  initialValue = "",
}: {
  name?: string;
  urlPrefix: string;
  initialValue?: string;
}) {
  const [slug, setSlug] = useState(initialValue);
  const [touched, setTouched] = useState(!!initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (touched) return;
    const form = inputRef.current?.closest("form");
    const titleInput = form?.querySelector<HTMLInputElement>('input[name="title"]');
    if (!titleInput) return;

    const update = () => setSlug(slugify(titleInput.value));
    titleInput.addEventListener("input", update);
    update();
    return () => titleInput.removeEventListener("input", update);
  }, [touched]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700">URL Adresi</span>
      <div className="flex items-center overflow-hidden rounded-md border border-zinc-300 bg-white focus-within:ring-2 focus-within:ring-zinc-900/20">
        <span className="whitespace-nowrap border-r border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
          {urlPrefix}
        </span>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={slug}
          onChange={(e) => {
            setTouched(true);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
          }}
          onBlur={(e) => {
            const s = slugify(e.target.value);
            setSlug(s);
            if (!s) setTouched(false);
          }}
          className="flex-1 px-3 py-2 text-sm outline-none"
          placeholder="başlıktan otomatik"
        />
      </div>
      {slug && (
        <p className="text-xs text-zinc-400">
          {urlPrefix}
          {slug}
        </p>
      )}
    </div>
  );
}
