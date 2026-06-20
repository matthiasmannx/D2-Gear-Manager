import { NextRequest, NextResponse } from "next/server";
import { searchPlayers, PLATFORMS } from "@/lib/bungie";
import { getValidAccessToken } from "@/lib/auth";
import { getRecentOpponents } from "@/lib/recentOpponents";

export const dynamic = "force-dynamic";

/** Spelerzoek voor autocomplete: ?q= → [{name, type, id, platform, ago?}]. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ items: [] });

  const [res, token] = await Promise.all([searchPlayers(q).catch(() => []), getValidAccessToken()]);
  const opponents = token ? await getRecentOpponents(token) : {};

  const items = res
    .filter((r) => r.memberships?.length)
    .slice(0, 8)
    .map((r) => {
      const m = r.memberships.find((x: any) => x.crossSaveOverride === x.membershipType) ?? r.memberships[0];
      return {
        name: r.bungieName,
        type: m.membershipType,
        id: m.membershipId,
        platform: PLATFORMS[m.membershipType] ?? null,
        ago: opponents[m.membershipId] ?? null,
      };
    });

  return NextResponse.json({ items });
}
