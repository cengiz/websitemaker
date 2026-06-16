"use client";

import { useState } from "react";
import { THEMES, resolveThemeVars } from "@/lib/themes";

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

  const previewVars = resolveThemeVars(themeKey, JSON.stringify({ "--site-primary": primaryColor }));

  return (
    <form action={action} className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6">
      <input type="hidden" name="themeKey" value={themeKey} />

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-700">Tema şablonu</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              type="button"
              onClick={() => selectTheme(theme.key)}
              className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition ${
                themeKey === theme.key ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <div className="flex gap-2">
                <span className="h-6 w-6 rounded-full border" style={{ background: theme.vars["--site-primary"] }} />
                <span className="h-6 w-6 rounded-full border" style={{ background: theme.vars["--site-bg"] }} />
                <span className="h-6 w-6 rounded-full border" style={{ background: theme.vars["--site-card"] }} />
              </div>
              <p className="font-medium">{theme.name}</p>
              <p className="text-xs text-zinc-500">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Vurgu (birincil) renk</span>
        <input
          type="color"
          name="primaryColor"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded border border-zinc-300"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700">Önizleme</p>
        <div
          className="rounded-lg border p-4"
          style={{
            background: previewVars["--site-bg"],
            color: previewVars["--site-fg"],
            borderColor: previewVars["--site-border"],
            fontFamily: previewVars["--site-font"],
          }}
        >
          <p className="font-semibold">Örnek Site Adı</p>
          <p className="mt-1 text-sm" style={{ color: previewVars["--site-muted"] }}>
            Bu bir örnek slogan metnidir.
          </p>
          <span
            className="mt-3 inline-block rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ background: previewVars["--site-primary"], color: previewVars["--site-primary-fg"] }}
          >
            Vurgu Buton
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Kaydet
      </button>
    </form>
  );
}
