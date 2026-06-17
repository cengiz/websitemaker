"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
};

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next, slides.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (slides.length === 0) return null;

  return (
    <div
      data-hero-slider
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(320px, 60vh, 640px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — each contains its own image + content so vanilla JS only needs to toggle opacity */}
      {slides.map((s, i) => {
        const isExternal = s.linkUrl?.startsWith("http");
        return (
          <div
            key={s.id}
            data-slide={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {s.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.imageUrl} alt={s.title ?? ""} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-[var(--site-primary)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
              {s.title && (
                <h2 className="text-3xl font-bold drop-shadow-lg sm:text-4xl md:text-5xl">{s.title}</h2>
              )}
              {s.subtitle && (
                <p className="mt-3 max-w-xl text-base drop-shadow sm:text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {s.subtitle}
                </p>
              )}
              {s.linkUrl && (
                isExternal ? (
                  <a
                    href={s.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block rounded-full px-7 py-3 text-sm font-semibold shadow-lg transition hover:opacity-90"
                    style={{ background: "var(--site-primary)", color: "var(--site-primary-fg)" }}
                  >
                    {s.linkLabel || "İncele"}
                  </a>
                ) : (
                  <Link
                    href={s.linkUrl}
                    className="mt-6 inline-block rounded-full px-7 py-3 text-sm font-semibold shadow-lg transition hover:opacity-90"
                    style={{ background: "var(--site-primary)", color: "var(--site-primary-fg)" }}
                  >
                    {s.linkLabel || "İncele"}
                  </Link>
                )
              )}
            </div>
          </div>
        );
      })}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            data-prev
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white text-xl backdrop-blur-sm hover:bg-white/35 transition"
            aria-label="Önceki"
          >‹</button>
          <button
            data-next
            onClick={next}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white text-xl backdrop-blur-sm hover:bg-white/35 transition"
            aria-label="Sonraki"
          >›</button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              data-dot={i}
              onClick={() => setCurrent(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? "24px" : "8px",
                background: i === current ? "white" : "rgba(255,255,255,0.5)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 z-20 h-0.5 w-full overflow-hidden">
          <div
            key={current}
            className="h-full"
            style={{ background: "var(--site-primary)", animation: "slide-progress 5s linear" }}
          />
        </div>
      )}
    </div>
  );
}
