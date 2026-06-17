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
    const msg: string = e.message ?? "Pull mislukt";
    // Bungie blokkeert het ophalen van bepaalde postmaster-items via de API.
    if (/postmaster/i.test(msg) && /in[- ]?game/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Dit item kun je alleen in-game uit de postmaster halen — Bungie staat dit specifieke item niet toe via de API. Veel andere items pullen wél.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
