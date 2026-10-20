/**
 * "Deze week"-highlights die NIET betrouwbaar uit de Bungie API komen
 * (Nightfall-wapen, Legend Lost Sector + exotic-slot, featured dungeon/raid).
 * Dit is community-data, vul het wekelijks bij vanuit Bungie's TWID of een
 * site als blueberries.gg. Laat een veld leeg/undefined als je het niet weet.
 *
 * Tip: vraag Claude Code "ververs de weekly highlights" en ik vul dit via
 * web-research bij.
 */

export const WEEKLY_UPDATED = "2026-10-20"; // YYYY-MM-DD

export interface WeeklyHighlights {
  nightfall?: { activity: string; weapon: string };
  legendLostSector?: { name: string; exoticSlot: string };
  featuredDungeon?: string;
  featuredRaid?: string;
}

// 20-27 oktober 2026. Sinds The Edge of Fate is er geen wekelijkse
// Grandmaster Nightfall meer (Nightfalls roteren nu dagelijks); de wekelijkse
// premium-vanguardactiviteit is de Grandmaster Vanguard Alert.
// Featured raid/dungeon deze week weggelaten: bron noemt twee raids
// (King's Fall + Garden of Salvation) en twee dungeons (Sundered Doctrine +
// Grasp of Avarice) zonder één duidelijke rotator.
export const WEEKLY: WeeklyHighlights = {
  nightfall: {
    activity: "Grandmaster Vanguard Alert: Birthplace of the Vile",
    weapon: "Null Composure",
  },
};
