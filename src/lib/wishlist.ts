import "server-only";
import fs from "fs/promises";
import path from "path";

interface Roll { p: number[]; t: number } // t: 0 algemeen, 1 PvE, 2 PvP

const FILE = path.join(process.cwd(), "data", "wishlist.json");
let memo: Record<string, Roll[]> | null = null;

export async function loadWishlist(): Promise<Record<string, Roll[]>> {
  if (!memo) {
    try {
      memo = JSON.parse(await fs.readFile(FILE, "utf8"));
    } catch {
      memo = {};
    }
  }
  return memo!;
}

/**
 * Match een wapen-roll tegen de wishlist. `minMatch` = hoeveel perks van een
 * aanbevolen combo minimaal aanwezig moeten zijn (gebruiker stelt dit zelf in;
 * 4 = volledige roll, lager = soepeler). loadWishlist() moet eerst gedraaid zijn.
 */
export function rollTags(hash: number, perks: number[], minMatch = 4): { match: boolean; pve: boolean; pvp: boolean } {
  const rolls = memo?.[String(hash)];
  if (!rolls || rolls.length === 0) return { match: false, pve: false, pvp: false };
  const have = new Set(perks);
  let match = false, pve = false, pvp = false;
  for (const r of rolls) {
    let hit = 0;
    for (const p of r.p) if (have.has(p)) hit++;
    if (hit >= minMatch) {
      match = true;
      if (r.t === 1) pve = true;
      else if (r.t === 2) pvp = true;
      else { pve = true; pvp = true; }
    }
  }
  return { match, pve, pvp };
}
