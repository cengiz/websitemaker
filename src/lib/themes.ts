import type { CSSProperties } from "react";

export type ThemeLayout = "classic" | "minimal" | "bold" | "editorial";

export type ThemeVars = {
  "--site-bg": string;
  "--site-fg": string;
  "--site-muted": string;
  "--site-card": string;
  "--site-border": string;
  "--site-primary": string;
  "--site-primary-fg": string;
  "--site-font": string;
  "--site-heading-font": string;
  "--site-radius": string;
  "--site-shadow": string;
};

export type Theme = {
  key: string;
  name: string;
  description: string;
  layout: ThemeLayout;
  fontUrl?: string;
  vars: ThemeVars;
};

export const THEMES: Theme[] = [
  {
    key: "classic",
    name: "Klasik",
    description: "Nötr ve sade — gri tonlar, her sektöre uyar.",
    layout: "classic",
    vars: {
      "--site-bg": "#ffffff",
      "--site-fg": "#1f2937",
      "--site-muted": "#6b7280",
      "--site-card": "#f9fafb",
      "--site-border": "#e5e7eb",
      "--site-primary": "#1f2937",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Arial, Helvetica, sans-serif",
      "--site-heading-font": "Arial, Helvetica, sans-serif",
      "--site-radius": "8px",
      "--site-shadow": "0 1px 4px rgba(0,0,0,0.07)",
    },
  },
  {
    key: "modern",
    name: "Modern",
    description: "Canlı mavi vurgular, teknoloji ve hizmet siteleri için.",
    layout: "minimal",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#ffffff",
      "--site-fg": "#0f172a",
      "--site-muted": "#64748b",
      "--site-card": "#f1f5f9",
      "--site-border": "#e2e8f0",
      "--site-primary": "#2563eb",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Inter, 'Segoe UI', system-ui, sans-serif",
      "--site-heading-font": "Inter, 'Segoe UI', system-ui, sans-serif",
      "--site-radius": "10px",
      "--site-shadow": "0 2px 8px rgba(37,99,235,0.08)",
    },
  },
  {
    key: "warm",
    name: "Sıcak",
    description: "Turuncu/kehribar tonlar, restoran ve perakende için.",
    layout: "editorial",
    vars: {
      "--site-bg": "#fffbf5",
      "--site-fg": "#3f2d1c",
      "--site-muted": "#92704f",
      "--site-card": "#fdf1e3",
      "--site-border": "#f2dfc6",
      "--site-primary": "#ea580c",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Georgia, 'Times New Roman', serif",
      "--site-heading-font": "Georgia, 'Times New Roman', serif",
      "--site-radius": "8px",
      "--site-shadow": "0 2px 8px rgba(234,88,12,0.08)",
    },
  },
  {
    key: "nature",
    name: "Doğa",
    description: "Yeşil tonlar, sağlık, tarım ve sürdürülebilirlik için.",
    layout: "classic",
    vars: {
      "--site-bg": "#f7fdf8",
      "--site-fg": "#1c3324",
      "--site-muted": "#5b7a68",
      "--site-card": "#eaf6ee",
      "--site-border": "#d4ead9",
      "--site-primary": "#16a34a",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'Segoe UI', system-ui, sans-serif",
      "--site-heading-font": "'Segoe UI', system-ui, sans-serif",
      "--site-radius": "10px",
      "--site-shadow": "0 2px 8px rgba(22,163,74,0.08)",
    },
  },
  {
    key: "dark",
    name: "Koyu",
    description: "Koyu zemin, şık ve premium görünüm.",
    layout: "minimal",
    vars: {
      "--site-bg": "#0f1115",
      "--site-fg": "#f4f4f5",
      "--site-muted": "#a1a1aa",
      "--site-card": "#1a1d23",
      "--site-border": "#2b2f38",
      "--site-primary": "#eab308",
      "--site-primary-fg": "#1a1a1a",
      "--site-font": "'Segoe UI', system-ui, sans-serif",
      "--site-heading-font": "'Segoe UI', system-ui, sans-serif",
      "--site-radius": "10px",
      "--site-shadow": "0 4px 16px rgba(0,0,0,0.4)",
    },
  },
  {
    key: "midnight",
    name: "Midnight",
    description: "Derin lacivert zemin, elektrik mavisi vurgu. Yazılım ve SaaS.",
    layout: "bold",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#060d1f",
      "--site-fg": "#e2e8f0",
      "--site-muted": "#64748b",
      "--site-card": "#0d1a33",
      "--site-border": "#1e3a5f",
      "--site-primary": "#3b82f6",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Inter, system-ui, sans-serif",
      "--site-heading-font": "Inter, system-ui, sans-serif",
      "--site-radius": "12px",
      "--site-shadow": "0 4px 24px rgba(0,0,0,0.5)",
    },
  },
  {
    key: "rose",
    name: "Rose",
    description: "Pembe ve krem tonlar. Moda, güzellik ve yaşam tarzı.",
    layout: "minimal",
    fontUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap",
    vars: {
      "--site-bg": "#fff5f7",
      "--site-fg": "#500724",
      "--site-muted": "#9f6b7e",
      "--site-card": "#fce7f3",
      "--site-border": "#fbcfe8",
      "--site-primary": "#e11d48",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'DM Sans', system-ui, sans-serif",
      "--site-heading-font": "'DM Sans', system-ui, sans-serif",
      "--site-radius": "16px",
      "--site-shadow": "0 2px 12px rgba(225,29,72,0.10)",
    },
  },
  {
    key: "slate",
    name: "Slate",
    description: "Soğuk griler ve firuze vurgu. Kurumsal ve danışmanlık.",
    layout: "classic",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#f8fafc",
      "--site-fg": "#0f172a",
      "--site-muted": "#475569",
      "--site-card": "#f1f5f9",
      "--site-border": "#cbd5e1",
      "--site-primary": "#0d9488",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Inter, system-ui, sans-serif",
      "--site-heading-font": "Inter, system-ui, sans-serif",
      "--site-radius": "6px",
      "--site-shadow": "0 1px 6px rgba(13,148,136,0.08)",
    },
  },
  {
    key: "obsidian",
    name: "Obsidian",
    description: "Saf siyah zemin, altın vurgu. Premium ve lüks markalar.",
    layout: "editorial",
    fontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap",
    vars: {
      "--site-bg": "#0a0a0a",
      "--site-fg": "#f5f0e8",
      "--site-muted": "#a39880",
      "--site-card": "#161616",
      "--site-border": "#2a2a2a",
      "--site-primary": "#d4a843",
      "--site-primary-fg": "#0a0a0a",
      "--site-font": "'DM Sans', system-ui, sans-serif",
      "--site-heading-font": "'Playfair Display', Georgia, serif",
      "--site-radius": "4px",
      "--site-shadow": "0 4px 20px rgba(0,0,0,0.6)",
    },
  },
  {
    key: "sage",
    name: "Sage",
    description: "Soluk yeşil tonlar. Sağlık, wellness ve organik ürünler.",
    layout: "minimal",
    fontUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap",
    vars: {
      "--site-bg": "#f2f5f2",
      "--site-fg": "#1e2d1e",
      "--site-muted": "#6b7d6b",
      "--site-card": "#e6ede6",
      "--site-border": "#c8d8c8",
      "--site-primary": "#4a7c59",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'DM Sans', system-ui, sans-serif",
      "--site-heading-font": "'DM Sans', system-ui, sans-serif",
      "--site-radius": "12px",
      "--site-shadow": "0 2px 10px rgba(74,124,89,0.10)",
    },
  },
  {
    key: "violet",
    name: "Violet",
    description: "Zengin mor tonlar. Yaratıcı ajanslar ve dijital stüdyolar.",
    layout: "bold",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#faf5ff",
      "--site-fg": "#2e1065",
      "--site-muted": "#7c3aed",
      "--site-card": "#ede9fe",
      "--site-border": "#ddd6fe",
      "--site-primary": "#7c3aed",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Inter, system-ui, sans-serif",
      "--site-heading-font": "Inter, system-ui, sans-serif",
      "--site-radius": "14px",
      "--site-shadow": "0 2px 12px rgba(124,58,237,0.12)",
    },
  },
  {
    key: "terracotta",
    name: "Terracotta",
    description: "Toprak ve kilden ilham. El sanatları, butik ve gastronomi.",
    layout: "editorial",
    fontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500&display=swap",
    vars: {
      "--site-bg": "#fdf8f5",
      "--site-fg": "#2c1a10",
      "--site-muted": "#8b5e4a",
      "--site-card": "#f5ece5",
      "--site-border": "#e8d5c4",
      "--site-primary": "#c2522b",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'DM Sans', system-ui, sans-serif",
      "--site-heading-font": "'Playfair Display', Georgia, serif",
      "--site-radius": "8px",
      "--site-shadow": "0 2px 10px rgba(194,82,43,0.10)",
    },
  },
  {
    key: "arctic",
    name: "Arctic",
    description: "Buzul beyazı ve buz mavisi. Temiz, minimal teknoloji.",
    layout: "minimal",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#f0f7ff",
      "--site-fg": "#0c2340",
      "--site-muted": "#4a7490",
      "--site-card": "#e0f0ff",
      "--site-border": "#b8d8f0",
      "--site-primary": "#0369a1",
      "--site-primary-fg": "#ffffff",
      "--site-font": "Inter, system-ui, sans-serif",
      "--site-heading-font": "Inter, system-ui, sans-serif",
      "--site-radius": "10px",
      "--site-shadow": "0 2px 10px rgba(3,105,161,0.08)",
    },
  },
  {
    key: "monochrome",
    name: "Monochrome",
    description: "Saf siyah-beyaz. Typografi odaklı, ultra minimal.",
    layout: "editorial",
    fontUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#ffffff",
      "--site-fg": "#000000",
      "--site-muted": "#737373",
      "--site-card": "#f5f5f5",
      "--site-border": "#e5e5e5",
      "--site-primary": "#000000",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'DM Sans', system-ui, sans-serif",
      "--site-heading-font": "'DM Sans', system-ui, sans-serif",
      "--site-radius": "0px",
      "--site-shadow": "none",
    },
  },
  {
    key: "forest",
    name: "Forest",
    description: "Derin koyu yeşil. Lüks ve doğal markalar için.",
    layout: "editorial",
    fontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap",
    vars: {
      "--site-bg": "#0b1a10",
      "--site-fg": "#d4edda",
      "--site-muted": "#6aad7a",
      "--site-card": "#102018",
      "--site-border": "#1a3a25",
      "--site-primary": "#2ecc71",
      "--site-primary-fg": "#0b1a10",
      "--site-font": "'DM Sans', system-ui, sans-serif",
      "--site-heading-font": "'Playfair Display', Georgia, serif",
      "--site-radius": "10px",
      "--site-shadow": "0 4px 20px rgba(0,0,0,0.5)",
    },
  },
  {
    key: "powerhouse",
    name: "Powerhouse",
    description: "Saf siyah, neon yeşil vurgu. Spor salonları ve fitness için.",
    layout: "editorial",
    fontUrl: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#0a0a0a",
      "--site-fg": "#f0eeeb",
      "--site-muted": "#666666",
      "--site-card": "#141414",
      "--site-border": "#222222",
      "--site-primary": "#c8f535",
      "--site-primary-fg": "#0a0a0a",
      "--site-font": "Oswald, 'Arial Narrow', Arial, sans-serif",
      "--site-heading-font": "Oswald, 'Arial Narrow', Arial, sans-serif",
      "--site-radius": "0px",
      "--site-shadow": "0 4px 24px rgba(200,245,53,0.12)",
    },
  },
  {
    key: "serenity",
    name: "Serenity",
    description: "Sıcak beyaz ve muted lavender. Psikoloji, terapi ve koçluk için.",
    layout: "minimal",
    fontUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
    vars: {
      "--site-bg": "#fefcf9",
      "--site-fg": "#1a1917",
      "--site-muted": "#8a8278",
      "--site-card": "#f5f2ec",
      "--site-border": "#e5dfd5",
      "--site-primary": "#9b7fa6",
      "--site-primary-fg": "#ffffff",
      "--site-font": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--site-heading-font": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--site-radius": "20px",
      "--site-shadow": "0 2px 16px rgba(155,127,166,0.12)",
    },
  },
];

export const DEFAULT_THEME_KEY = "classic";

export function getTheme(key: string | null | undefined): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

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
