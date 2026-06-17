import "server-only";
import { getMemberships, getProfile, getEntityDefinition, icon } from "./bungie";
import { lookupItems, getStatNames } from "./manifest";

/** Equip-slot buckets in weergavevolgorde (wapens dan armor). */
export const SLOT_ORDER: { bucket: number; label: string }[] = [
  { bucket: 1498876634, label: "Kinetic" },
  { bucket: 2465295065, label: "Energy" },
  { bucket: 953998645, label: "Power" },
  { bucket: 3448274439, label: "Helm" },
  { bucket: 3551918588, label: "Arms" },
  { bucket: 14239492, label: "Chest" },
  { bucket: 20886954, label: "Legs" },
  { bucket: 1585787867, label: "Class" },
];
const SLOT_SET = new Set(SLOT_ORDER.map((s) => s.bucket));

export const CLASS_NAMES: Record<number, string> = {
  0: "Titan",
  1: "Hunter",
  2: "Warlock",
  3: "Guardian",
};

export interface ItemStat {
  name: string;
  value: number;
}

export interface GearItem {
  instanceId?: string;
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  itemType: number;
  bucketHash: number;
  equippable: boolean;
  classType: number;
  power?: number;
  itemLevel?: number;
  energy?: number;
  locked: boolean;
  masterwork: boolean;
  stats: ItemStat[];
  /** Plug-hashes van de gesokkelde perks (voor god-roll matching). */
  perks: number[];
}

export interface GearLoadout {
  index: number;
  name: string;
  icon: string | null;
  color: string | null;
  itemCount: number;
  active: boolean; // komt overeen met wat de guardian nu draagt
}

export interface GearCharacter {
  characterId: string;
  classType: number;
  light: number;
  emblemPath?: string;
  /** Brede emblem-banner (zoals in-game), 474×96. */
  emblemBackground?: string;
  equipped: GearItem[]; // gesorteerd op SLOT_ORDER
  inventory: GearItem[]; // unequipped wapens/armor op deze character
  postmaster: GearItem[]; // items in de postmaster (Lost Items)
  loadouts: GearLoadout[]; // opgeslagen in-game loadouts
}

export interface GearData {
  name: string;
  membershipType: number;
  membershipId: string;
  characters: GearCharacter[];
  vault: GearItem[];
}

// 200 chars, 201 char-inv, 205 equipment, 102 vault, 300 instances, 304 stats,
// 305 sockets (perks), 206 in-game loadouts
const COMPONENTS = [200, 201, 205, 102, 300, 304, 305, 206];

// ItemState flags (bitmask).
const STATE_LOCKED = 1;
const STATE_MASTERWORK = 4;

// Bucket voor de postmaster (Lost Items).
const POSTMASTER_BUCKET = 215593132;

export async function loadGear(token: string): Promise<GearData | null> {
  const { primary, bungieGlobalDisplayName } = await getMemberships(token);
  if (!primary) return null;

  const profile = await getProfile(
    token,
    primary.membershipType,
    primary.membershipId,
    COMPONENTS
  );

  const instances = profile?.itemComponents?.instances?.data ?? {};
  const itemStats = profile?.itemComponents?.stats?.data ?? {};
  const itemSockets = profile?.itemComponents?.sockets?.data ?? {};
  const loadoutData = profile?.characterLoadouts?.data ?? {};
  const statNames = await getStatNames();
  const charData = profile?.characters?.data ?? {};
  const equipData = profile?.characterEquipment?.data ?? {};
  const invData = profile?.characterInventories?.data ?? {};
  const vaultItems: any[] = profile?.profileInventory?.data?.items ?? [];

  // Verzamel alle hashes en resolveer namen/iconen in één keer (in-memory).
  const allHashes = new Set<number>();
  const collect = (items: any[]) => items.forEach((i) => allHashes.add(i.itemHash));
  Object.values<any>(equipData).forEach((c) => collect(c.items ?? []));
  Object.values<any>(invData).forEach((c) => collect(c.items ?? []));
  collect(vaultItems);
  const defs = await lookupItems([...allHashes]);

  const toItem = (raw: any): GearItem | null => {
    const def = defs.get(raw.itemHash);
    if (!def) return null; // alleen wapens/armor met naam in de index
    const inst = raw.itemInstanceId ? instances[raw.itemInstanceId] : null;
    const state = raw.state ?? 0;
    const rawStats = raw.itemInstanceId ? itemStats[raw.itemInstanceId]?.stats ?? {} : {};
    const stats: ItemStat[] = Object.keys(rawStats)
      .map((sh) => ({ name: statNames[sh] ?? `#${sh}`, value: rawStats[sh]?.value ?? 0 }))
      .filter((s) => s.value !== 0 && !s.name.startsWith("#"))
      .sort((a, b) => b.value - a.value);
    return {
      instanceId: raw.itemInstanceId,
      hash: raw.itemHash,
      name: def.name,
      icon: icon(def.icon),
      type: def.type,
      tier: def.tier,
      itemType: def.itemType,
      bucketHash: def.bucketHash,
      equippable: def.equippable,
      classType: def.classType,
      power: inst?.primaryStat?.value,
      itemLevel: inst?.itemLevel,
      energy: inst?.energy?.energyCapacity,
      locked: (state & STATE_LOCKED) !== 0,
      masterwork: (state & STATE_MASTERWORK) !== 0,
      stats,
      perks: raw.itemInstanceId
        ? (itemSockets[raw.itemInstanceId]?.sockets ?? [])
            .map((s: any) => s?.plugHash)
            .filter((h: any): h is number => typeof h === "number")
        : [],
    };
  };

  const isGear = (it: GearItem) => it.itemType === 2 || it.itemType === 3; // armor/weapon

  const resolveLoadouts = async (charId: string, equippedIds: Set<string>): Promise<GearLoadout[]> => {
    const raw = loadoutData[charId]?.loadouts ?? [];
    const out: GearLoadout[] = [];
    for (let i = 0; i < raw.length; i++) {
      const l = raw[i];
      const items = (l.items ?? []).filter((it: any) => it.itemInstanceId && it.itemInstanceId !== "0");
      if (items.length === 0) continue; // lege slot overslaan
      // Actief = elk item uit de loadout zit ook in de huidige uitrusting.
      const active = items.every((it: any) => equippedIds.has(it.itemInstanceId));
      let name = `Loadout ${i + 1}`;
      let ic: string | null = null;
      let color: string | null = null;
      try {
        const [nd, idf, cd] = await Promise.all([
          l.nameHash ? getEntityDefinition("DestinyLoadoutNameDefinition", l.nameHash) : null,
          l.iconHash ? getEntityDefinition("DestinyLoadoutIconDefinition", l.iconHash) : null,
          l.colorHash ? getEntityDefinition("DestinyLoadoutColorDefinition", l.colorHash) : null,
        ]);
        if (nd?.name) name = nd.name;
        ic = icon(idf?.iconImagePath);
        color = icon(cd?.colorImagePath);
      } catch {
        /* val terug op standaardnaam */
      }
      out.push({ index: i, name, icon: ic, color, itemCount: items.length, active });
    }
    return out;
  };

  const characters: GearCharacter[] = await Promise.all(
    Object.values<any>(charData).map(async (c) => {
      const equipped = (equipData[c.characterId]?.items ?? [])
        .map(toItem)
        .filter((x: GearItem | null): x is GearItem => !!x && SLOT_SET.has(x.bucketHash))
        .sort(
          (a: GearItem, b: GearItem) =>
            SLOT_ORDER.findIndex((s) => s.bucket === a.bucketHash) -
            SLOT_ORDER.findIndex((s) => s.bucket === b.bucketHash)
        );
      const charItems: any[] = invData[c.characterId]?.items ?? [];
      const inventory = charItems
        .filter((raw) => raw.bucketHash !== POSTMASTER_BUCKET)
        .map(toItem)
        .filter((x: GearItem | null): x is GearItem => !!x && isGear(x));
      // Postmaster: alle resolvebare items (ook engrams/materialen).
      const postmaster = charItems
        .filter((raw) => raw.bucketHash === POSTMASTER_BUCKET)
        .map(toItem)
        .filter((x: GearItem | null): x is GearItem => !!x);
      const equippedIds = new Set<string>(
        (equipData[c.characterId]?.items ?? [])
          .map((it: any) => it.itemInstanceId)
          .filter((x: any): x is string => !!x)
      );
      const loadouts = await resolveLoadouts(c.characterId, equippedIds);
      return {
        characterId: c.characterId,
        classType: c.classType,
        light: c.light,
        emblemPath: c.emblemPath,
        emblemBackground: c.emblemBackgroundPath,
        equipped,
        inventory,
        postmaster,
        loadouts,
      };
    })
  );

  const vault = vaultItems
    .map(toItem)
    .filter((x: GearItem | null): x is GearItem => !!x && isGear(x));

  return {
    name: bungieGlobalDisplayName,
    membershipType: primary.membershipType,
    membershipId: primary.membershipId,
    characters,
    vault,
  };
}

export { icon };
