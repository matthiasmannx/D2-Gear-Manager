import "server-only";
import { bungieFetch } from "./bungie";

export interface ClanInfo {
  id: string;
  name: string;
  motto: string;
  callsign: string;
  about: string;
  memberCount: number;
}

export interface ClanMember {
  membershipType: number;
  membershipId: string;
  name: string;
  online: boolean;
  rank: string;
  rankOrder: number;
  lastOnline?: string;
}

const RANK: Record<number, string> = { 5: "Founder", 4: "Acting Founder", 3: "Admin", 2: "Member", 1: "Beginner" };

/** Bungie geeft clan-teksten met HTML-entities (&#9825;, &#8217; …); decodeer ze. */
function decodeEntities(s: string): string {
  if (!s) return "";
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)));
}

/** De (eerste) clan van een speler via GetGroupsForMember. */
export async function getMyClan(membershipType: number, membershipId: string): Promise<ClanInfo | null> {
  try {
    const r = await bungieFetch<any>(`/GroupV2/User/${membershipType}/${membershipId}/0/1/`, { revalidate: 300 });
    const g = r?.results?.[0]?.group;
    if (!g) return null;
    return {
      id: g.groupId,
      name: decodeEntities(g.name ?? "").trim(),
      motto: decodeEntities(g.motto ?? "").trim(),
      callsign: decodeEntities(g.clanInfo?.clanCallsign ?? "").trim(),
      about: decodeEntities(g.about ?? "").trim(),
      memberCount: g.memberCount ?? 0,
    };
  } catch {
    return null;
  }
}

/** Ledenlijst van een clan, met online-status en rank. */
export async function getClanMembers(groupId: string): Promise<ClanMember[]> {
  try {
    const r = await bungieFetch<any>(`/GroupV2/${groupId}/Members/?currentpage=1`, { noStore: true });
    const list: any[] = r?.results ?? [];
    return list
      .map((m) => {
        const d = m.destinyUserInfo ?? {};
        const name = decodeEntities(
          d.bungieGlobalDisplayName
            ? `${d.bungieGlobalDisplayName}#${d.bungieGlobalDisplayNameCode}`
            : d.LastSeenDisplayName ?? "Guardian"
        );
        return {
          membershipType: d.membershipType,
          membershipId: d.membershipId,
          name,
          online: !!m.isOnline,
          rank: RANK[m.memberType] ?? "",
          rankOrder: m.memberType ?? 0,
          lastOnline: m.lastOnlineStatusChange ? new Date(Number(m.lastOnlineStatusChange) * 1000).toISOString() : undefined,
        } as ClanMember;
      })
      .filter((m) => m.membershipId)
      .sort((a, b) => Number(b.online) - Number(a.online) || b.rankOrder - a.rankOrder || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
