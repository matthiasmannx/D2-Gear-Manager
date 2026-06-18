import { NextRequest, NextResponse } from "next/server";
import { searchItemIndex } from "@/lib/manifest";
import { icon } from "@/lib/bungie";

/** Item-zoeken voor de Build Creator. ?q=naam&kind=weapon|armor */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const kind = req.nextUrl.searchParams.get("kind");
  if (q.length < 2) return NextResponse.json({ items: [] });

  const wantType = kind === "armor" ? 2 : kind === "weapon" ? 3 : null;
  const hits = await searchItemIndex(q, 30);
  const items = hits
    .filter((h) => (wantType === null || h.itemType === wantType) && h.equippable)
    .slice(0, 12)
    .map((h) => ({ hash: h.hash, name: h.name, icon: icon(h.icon), type: h.type, tier: h.tier }));
  return NextResponse.json({ items });
}
