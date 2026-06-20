import "server-only";
import { GearData, SLOT_ORDER } from "./gear";

const WEAPON_BUCKETS = new Set([1498876634, 2465295065, 953998645]); // kinetic/energy/power

export interface ItemRef {
  power: number;
  name: string;
  icon: string | null;
}
export interface SlotPower {
  bucket: number;
  label: string;
  equipped: ItemRef | null;
  best: ItemRef | null;
  upgrade: number; // best - equipped (0 = al je beste)
}
export interface CharPower {
  characterId: string;
  classType: number;
  light: number;
  emblem?: string;
  current: number;
  max: number;
  totalGain: number;
  slots: SlotPower[];
}

/** Berekent per character het power-potentieel + welk item je het beste equipt. */
export function analyzePower(data: GearData): CharPower[] {
  const pool = [
    ...data.characters.flatMap((c) => [...c.equipped, ...c.inventory]),
    ...data.vault,
  ];

  return data.characters.map((c) => {
    const slots: SlotPower[] = SLOT_ORDER.map((s) => {
      const isWeapon = WEAPON_BUCKETS.has(s.bucket);
      let best: ItemRef | null = null;
      for (const it of pool) {
        if (it.bucketHash !== s.bucket || it.power == null) continue;
        if (!isWeapon && it.classType !== c.classType && it.classType !== 3) continue;
        if (!best || it.power > best.power) best = { power: it.power, name: it.name, icon: it.icon };
      }
      const eq = c.equipped.find((it) => it.bucketHash === s.bucket);
      const equipped: ItemRef | null = eq ? { power: eq.power ?? 0, name: eq.name, icon: eq.icon } : null;
      const upgrade = Math.max(0, (best?.power ?? 0) - (equipped?.power ?? 0));
      return { bucket: s.bucket, label: s.label, equipped, best, upgrade };
    });

    const avg = (pick: (s: SlotPower) => number) => Math.floor(slots.reduce((a, s) => a + pick(s), 0) / (slots.length || 1));
    const current = avg((s) => s.equipped?.power ?? 0);
    const max = avg((s) => s.best?.power ?? 0);
    // Grootste winst eerst zodat je ziet wat je het beste upgradet.
    slots.sort((a, b) => b.upgrade - a.upgrade);

    return {
      characterId: c.characterId,
      classType: c.classType,
      light: c.light,
      emblem: c.emblemBackground ?? c.emblemPath,
      current,
      max,
      totalGain: max - current,
      slots,
    };
  });
}
