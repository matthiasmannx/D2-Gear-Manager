import "server-only";
import { bungieFetch, getEntityDefinition, icon } from "./bungie";

export interface LiveActivity {
  active: boolean;
  map?: string;
  mode?: string;
  icon?: string | null;
  since?: string; // ISO-tijd waarop de activiteit begon
  pvp?: boolean;
  hidden?: boolean; // privacy: huidige activiteit staat dicht
}

const ORBIT = /orbit/i;

/**
 * Live huidige activiteit van een speler via component 204 (CharacterActivities).
 * Publieke call (geen OAuth); werkt voor andere spelers alleen als hun privacy
 * "huidige activiteit" openstaat. Ongecachet zodat het echt live is.
 */
export async function getLiveActivity(membershipType: number, membershipId: string): Promise<LiveActivity> {
  let data: any;
  try {
    data = await bungieFetch<any>(`/Destiny2/${membershipType}/Profile/${membershipId}/?components=204`, { noStore: true });
  } catch {
    return { active: false };
  }

  const acts = data?.characterActivities?.data;
  // Component niet teruggekregen terwijl het profiel wel bestaat → privacy dicht.
  if (!acts) return { active: false, hidden: data?.characterActivities?.privacy === 2 };

  // Kies de character die nu daadwerkelijk in een activiteit zit.
  let cur: any = null;
  for (const cid of Object.keys(acts)) {
    const a = acts[cid]?.data ?? acts[cid];
    if (a?.currentActivityHash) { cur = a; break; }
  }
  if (!cur?.currentActivityHash) return { active: false };

  const [actDef, modeDef] = await Promise.all([
    getEntityDefinition("DestinyActivityDefinition", cur.currentActivityHash).catch(() => null),
    cur.currentActivityModeHash
      ? getEntityDefinition("DestinyActivityModeDefinition", cur.currentActivityModeHash).catch(() => null)
      : Promise.resolve(null),
  ]);

  const map = actDef?.displayProperties?.name as string | undefined;
  if (map && ORBIT.test(map)) return { active: false }; // in orbit = niet in een match

  return {
    active: true,
    map,
    mode: modeDef?.displayProperties?.name,
    icon: icon(actDef?.pgcrImage || modeDef?.displayProperties?.icon),
    since: cur.dateActivityStarted,
    pvp: modeDef?.activityModeCategory === 1, // 1 = PvP (Crucible)
  };
}
