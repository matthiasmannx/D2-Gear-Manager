import "server-only";
import { searchItemIndex } from "./manifest";
import { getEntityDefinition, icon } from "./bungie";

/** Een naar de manifest geresolved item, met info voor de hover-tooltip. */
export interface ResolvedItem {
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  description: string;
  flavor: string;
}

/**
 * Zoek een item op naam in de manifest en haal de rijke definitie op (voor de
 * tooltip-omschrijving). Namen als "Synthoceps of Wormgod Caress" of
 * "Lucky Pants of FR0ST-EE5" pakken we op het eerste alternatief.
 */
export async function resolveItemByName(name: string): Promise<ResolvedItem | null> {
  // Alleen op " / " splitsen (alternatieven). NIET op " of " — dat hoort in
  // namen als "Heart of Inmost Light" / "Crown of Tempests".
  const query = name.split(/\s\/\s/)[0].trim();
  const hits = await searchItemIndex(query, 8);
  if (hits.length === 0) return null;

  // Voorkeur voor een exotic-treffer (build-exotics zijn exotic).
  const pick = hits.find((h) => h.tier === "Exotic") ?? hits[0];
  let description = "";
  let flavor = "";
  try {
    const def = await getEntityDefinition("DestinyInventoryItemDefinition", pick.hash);
    description = def?.displayProperties?.description ?? "";
    flavor = def?.flavorText ?? "";
  } catch {
    /* tooltip valt terug op alleen naam/type */
  }

  return {
    hash: pick.hash,
    name: pick.name,
    icon: icon(pick.icon),
    type: pick.type,
    tier: pick.tier,
    description,
    flavor,
  };
}

/** Resolve een lijst namen parallel; ontbrekende worden null. */
export async function resolveItems(
  names: (string | undefined)[]
): Promise<(ResolvedItem | null)[]> {
  return Promise.all(names.map((n) => (n ? resolveItemByName(n) : Promise.resolve(null))));
}
