"use client";

import { useState } from "react";
import { THEMES, resolveThemeVars } from "@/lib/themes";

function MiniPreview({ themeKey, primaryColor }: { themeKey: string; primaryColor: string }) {
  const vars = resolveThemeVars(themeKey, JSON.stringify({ "--site-primary": primaryColor }));
  return (
    <div
      className="overflow-hidden rounded-lg border text-[10px] leading-tight"
      style={{
        background: vars["--site-bg"],
        color: vars["--site-fg"],
        borderColor: vars["--site-border"],
        fontFamily: vars["--site-font"],
      }}
    >
      {/* Mini header */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{ background: vars["--site-card"], borderBottom: `1px solid ${vars["--site-border"]}` }}
      >
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full" style={{ background: vars["--site-primary"] }} />
          <span className="font-semibold" style={{ color: vars["--site-fg"] }}>Site Adı</span>
        </div>
        <div className="flex gap-1.5">
          {["Ana", "Ürünler", "Haber"].map((l) => (
            <span key={l} style={{ color: vars["--site-muted"] }}>{l}</span>
          ))}
        </div>
      </div>
      {/* Mini content */}
      <div className="p-2">
        <div className="mb-1.5 font-semibold" style={{ color: vars["--site-fg"] }}>Hoş Geldiniz</div>
        <div className="mb-2 h-1 w-4/5 rounded" style={{ background: vars["--site-muted"], opacity: 0.3 }} />
        <div className="mb-2 h-1 w-3/5 rounded" style={{ background: vars["--site-muted"], opacity: 0.3 }} />
        <div
          className="inline-block rounded px-1.5 py-0.5 font-medium"
          style={{
            background: vars["--site-primary"],
            color: vars["--site-primary-fg"],
            borderRadius: vars["--site-radius"],
          }}
        >
          İletişim
        </div>
        {/* Mini cards */}
        <div className="mt-2 grid grid-cols-3 gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded p-1"
              style={{
                background: vars["--site-card"],
                border: `1px solid ${vars["--site-border"]}`,
                borderRadius: vars["--site-radius"],
              }}
            >
              <div className="mb-0.5 h-4 rounded" style={{ background: vars["--site-border"] }} />
              <div className="h-1 w-3/4 rounded" style={{ background: vars["--site-muted"], opacity: 0.4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemeForm({
  initialThemeKey,
  initialThemeConfig,
  action,
}: {
  initialThemeKey: string;
  initialThemeConfig: string | null;
  action: (formData: FormData) => void;
}) {
  const initialVars = resolveThemeVars(initialThemeKey, initialThemeConfig);
  const [themeKey, setThemeKey] = useState(initialThemeKey);
  const [primaryColor, setPrimaryColor] = useState(initialVars["--site-primary"]);

  const selectTheme = (key: string) => {
    setThemeKey(key);
    const theme = THEMES.find((t) => t.key === key);
    if (theme) setPrimaryColor(theme.vars["--site-primary"]);
  };

  return (
    <form action={action} className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6">
      <input type="hidden" name="themeKey" value={themeKey} />

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-700">Tema şablonu</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              type="button"
              onClick={() => selectTheme(theme.key)}
              className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition ${
                themeKey === theme.key
                  ? "border-zinc-900 ring-2 ring-zinc-900"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <MiniPreview themeKey={theme.key} primaryColor={themeKey === theme.key ? primaryColor : theme.vars["--site-primary"]} />
              <div className="px-0.5">
                <p className="text-sm font-semibold text-zinc-900">{theme.name}</p>
                <p className="text-xs text-zinc-500">{theme.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Vurgu (birincil) renk</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="primaryColor"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-20 cursor-pointer rounded border border-zinc-300"
          />
          <span className="text-sm text-zinc-500 font-mono">{primaryColor}</span>
        </div>
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
