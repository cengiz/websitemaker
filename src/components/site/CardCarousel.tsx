"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
};

const GAP = 16;
const PEEK = 48;

function CardInner({ slide }: { slide: Slide }) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {slide.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.imageUrl} alt={slide.title ?? ""} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: "var(--site-primary)", opacity: 0.15 }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          {slide.title && <h3 className="text-lg font-bold leading-tight drop-shadow-md">{slide.title}</h3>}
          {slide.subtitle && <p className="mt-1 text-sm text-white/80 line-clamp-2">{slide.subtitle}</p>}
          {slide.linkUrl && (
            <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {slide.linkLabel || "İncele"} →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CardCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [offset, setOffset] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const maxIndex = slides.length - 1;

  const getCardWidth = useCallback(() => {
    if (!wrapRef.current) return 0;
    return wrapRef.current.offsetWidth - PEEK - GAP;
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setOffset(current * (getCardWidth() + GAP)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [current, getCardWidth]);

  if (slides.length === 0) return null;

  function go(idx: number) {
    const clamped = Math.max(0, Math.min(maxIndex, idx));
    setCurrent(clamped);
    setOffset(clamped * (getCardWidth() + GAP));
  }

  const cardWidthCSS = `calc(100% - ${PEEK + GAP}px)`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div data-carousel className="relative" ref={wrapRef}>
        {/* Track */}
        <div className="overflow-hidden">
          <div
            data-track
            className="flex"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(${-offset}px)`,
              transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {slides.map((slide) => {
              const w = { width: cardWidthCSS, flexShrink: 0 };
              if (!slide.linkUrl)
                return <div key={slide.id} data-card style={w}><CardInner slide={slide} /></div>;
              if (slide.linkUrl.startsWith("http"))
                return (
                  <a key={slide.id} data-card href={slide.linkUrl} target="_blank" rel="noopener noreferrer" style={w}>
                    <CardInner slide={slide} />
                  </a>
                );
              return (
                <Link key={slide.id} data-card href={slide.linkUrl} style={w}>
                  <CardInner slide={slide} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              data-prev
              onClick={() => go(current - 1)}
              disabled={current === 0}
              aria-label="Önceki"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white text-2xl backdrop-blur-sm transition hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
            >‹</button>
            <button
              data-next
              onClick={() => go(current + 1)}
              disabled={current === maxIndex}
              aria-label="Sonraki"
              className="absolute top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white text-2xl backdrop-blur-sm transition hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
              style={{ right: `${PEEK + 12}px` }}
            >›</button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                data-dot={i}
                onClick={() => go(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "6px",
                  background: i === current ? "var(--site-primary)" : "var(--site-border)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
