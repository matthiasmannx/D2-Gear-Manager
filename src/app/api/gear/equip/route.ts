import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { equipItem } from "@/lib/bungie";

export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await equipItem(token, {
      itemId: String(body.itemId),
      characterId: String(body.characterId),
      membershipType: Number(body.membershipType),
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Equip mislukt" }, { status: 400 });
  }
}
