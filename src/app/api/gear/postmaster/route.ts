import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { pullFromPostmaster } from "@/lib/bungie";

export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  try {
    const body = await req.json();
    await pullFromPostmaster(token, {
      itemReferenceHash: Number(body.itemReferenceHash),
      itemId: body.itemId ? String(body.itemId) : undefined,
      characterId: String(body.characterId),
      membershipType: Number(body.membershipType),
      stackSize: body.stackSize ? Number(body.stackSize) : 1,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Pull mislukt" }, { status: 400 });
  }
}
