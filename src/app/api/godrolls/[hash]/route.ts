import { NextResponse } from "next/server";
import { getExoticTrait } from "@/lib/itemDetail";

// Alleen de exotic-trait uit de Bungie-manifest. God rolls (PvE/PvP) linken we
// naar light.gg, we hosten geen community-wishlist-data in eigen systeem.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  try {
    const exoticTrait = await getExoticTrait(Number(hash));
    return NextResponse.json({ exoticTrait });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Fout" }, { status: 500 });
  }
}
