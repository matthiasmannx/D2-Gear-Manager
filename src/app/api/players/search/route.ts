import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/lib/bungie";

export const dynamic = "force-dynamic";

/** Spelerzoek voor autocomplete: ?q=Bungie-naam → [{name, type, id}]. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ items: [] });
  const res = await searchPlayers(q).catch(() => []);
  const items = res
    .filter((r) => r.memberships?.length)
    .slice(0, 8)
    .map((r) => {
      const m = r.memberships.find((x: any) => x.crossSaveOverride === x.membershipType) ?? r.memberships[0];
      return { name: r.bungieName, type: m.membershipType, id: m.membershipId };
    });
  return NextResponse.json({ items });
}
