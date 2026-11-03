import "server-only";
import { getMemberships, getProfile, getRecentMatches, bungieFetch } from "./bungie";

// membershipId → aantal potten geleden (1 = meest recente match), per user gecachet.
const cache = new Map<string, { at: number; map: Record<string, number> }>();
const TTL = 5 * 60 * 1000;

/** Voor de ingelogde gebruiker: wie kwam je recent tegen en hoeveel potten geleden. */
export async function getRecentOpponents(token: string): Promise<Record<string, number>> {
  try {
    const { primary } = await getMemberships(token);
    if (!primary) return {};
    const key = primary.membershipId;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < TTL) return cached.map;

    const prof = await getProfile(token, primary.membershipType, primary.membershipId, [200]);
    const charIds = Object.keys(prof?.characters?.data ?? {});
    if (charIds.length === 0) return {};

    const matches = (await getRecentMatches(primary.membershipType, primary.membershipId, charIds)).filter((m) => m.instanceId).slice(0, 12);

    const map: Record<string, number> = {};
    await Promise.all(
      matches.map(async (m, idx) => {
        try {
          const pgcr = await bungieFetch<any>(`/Destiny2/Stats/PostGameCarnageReport/${m.instanceId}/`, { revalidate: 60 * 60 * 24 * 30 });
          for (const e of pgcr?.entries ?? []) {
            const mid = e.player?.destinyUserInfo?.membershipId;
            if (!mid || mid === primary.membershipId) continue;
            const ago = idx + 1;
            if (map[mid] == null || ago < map[mid]) map[mid] = ago;
          }
        } catch {
          /* sla match over */
        }
      })
    );

    cache.set(key, { at: Date.now(), map });
    return map;
  } catch {
    return {};
  }
}
