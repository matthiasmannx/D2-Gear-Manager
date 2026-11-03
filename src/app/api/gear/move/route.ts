import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { transferItem } from "@/lib/bungie";

/**
 * Verplaats een item naar een doel (vault of een specifieke character).
 * - naar vault: één transfer (transferToVault=true).
 * - vault → character: één transfer (transferToVault=false).
 * - character A → character B: kan niet direct, dus A→vault en daarna vault→B.
 */
export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  try {
    const body = await req.json();
    const itemReferenceHash = Number(body.itemReferenceHash);
    const itemId = String(body.itemId);
    const membershipType = Number(body.membershipType);
    const source: string = body.sourceCharacterId ? String(body.sourceCharacterId) : ""; // "" = vault
    const target: string = String(body.target); // "vault" of characterId

    if (target === "vault") {
      if (!source) return NextResponse.json({ ok: true }); // al in vault
      await transferItem(token, {
        itemReferenceHash,
        itemId,
        characterId: source,
        membershipType,
        transferToVault: true,
      });
    } else if (!source) {
      // vault → character
      await transferItem(token, {
        itemReferenceHash,
        itemId,
        characterId: target,
        membershipType,
        transferToVault: false,
      });
    } else if (source !== target) {
      // character → character: via de vault
      await transferItem(token, {
        itemReferenceHash,
        itemId,
        characterId: source,
        membershipType,
        transferToVault: true,
      });
      await transferItem(token, {
        itemReferenceHash,
        itemId,
        characterId: target,
        membershipType,
        transferToVault: false,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Verplaatsen mislukt" }, { status: 400 });
  }
}
