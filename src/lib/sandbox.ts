/**
 * Sandbox-wijzigingen (buffs & nerfs) volgens Bungie's patch notes. Redactioneel
 * — de API levert dit niet. Voeg nieuwe wijzigingen toe per update; vul `url`
 * met de officiële patchnotes. Vraag Claude "ververs de buffs en nerfs" om dit
 * via web-research bij te werken.
 */

export type ChangeKind = "buff" | "nerf" | "change";

export interface SandboxChange {
  subject: string;
  kind: ChangeKind;
  category: "Wapens" | "Abilities" | "Exotics" | "Crucible" | "Overig";
  note: string;
  version: string;
  date: string; // YYYY-MM-DD
  url?: string;
}

const U970 = "https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0";

export const SANDBOX_CHANGES: SandboxChange[] = [
  // --- Update 9.7.0 (archetype-niveau uit de patch notes) ---
  {
    subject: "Lightweight Pulse Rifles",
    kind: "nerf", category: "Wapens", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Base- en critical damage verlaagd.",
  },
  {
    subject: "Rapid-Fire Scout Rifles",
    kind: "nerf", category: "Wapens", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Damage verlaagd.",
  },
  {
    subject: "Aggressive Hand Cannons",
    kind: "nerf", category: "Wapens", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Kleine damage-afname.",
  },
  {
    subject: "Charge-wapen (PvE)",
    kind: "buff", category: "Wapens", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "+20% charge rate en +20% impact-damage van geladen schoten (alleen PvE).",
  },
  {
    subject: "Eerder generfd wapen",
    kind: "buff", category: "Wapens", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Vorige nerf ~70% teruggedraaid — combo-damage en self-heal grotendeels hersteld.",
  },
  {
    subject: "Rocket Pulse",
    kind: "change", category: "Wapens", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "+11% Anticipation per punt damage ter compensatie van een damage-nerf.",
  },
  {
    subject: "Weapon trait buff-prioriteit",
    kind: "change", category: "Overig", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Belangrijkere buffs worden minder snel weggedrukt; perk-HUD buffs vereisen nu het actieve wapen.",
  },
];
