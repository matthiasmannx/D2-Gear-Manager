import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { transferItem, equipItem } from "@/lib/bungie";

/**
 * Equip een item op een character in één keer — ongeacht waar het nu staat.
 * Verplaatst het zo nodig eerst (andere character → vault → doel) en equipt het
 * dan. Equippen vervangt automatisch wat er in het slot zat; je hoeft dus niets
 * eerst te de-equippen.
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
    const target = String(body.targetCharacterId);
    // Optioneel: item om eerst op de bron te equippen zodat het te verplaatsen
    // item ge-de-equipt wordt (een uitgerust item kun je niet verplaatsen).
    const deequipItemId: string | undefined = body.deequipItemId ? String(body.deequipItemId) : undefined;

    if (source !== target) {
      // Eerst de-equippen op de bron-character (indien nodig).
      if (source && deequipItemId) {
        await equipItem(token, { itemId: deequipItemId, characterId: source, membershipType });
      }
      // Van een andere character eerst naar de vault.
      if (source) {
        await transferItem(token, {
          itemReferenceHash, itemId, characterId: source, membershipType, transferToVault: true,
        });
      }
      // Van de vault naar het doel-character.
      await transferItem(token, {
        itemReferenceHash, itemId, characterId: target, membershipType, transferToVault: false,
      });
    }

    await equipItem(token, { itemId, characterId: target, membershipType });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Equippen mislukt" }, { status: 400 });
  }
}
