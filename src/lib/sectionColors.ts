/** Eén kleur per sectie, gebruikt in de nav én op de landingspagina-kaarten. */
// Elke sectie een eigen, duidelijk verschillende kleur (over de hele hue-wheel).
export const SECTION_COLORS: Record<string, string> = {
  "/items": "#f5a623", // oranje/goud
  "/power": "#ffd23f", // geel
  "/weekly": "#a8d83a", // lime
  "/players": "#34c759", // groen
  "/changelog": "#22c5d8", // cyaan
  "/gear": "#3aa0ff", // blauw
  "/clan": "#6d8cff", // periwinkle
  "/profile": "#9b6cff", // violet
  "/events": "#c06cf6", // paars
  "/community": "#ff5c8a", // roze
  "/builds": "#e0564b", // rood
  "/sandbox": "#ff8a3d", // (samengevoegd in changelog; behoudt eigen tint)
};

export function sectionColor(href: string): string {
  return SECTION_COLORS[href] ?? "var(--accent)";
}
