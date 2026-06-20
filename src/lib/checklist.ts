import "server-only";
import { getMemberships, getProfile, getEntityDefinition, icon } from "./bungie";

export interface ChecklistItem {
  hash: number;
  name: string;
  description: string;
  icon: string | null;
  done: boolean;
}

function milestoneDone(m: any): boolean {
  if (Array.isArray(m?.rewards) && m.rewards.length) {
    return m.rewards.every((r: any) => (r.entries ?? []).every((e: any) => e.earned));
  }
  if (Array.isArray(m?.activities) && m.activities.length) {
    const withCh = m.activities.filter((a: any) => (a.challenges ?? []).length > 0);
    if (withCh.length) return withCh.every((a: any) => a.challenges.every((ch: any) => ch.objective?.complete));
  }
  return false;
}

/** Wekelijkse milestones van de speler met (best-effort) voltooiingsstatus. */
export async function getWeeklyChecklist(token: string): Promise<ChecklistItem[]> {
  const { primary } = await getMemberships(token);
  if (!primary) return [];
  const profile = await getProfile(token, primary.membershipType, primary.membershipId, [202]);
  const progs = profile?.characterProgressions?.data ?? {};

  // Milestones samenvoegen over characters: done als op één character voltooid.
  const byHash = new Map<number, boolean>();
  for (const cid of Object.keys(progs)) {
    const ms = progs[cid]?.milestones ?? {};
    for (const h of Object.keys(ms)) {
      const done = milestoneDone(ms[h]);
      byHash.set(Number(h), (byHash.get(Number(h)) ?? false) || done);
    }
  }

  const entries = await Promise.all(
    [...byHash.entries()].map(async ([hash, done]) => {
      const def = await getEntityDefinition("DestinyMilestoneDefinition", hash).catch(() => null);
      const name = def?.displayProperties?.name;
      if (!name) return null;
      return {
        hash,
        name,
        description: def?.displayProperties?.description ?? "",
        icon: icon(def?.displayProperties?.icon),
        done,
      } as ChecklistItem;
    })
  );

  return entries
    .filter((e): e is ChecklistItem => e !== null)
    .sort((a, b) => Number(a.done) - Number(b.done) || a.name.localeCompare(b.name));
}
