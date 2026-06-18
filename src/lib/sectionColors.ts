/** Eén kleur per sectie, gebruikt in de nav én op de landingspagina-kaarten. */
export const SECTION_COLORS: Record<string, string> = {
  "/items": "#f5a623", // goud
  "/gear": "#4a9eff", // blauw
  "/builds": "#e0564b", // rood
  "/players": "#38d39f", // groen
  "/events": "#b58cf6", // paars
  "/changelog": "#4ad6c8", // teal
  "/sandbox": "#ff7eb6", // roze
  "/profile": "#7c6cff", // indigo
  "/community": "#ff9f1c", // amber/oranje
};

export function sectionColor(href: string): string {
  return SECTION_COLORS[href] ?? "var(--accent)";
}
