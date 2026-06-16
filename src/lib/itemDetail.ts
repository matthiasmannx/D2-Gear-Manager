import "server-only";
import { getEntityDefinition, icon } from "./bungie";


export interface Trait {
  name: string;
  description: string;
  icon: string | null;
}

export interface ItemDetail {
  hash: number;
  name: string;
  type: string;
  tier: string;
  classType: number;
  icon: string | null;
  screenshot: string | null;
  description: string;
  flavor: string;
  /** "Waar/hoe te krijgen" — uit de collectible source of displaySource. */
  source: string;
  /** Exotic intrinsieke trait (de perk die het exotic goed maakt). */
  intrinsic?: Trait;
  itemType: number;
}

/**
 * Vind de intrinsieke (exotic) trait. Werkt voor zowel wapens als armor: scan
 * alle sockets (singleInitialItemHash + reusablePlugItems) en pak de eerste plug
 * met itemType "Intrinsic" die een naam én beschrijving heeft. Voor armor zit
 * die soms in een latere socket (bv. Synthoceps "Biotic Enhancements").
 */
async function extractIntrinsic(def: any): Promise<Trait | null> {
  const entries = def?.sockets?.socketEntries ?? [];
  for (const e of entries) {
    const cands: number[] = [];
    if (e.singleInitialItemHash) cands.push(e.singleInitialItemHash);
    for (const rp of e.reusablePlugItems ?? []) {
      if (rp.plugItemHash) cands.push(rp.plugItemHash);
    }
    for (const ph of cands) {
      try {
        const pd = await getEntityDefinition("DestinyInventoryItemDefinition", ph);
        const isIntrinsic =
          pd?.itemTypeDisplayName === "Intrinsic" ||
          pd?.plug?.plugCategoryIdentifier === "intrinsics";
        const n = pd?.displayProperties?.name;
        const d = pd?.displayProperties?.description;
        if (isIntrinsic && n && d) {
          return { name: n, description: d, icon: icon(pd.displayProperties.icon) };
        }
      } catch {
        /* probeer volgende kandidaat */
      }
    }
  }
  return null;
}

async function acquisitionSource(def: any): Promise<string> {
  if (def?.collectibleHash) {
    try {
      const c = await getEntityDefinition("DestinyCollectibleDefinition", def.collectibleHash);
      if (c?.sourceString) return c.sourceString;
    } catch {
      /* val terug op displaySource */
    }
  }
  return def?.displaySource ?? "";
}

export async function getItemDetail(hash: number | string): Promise<ItemDetail | null> {
  const def = await getEntityDefinition("DestinyInventoryItemDefinition", hash);
  if (!def?.displayProperties?.name) return null;

  const [intrinsic, source] = await Promise.all([
    extractIntrinsic(def),
    acquisitionSource(def),
  ]);

  return {
    hash: def.hash,
    name: def.displayProperties.name,
    type: def.itemTypeDisplayName ?? "",
    tier: def.inventory?.tierTypeName ?? "",
    classType: def.classType ?? 3,
    icon: icon(def.displayProperties.icon),
    screenshot: def.screenshot ? icon(def.screenshot) : null,
    description: def.displayProperties.description ?? "",
    flavor: def.flavorText ?? "",
    source,
    intrinsic: intrinsic ?? undefined,
    itemType: def.itemType ?? 0,
  };
}

/** Alleen de exotic intrinsieke trait (voor het gear-paneel). */
export async function getExoticTrait(hash: number | string): Promise<Trait | null> {
  const def = await getEntityDefinition("DestinyInventoryItemDefinition", hash);
  if (def?.inventory?.tierTypeName !== "Exotic") return null;
  return extractIntrinsic(def);
}
