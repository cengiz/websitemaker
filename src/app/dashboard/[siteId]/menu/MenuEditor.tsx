"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/menu";

type PageOption = { id: string; title: string; slug: string };

export function MenuEditor({
  siteId,
  initialItems,
  availablePages,
  action,
}: {
  siteId: string;
  initialItems: MenuItem[];
  availablePages: PageOption[];
  action: (formData: FormData) => void;
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  const toggle = (idx: number) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, enabled: !item.enabled } : item)));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    setItems((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const addPage = (page: PageOption) => {
    const key = `page:${page.id}`;
    if (items.some((i) => i.key === key)) return;
    setItems((prev) => [
      ...prev,
      { key, label: page.title, path: `sayfa/${page.slug}`, enabled: true },
    ]);
  };

  const removePage = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const unaddedPages = availablePages.filter((p) => !items.some((i) => i.key === `page:${p.id}`));

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
    >
      <input type="hidden" name="menu" value={JSON.stringify(items)} />

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                item.enabled ? "bg-zinc-900" : "bg-zinc-300"
              }`}
              aria-label={item.enabled ? "Devre dışı bırak" : "Etkinleştir"}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  item.enabled ? "left-4.5 translate-x-0" : "left-0.5"
                }`}
              />
            </button>

            <span className={`flex-1 text-sm font-medium ${item.enabled ? "text-zinc-900" : "text-zinc-400"}`}>
              {item.label}
            </span>

            <span className="text-xs text-zinc-400">/{item.path || ""}</span>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 disabled:opacity-30"
                aria-label="Yukarı taşı"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={idx === items.length - 1}
                className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 disabled:opacity-30"
                aria-label="Aşağı taşı"
              >
                ↓
              </button>
            </div>

            {item.key.startsWith("page:") && (
              <button
                type="button"
                onClick={() => removePage(item.key)}
                className="text-xs text-red-400 hover:text-red-600"
                aria-label="Menüden kaldır"
              >
                Kaldır
              </button>
            )}
          </div>
        ))}
      </div>

      {unaddedPages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-sm text-zinc-500">Sayfalar ekle:</span>
          {unaddedPages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addPage(p)}
              className="rounded-md border border-zinc-300 px-2.5 py-1 text-sm hover:bg-zinc-50"
            >
              + {p.title}
            </button>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Kaydet
      </button>
    </form>
  );
}
