import { NextRequest, NextResponse } from "next/server";
import { searchPlugs } from "@/lib/plugs";

/** Plug-zoeken voor de Build Creator. ?cat=weaponperk|armormod|aspect|...&q=&el= */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const cat = req.nextUrl.searchParams.get("cat");
  const el = req.nextUrl.searchParams.get("el");
  const items = await searchPlugs(cat, q, el);
  return NextResponse.json({ items });
}
