"use client";

import { useState, useEffect, useCallback } from "react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  if (images.length === 0) return null;

  const prev = useCallback(() => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  return (
    <>
      {/* Küçük görsel grid - tıklayınca lightbox açılır */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setOpen(true); }}
            className={`overflow-hidden rounded-lg ${i === 0 ? "col-span-4" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} ${i + 1}`}
              className={`w-full object-cover transition hover:opacity-90 ${i === 0 ? "h-64" : "h-24"}`}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setOpen(false)}
        >
          {/* Üst bar */}
          <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-white/70">{title}</span>
            <span className="text-sm text-white/70">{current + 1} / {images.length}</span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Ana görsel */}
          <div
            className="relative flex flex-1 items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[current]}
              alt={`${title} ${current + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/25 transition"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/25 transition"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Alt küçük resimler */}
          {images.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto px-4 py-3 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === current ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-14 w-14 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
