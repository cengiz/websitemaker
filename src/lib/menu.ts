export type MenuItem = {
  key: string;
  label: string;
  path: string;
  enabled: boolean;
};

export const DEFAULT_MENU: MenuItem[] = [
  { key: "home", label: "Anasayfa", path: "", enabled: true },
  { key: "products", label: "Ürünler", path: "urunler", enabled: true },
  { key: "news", label: "Blog", path: "blog", enabled: true },
  { key: "contact", label: "İletişim", path: "iletisim", enabled: true },
];

export function parseMenu(json: string | null | undefined): MenuItem[] {
  if (!json) return DEFAULT_MENU;
  try {
    return JSON.parse(json) as MenuItem[];
  } catch {
    return DEFAULT_MENU;
  }
}

export function buildMenuItems(base: string, items: MenuItem[]) {
  return items
    .filter((i) => i.enabled)
    .map((i) => ({ label: i.label, href: i.path === "" ? base : `${base}/${i.path}` }));
}
