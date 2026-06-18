/**
 * Sandbox changes (buffs & nerfs) per Bungie's patch notes. Editorial, the API
 * doesn't provide this. Add new changes per update; fill `url` with the official
 * patch notes. Ask Claude "refresh the buffs and nerfs" to update via web
 * research. Content language: English.
 */

export type ChangeKind = "buff" | "nerf" | "change";

export interface SandboxChange {
  subject: string;
  kind: ChangeKind;
  category: "Weapons" | "Abilities" | "Exotics" | "Crucible" | "Other";
  note: string;
  version: string;
  date: string; // YYYY-MM-DD
  url?: string;
}

const U970 = "https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0";

export const SANDBOX_CHANGES: SandboxChange[] = [
  // --- Update 9.7.0 (archetype-level from the patch notes) ---
  {
    subject: "Lightweight Pulse Rifles",
    kind: "nerf", category: "Weapons", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Base and critical damage reduced.",
  },
  {
    subject: "Rapid-Fire Scout Rifles",
    kind: "nerf", category: "Weapons", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Damage reduced.",
  },
  {
    subject: "Aggressive Hand Cannons",
    kind: "nerf", category: "Weapons", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Small damage decrease.",
  },
  {
    subject: "Charge weapon (PvE)",
    kind: "buff", category: "Weapons", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "+20% charge rate and +20% impact damage on charged shots (PvE only).",
  },
  {
    subject: "Previously nerfed weapon",
    kind: "buff", category: "Weapons", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "Previous nerf reverted ~70%, combo damage and self-heal largely restored.",
  },
  {
    subject: "Rocket Pulse",
    kind: "change", category: "Weapons", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "+11% Anticipation per point of damage to offset a damage nerf.",
  },
  {
    subject: "Weapon trait buff priority",
    kind: "change", category: "Other", version: "9.7.0", date: "2026-06-09", url: U970,
    note: "More important buffs are overwritten less easily; perk HUD buffs now require the active weapon.",
  },
];
