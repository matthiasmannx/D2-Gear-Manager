import "server-only";
import { GearData, SLOT_ORDER } from "./gear";

const WEAPON_BUCKETS = new Set([1498876634, 2465295065, 953998645]); // kinetic/energy/power

export interface SlotPower {
  bucket: number;
  label: string;
  equipped: number;
  best: number;
  upgrade: number; // best - equipped (0 = al je beste)
}
export interface CharPower {
  characterId: string;
  classType: number;
  light: number;
  emblem?: string;
  current: number; // gemiddelde van wat je nu draagt (basis-power, zonder artifact)
  max: number; // gemiddelde als je je beste per slot draagt
  slots: SlotPower[];
  lowestBucket: number; // laagste uitgeruste slot
}

/** Berekent per character het power-potentieel uit alles wat je bezit. */
export function analyzePower(data: GearData): CharPower[] {
  const pool = [
    ...data.characters.flatMap((c) => [...c.equipped, ...c.inventory]),
    ...data.vault,
  ];

  return data.characters.map((c) => {
    const slots: SlotPower[] = SLOT_ORDER.map((s) => {
      const isWeapon = WEAPON_BUCKETS.has(s.bucket);
      const best = pool
        .filter((it) => it.bucketHash === s.bucket && it.power != null && (isWeapon || it.classType === c.classType || it.classType === 3))
        .reduce((m, it) => Math.max(m, it.power ?? 0), 0);
      const equipped = c.equipped.find((it) => it.bucketHash === s.bucket)?.power ?? 0;
      return { bucket: s.bucket, label: s.label, equipped, best, upgrade: Math.max(0, best - equipped) };
    });

    const avg = (key: "equipped" | "best") => Math.floor(slots.reduce((a, s) => a + s[key], 0) / (slots.length || 1));
    let lowestBucket = slots[0]?.bucket ?? 0;
    let lowestVal = Infinity;
    for (const s of slots) if (s.equipped < lowestVal) { lowestVal = s.equipped; lowestBucket = s.bucket; }

    return {
      characterId: c.characterId,
      classType: c.classType,
      light: c.light,
      emblem: c.emblemBackground ?? c.emblemPath,
      current: avg("equipped"),
      max: avg("best"),
      slots,
      lowestBucket,
    };
  });
}
