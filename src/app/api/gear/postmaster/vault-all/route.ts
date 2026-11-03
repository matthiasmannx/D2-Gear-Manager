import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { pullFromPostmaster, transferItem } from "@/lib/bungie";

/**
 * Haal de hele postmaster van één character leeg en zet alles wat kan naar de
 * vault. Bungie kent geen bulk-endpoint, dus we lopen per item: eerst
 * PullFromPostmaster (naar de character), dan TransferItem naar de vault.
 *
 * We doen dit strikt sequentieel en per item (pull → vault → volgende), zodat
 * de character-inventory niet volloopt: elk gepulld gear-item verlaat de
 * character meteen weer richting vault.
 *
 * Niet alles kan naar de vault: engrams/materialen blijven op de character
 * (die tellen als "pulled"); sommige items blokkeert Bungie via de API
 * (die tellen als "skipped").
 */
interface PmItem {
  hash: number;
  itemId?: string;
  itemType?: number; // 2 = armor, 3 = weapon (alleen die kunnen naar de vault)
  name?: string;
}

export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json();
  const characterId = String(body.characterId);
  const membershipType = Number(body.membershipType);
  const items: PmItem[] = Array.isArray(body.items) ? body.items : [];

  let vaulted = 0;
  let pulledOnly = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const it of items) {
    const hash = Number(it.hash);
    const itemId = it.itemId ? String(it.itemId) : undefined;
    const isGear = it.itemType === 2 || it.itemType === 3;

    // 1) Uit de postmaster trekken.
    try {
      await pullFromPostmaster(token, {
        itemReferenceHash: hash,
        itemId,
        characterId,
        membershipType,
        stackSize: 1,
      });
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      // Bungie blokkeert bepaalde postmaster-items via de API (alleen in-game).
      if (/postmaster/i.test(msg) && /in[- ]?game/i.test(msg)) {
        skipped++;
      } else {
        skipped++;
        if (it.name) errors.push(`${it.name}: ${msg || "pull mislukt"}`);
      }
      continue;
    }

    // 2) Naar de vault (alleen instanced gear kan daarheen).
    if (isGear && itemId) {
      try {
        await transferItem(token, {
          itemReferenceHash: hash,
          itemId,
          characterId,
          membershipType,
          transferToVault: true,
        });
        vaulted++;
      } catch (e: any) {
        // Opgehaald maar niet te vaulten (bv. vault vol): blijft op character.
        pulledOnly++;
        if (it.name) errors.push(`${it.name}: ${e?.message ?? "vault mislukt"}`);
      }
    } else {
      // Engrams / materialen: opgehaald, horen niet in de vault.
      pulledOnly++;
    }
  }

  return NextResponse.json({ ok: true, total: items.length, vaulted, pulledOnly, skipped, errors });
}
