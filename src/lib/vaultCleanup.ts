import "server-only";
import fs from "fs/promises";
import path from "path";
import type { GearItem } from "./gear";

const FILE = path.join(process.cwd(), "data", "wishlist.json");
let memo: Record<string, number[][]> | null = null;

async function loadWishlist(): Promise<Record<string, number[][]>> {
  if (memo) return memo;
  try {
    memo = JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    memo = {};
  }
  return memo!;
}

export type Verdict = "godroll" | "exotic" | "locked" | "masterwork" | "junk" | "review";

export interface CleanupItem extends GearItem {
  verdict: Verdict;
  dupe: boolean;
  lightgg: string;
}

export interface VaultAnalysis {
  items: CleanupItem[];
  godRolls: CleanupItem[];
  exotics: CleanupItem[];
  junk: CleanupItem[];
  review: CleanupItem[];
  /** Te locken keepers (god rolls + exotics die nog niet gelockt zijn). */
  lockTargets: { instanceId: string; name: string }[];
  counts: { total: number; godroll: number; exotic: number; junk: number; review: number; lockable: number };
}

function isGodRoll(wishlist: Record<string, number[][]>, hash: number, perks: number[]): boolean {
  const combos = wishlist[String(hash)];
  if (!combos || combos.length === 0) return false;
  const have = new Set(perks);
  return combos.some((combo) => combo.every((p) => have.has(p)));
}

export async function analyzeVault(vault: GearItem[]): Promise<VaultAnalysis> {
  const wishlist = await loadWishlist();

  // Duplicaten tellen op basis van item-hash (zelfde wapen/armor).
  const counts = new Map<number, number>();
  for (const it of vault) counts.set(it.hash, (counts.get(it.hash) ?? 0) + 1);

  const items: CleanupItem[] = vault.map((it) => {
    const isWeapon = it.itemType === 3;
    const god = isWeapon && isGodRoll(wishlist, it.hash, it.perks);
    let verdict: Verdict;
    if (god) verdict = "godroll";
    else if (it.tier === "Exotic") verdict = "exotic";
    else if (it.locked) verdict = "locked";
    else if (it.masterwork) verdict = "masterwork";
    else if (it.tier === "Rare" || it.tier === "Uncommon" || it.tier === "Common") verdict = "junk";
    else verdict = "review";
    return { ...it, verdict, dupe: (counts.get(it.hash) ?? 1) > 1, lightgg: `https://light.gg/db/items/${it.hash}/` };
  });

  const godRolls = items.filter((i) => i.verdict === "godroll");
  const exotics = items.filter((i) => i.verdict === "exotic");
  const junk = items.filter((i) => i.verdict === "junk");
  const review = items.filter((i) => i.verdict === "review");
  const lockTargets = [...godRolls, ...exotics]
    .filter((i) => !i.locked && i.instanceId)
    .map((i) => ({ instanceId: i.instanceId!, name: i.name }));

  return {
    items,
    godRolls,
    exotics,
    junk,
    review,
    lockTargets,
    counts: { total: vault.length, godroll: godRolls.length, exotic: exotics.length, junk: junk.length, review: review.length, lockable: lockTargets.length },
  };
}
