import type { CSSProperties } from "react";

export type ThemeVars = {
  "--site-bg": string;
  "--site-fg": string;
  "--site-muted": string;
  "--site-card": string;
  "--site-border": string;
  "--site-primary": string;
  "--site-primary-fg": string;
  "--site-font": string;
};

export type Theme = {
  key: string;
  name: string;
  description: string;
  vars: ThemeVars;
};

export const THEMES: Theme[] = [
  {
    key: "classic",
    name: "Klasik",
    description: "Nötr ve sade — gri tonlar, her sektöre uyar.",
    vars: {
      "--site-bg": "#ffffff",
      "--site-fg": "#1f2937",
      "--site-muted": "#6b7280",
      "--site-card": "#f9fafb",
      "--site-border": "#e5e7eb",
      "--site-primary": "#1f2937",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Arial, Helvetica, sans-serif",
    },
  },
  {
    key: "modern",
    name: "Modern",
    description: "Canlı mavi vurgular, teknoloji ve hizmet siteleri için.",
    vars: {
      "--site-bg": "#ffffff",
      "--site-fg": "#0f172a",
      "--site-muted": "#64748b",
      "--site-card": "#f1f5f9",
      "--site-border": "#e2e8f0",
      "--site-primary": "#2563eb",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'Segoe UI', system-ui, sans-serif",
    },
  },
  {
    key: "warm",
    name: "Sıcak",
    description: "Turuncu/kehribar tonlar, restoran ve perakende için.",
    vars: {
      "--site-bg": "#fffbf5",
      "--site-fg": "#3f2d1c",
      "--site-muted": "#92704f",
      "--site-card": "#fdf1e3",
      "--site-border": "#f2dfc6",
      "--site-primary": "#ea580c",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Georgia, 'Times New Roman', serif",
    },
  },
  {
    key: "nature",
    name: "Doğa",
    description: "Yeşil tonlar, sağlık, tarım ve sürdürülebilirlik için.",
    vars: {
      "--site-bg": "#f7fdf8",
      "--site-fg": "#1c3324",
      "--site-muted": "#5b7a68",
      "--site-card": "#eaf6ee",
      "--site-border": "#d4ead9",
      "--site-primary": "#16a34a",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'Segoe UI', system-ui, sans-serif",
    },
  },
  {
    key: "dark",
    name: "Koyu",
    description: "Koyu zemin, şık ve premium görünüm.",
    vars: {
      "--site-bg": "#0f1115",
      "--site-fg": "#f4f4f5",
      "--site-muted": "#a1a1aa",
      "--site-card": "#1a1d23",
      "--site-border": "#2b2f38",
      "--site-primary": "#eab308",
      "--site-primary-fg": "#1a1a1a",
      "--site-font": "'Segoe UI', system-ui, sans-serif",
    },
  },
];

export const DEFAULT_THEME_KEY = "classic";

export function getTheme(key: string | null | undefined): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

/**
 * Merges a theme's base vars with an optional per-site override (stored as
 * JSON in Site.themeConfig), so panel users can tweak individual colors
 * without defining a whole new theme.
 */
export function resolveThemeVars(
  themeKey: string | null | undefined,
  themeConfigJson: string | null | undefined
): ThemeVars {
  const base = getTheme(themeKey).vars;

  if (!themeConfigJson) return base;

  try {
    const override = JSON.parse(themeConfigJson) as Partial<ThemeVars>;
    return { ...base, ...override };
  } catch {
    return base;
  }
}

export function themeVarsToStyle(vars: ThemeVars): CSSProperties {
  return vars as unknown as CSSProperties;
}
