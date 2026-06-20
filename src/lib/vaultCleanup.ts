import "server-only";
import type { GearItem } from "./gear";

export type Verdict = "godroll" | "armorgood" | "exotic" | "locked" | "masterwork" | "junk" | "review";

export interface CleanupItem extends GearItem {
  verdict: Verdict;
  dupe: boolean;
  lightgg: string;
  statTotal?: number; // som van de armor-stats (Armor 3.0)
  rollPve?: boolean; // god roll voor PvE
  rollPvp?: boolean; // god roll voor PvP
}

export interface VaultAnalysis {
  items: CleanupItem[];
  godRolls: CleanupItem[];
  armorGood: CleanupItem[];
  exotics: CleanupItem[];
  masterworks: CleanupItem[];
  junk: CleanupItem[];
  review: CleanupItem[];
  /** Te locken keepers (god rolls + goede armor + exotics + masterworks). */
  lockTargets: { instanceId: string; name: string }[];
  counts: { total: number; godroll: number; armorgood: number; exotic: number; masterwork: number; junk: number; review: number; lockable: number };
  armorMin: number;
}

export async function analyzeVault(vault: GearItem[], armorMin = 65): Promise<VaultAnalysis> {
  // Duplicaten tellen op basis van item-hash (zelfde wapen/armor).
  const counts = new Map<number, number>();
  for (const it of vault) counts.set(it.hash, (counts.get(it.hash) ?? 0) + 1);

  const items: CleanupItem[] = vault.map((it) => {
    const isWeapon = it.itemType === 3;
    const isArmor = it.itemType === 2;
    const statTotal = isArmor ? it.stats.reduce((s, x) => s + (x.value || 0), 0) : undefined;
    // God-roll-tags zijn al door loadGear gezet met de drempel van de gebruiker.
    const god = isWeapon && (it.rollPve || it.rollPvp);
    let verdict: Verdict;
    if (god) verdict = "godroll";
    else if (it.tier === "Exotic") verdict = "exotic";
    else if (it.locked) verdict = "locked";
    // T5-armor (hoogste tier) of armor met genoeg stat-totaal = keeper.
    else if (isArmor && (it.gearTier === 5 || (statTotal != null && statTotal >= armorMin))) verdict = "armorgood";
    else if (it.masterwork || it.crafted) verdict = "masterwork"; // crafted nooit als junk
    else if (it.tier === "Rare" || it.tier === "Uncommon" || it.tier === "Common") verdict = "junk";
    else verdict = "review";
    return { ...it, verdict, dupe: (counts.get(it.hash) ?? 1) > 1, lightgg: `https://light.gg/db/items/${it.hash}/`, statTotal };
  });

  const godRolls = items.filter((i) => i.verdict === "godroll");
  const armorGood = items.filter((i) => i.verdict === "armorgood").sort((a, b) => (b.statTotal ?? 0) - (a.statTotal ?? 0));
  const exotics = items.filter((i) => i.verdict === "exotic");
  const masterworks = items.filter((i) => i.verdict === "masterwork");
  const junk = items.filter((i) => i.verdict === "junk");
  const review = items.filter((i) => i.verdict === "review");
  const lockTargets = [...godRolls, ...armorGood, ...exotics, ...masterworks]
    .filter((i) => !i.locked && i.instanceId)
    .map((i) => ({ instanceId: i.instanceId!, name: i.name }));

  return {
    items,
    godRolls,
    armorGood,
    exotics,
    masterworks,
    junk,
    review,
    lockTargets,
    counts: { total: vault.length, godroll: godRolls.length, armorgood: armorGood.length, exotic: exotics.length, masterwork: masterworks.length, junk: junk.length, review: review.length, lockable: lockTargets.length },
    armorMin,
  };
}
