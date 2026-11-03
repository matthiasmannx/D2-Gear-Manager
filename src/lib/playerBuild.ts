import "server-only";
import { bungieFetch, icon } from "./bungie";
import { lookupItems, getStatNames } from "./manifest";

// Armor 3.0-stats (alleen deze tonen op armor-stukken).
const ARMOR_STAT_NAMES = new Set(["Weapons", "Health", "Class", "Grenade", "Super", "Melee"]);

/**
 * Publieke "build"-weergave van een speler: huidige uitrusting + perks per
 * character (weapons, armor, subclass). Let op: dit is de ACTUELE uitrusting -
 * de Bungie API bewaart niet welke build iemand in een specifieke match droeg.
 */

const SLOTS: { bucket: number; label: string }[] = [
  { bucket: 3284755031, label: "Subclass" },
  { bucket: 1498876634, label: "Kinetic" },
  { bucket: 2465295065, label: "Energy" },
  { bucket: 953998645, label: "Power" },
  { bucket: 3448274439, label: "Helm" },
  { bucket: 3551918588, label: "Arms" },
  { bucket: 14239492, label: "Chest" },
  { bucket: 20886954, label: "Legs" },
  { bucket: 1585787867, label: "Class" },
];
const SLOT_ORDER = SLOTS.map((s) => s.bucket);
export const CLASS_NAMES: Record<number, string> = { 0: "Titan", 1: "Hunter", 2: "Warlock", 3: "Guardian" };

export interface BuildItem {
  hash: number;
  name: string;
  icon: string | null;
  tier: string;
  slot: string;
  power?: number;
  perks: string[];
  stats: { name: string; value: number }[];
}
export interface BuildCharacter {
  classType: number;
  light: number;
  items: BuildItem[];
}
export interface PlayerBuild {
  name: string | null;
  characters: BuildCharacter[];
}

function slotOf(bucket: number): string | null {
  const s = SLOTS.find((x) => x.bucket === bucket);
  return s ? s.label : null;
}

export async function getPlayerBuild(
  membershipType: number,
  membershipId: string
): Promise<PlayerBuild | null> {
  const r = await bungieFetch<any>(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200,205,300,304,305`,
    { revalidate: 60 * 15 }
  );
  const charData = r?.characters?.data ?? {};
  if (Object.keys(charData).length === 0) return null;

  const itemStats = r?.itemComponents?.stats?.data ?? {};
  const statNames = await getStatNames();

  const ui = r?.profile?.data?.userInfo ?? {};
  const name = ui.bungieGlobalDisplayName ? `${ui.bungieGlobalDisplayName}#${ui.bungieGlobalDisplayNameCode}` : ui.displayName ?? null;

  const equip = r?.characterEquipment?.data ?? {};
  const instances = r?.itemComponents?.instances?.data ?? {};
  const sockets = r?.itemComponents?.sockets?.data ?? {};

  // Verzamel alle equipped item-hashes + plug-hashes voor naam-resolutie.
  const itemHashes = new Set<number>();
  const plugHashes = new Set<number>();
  for (const cid of Object.keys(equip)) {
    for (const it of equip[cid]?.items ?? []) {
      if (!slotOf(it.bucketHash)) continue;
      itemHashes.add(it.itemHash);
      for (const s of sockets[it.itemInstanceId]?.sockets ?? []) {
        if (s.plugHash && s.isVisible !== false) plugHashes.add(s.plugHash);
      }
    }
  }
  const defs = await lookupItems([...itemHashes, ...plugHashes]);

  const skipPerk = (n: string) =>
    !n || /^(Empty|Default|Restore Defaults)/i.test(n) || /Shader|Ornament|Tracker|Memento/i.test(n);

  const characters: BuildCharacter[] = Object.values<any>(charData).map((c) => {
    const items: BuildItem[] = (equip[c.characterId]?.items ?? [])
      .filter((it: any) => slotOf(it.bucketHash))
      .map((it: any) => {
        const d = defs.get(it.itemHash);
        const inst = it.itemInstanceId ? instances[it.itemInstanceId] : null;
        const perks = (sockets[it.itemInstanceId]?.sockets ?? [])
          .map((s: any) => defs.get(s.plugHash)?.name)
          .filter((n: any): n is string => !!n && !skipPerk(n));
        // Armor 3.0-stats (alleen op armor).
        let stats: { name: string; value: number }[] = [];
        if (d?.itemType === 2 && it.itemInstanceId) {
          const sv = itemStats[it.itemInstanceId]?.stats ?? {};
          stats = Object.values<any>(sv)
            .map((s) => ({ name: statNames[s.statHash] ?? "", value: s.value ?? 0 }))
            .filter((s) => ARMOR_STAT_NAMES.has(s.name));
        }
        return {
          hash: it.itemHash,
          name: d?.name ?? "Onbekend",
          icon: icon(d?.icon ?? null),
          tier: d?.tier ?? "",
          slot: slotOf(it.bucketHash)!,
          power: inst?.primaryStat?.value,
          perks: [...new Set(perks)].slice(0, 6),
          stats,
        };
      })
      .sort(
        (a: BuildItem, b: BuildItem) =>
          SLOT_ORDER.indexOf(SLOTS.find((s) => s.label === a.slot)!.bucket) -
          SLOT_ORDER.indexOf(SLOTS.find((s) => s.label === b.slot)!.bucket)
      );
    return { classType: c.classType, light: c.light, items };
  });

  return { name, characters };
}
