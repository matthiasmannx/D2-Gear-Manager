import { NextResponse } from "next/server";
import { getGodRoll } from "@/lib/wishlist";
import { getExoticTrait } from "@/lib/itemDetail";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  try {
    const [roll, exoticTrait] = await Promise.all([
      getGodRoll(Number(hash)),
      getExoticTrait(Number(hash)),
    ]);
    return NextResponse.json({
      pve: roll?.pve ?? [],
      pvp: roll?.pvp ?? [],
      exoticTrait,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Fout" }, { status: 500 });
  }
}
