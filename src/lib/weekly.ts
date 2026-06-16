/**
 * "Deze week"-highlights die NIET betrouwbaar uit de Bungie API komen
 * (Nightfall-wapen, Legend Lost Sector + exotic-slot, featured dungeon/raid).
 * Dit is community-data — vul het wekelijks bij vanuit Bungie's TWID of een
 * site als blueberries.gg. Laat een veld leeg/undefined als je het niet weet.
 *
 * Tip: vraag Claude Code "ververs de weekly highlights" en ik vul dit via
 * web-research bij.
 */

export const WEEKLY_UPDATED = "2026-06-16"; // YYYY-MM-DD

export interface WeeklyHighlights {
  nightfall?: { activity: string; weapon: string };
  legendLostSector?: { name: string; exoticSlot: string };
  featuredDungeon?: string;
  featuredRaid?: string;
}

// Nog in te vullen — zie de bron-links op de Events-pagina.
export const WEEKLY: WeeklyHighlights = {};
