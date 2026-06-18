import "server-only";
import { getMemberships, getProfile, bungieFetch, getEntityDefinition, icon } from "./bungie";
import { lookupItems } from "./manifest";

/**
 * Vendor-inventory: wat verkopen de vendors nu? Vereist OAuth + character-context.
 * We tonen ÁLLE vendors die de API voor deze character teruggeeft en die wapens
 * of armor verkopen (Xûr alleen in het weekend, Saint-14/Saladin tijdens hun
 * event, plus Banshee, Ada, bestemmings-vendors, enz.).
 */

// Bekende vendors die we vooraan willen tonen (rest komt erachter, op aantal items).
const VENDOR_PRIORITY: Record<number, number> = {
  2190858386: 1, // Xûr
  69482069: 2, // Commander Zavala (Vanguard)
  3603221665: 3, // Lord Shaxx (Crucible)
  248695599: 4, // The Drifter (Gambit)
  765357505: 5, // Saint-14 (Trials)
  895295461: 6, // Lord Saladin (Iron Banner)
  672118013: 7, // Banshee-44 (Gunsmith)
  350061650: 8, // Ada-1
  2255782930: 9, // Master Rahool (Cryptarch)
  3361454721: 10, // Tess Everis (Eververse)
};

export interface VendorCost {
  name: string;
  icon: string | null;
  quantity: number;
}
export interface VendorItem {
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  itemType: number;
  classType: number;
  cost: VendorCost[];
}
export interface VendorView {
  hash: number;
  name: string;
  icon: string | null;
  banner: string | null; // achtergrond-banner van de vendor-locatie
  location: string; // destination-naam (bv. "The Last City" = Tower)
  items: VendorItem[];
}

export async function getVendorInventory(token: string): Promise<VendorView[] | null> {
  const { primary } = await getMemberships(token);
  if (!primary) return null;

  // Een character-id is nodig voor de vendor-call.
  const profile = await getProfile(token, primary.membershipType, primary.membershipId, [200]);
  const chars = Object.keys(profile?.characters?.data ?? {});
  if (chars.length === 0) return null;
  const characterId = chars[0];

  let res: any;
  try {
    res = await bungieFetch<any>(
      `/Destiny2/${primary.membershipType}/Profile/${primary.membershipId}/Character/${characterId}/Vendors/?components=400,402`,
      { accessToken: token }
    );
  } catch {
    return [];
  }

  const salesData = res?.sales?.data ?? {};
  const vendorsData = res?.vendors?.data ?? {};

  // Alle vendors PARALLEL verwerken (vendor-definities tegelijk ophalen i.p.v.
  // tientallen na elkaar — dat maakte de pagina traag).
  const gearRank = (it: VendorItem) => (it.itemType === 3 ? 2 : it.itemType === 2 ? 1 : 0);
  const built = await Promise.all(
    Object.keys(salesData).map(async (vendorHash): Promise<VendorView | null> => {
      const sales = salesData[vendorHash]?.saleItems;
      if (!sales) return null;

      const saleEntries = Object.values<any>(sales).filter((s) => s.itemHash);
      const itemHashes = [...new Set(saleEntries.map((s) => s.itemHash))];
      const defs = await lookupItems(itemHashes); // items via in-memory index (snel)

      // Kosten (currencies) via entity-def — weinig unieke, globaal gecached.
      const costHashes = [...new Set(saleEntries.flatMap((s) => (s.costs ?? []).map((c: any) => c.itemHash)).filter(Boolean))];
      const costMap = new Map<number, { name: string; icon: string | null }>();
      await Promise.all(
        costHashes.map(async (ch) => {
          try {
            const cd = await getEntityDefinition("DestinyInventoryItemDefinition", ch as number);
            if (cd?.displayProperties?.name) costMap.set(ch as number, { name: cd.displayProperties.name, icon: icon(cd.displayProperties.icon) });
          } catch {
            /* negeer */
          }
        })
      );

      const items: VendorItem[] = [];
      const seen = new Set<number>();
      for (const s of saleEntries) {
        if (seen.has(s.itemHash)) continue;
        seen.add(s.itemHash);
        const d = defs.get(s.itemHash);
        if (!d || !d.name) continue;
        const cost: VendorCost[] = (s.costs ?? [])
          .map((c: any) => {
            const cm = costMap.get(c.itemHash);
            return cm ? { name: cm.name, icon: cm.icon, quantity: c.quantity } : null;
          })
          .filter((c: VendorCost | null): c is VendorCost => c !== null && c.quantity > 0);
        items.push({ hash: d.hash, name: d.name, icon: icon(d.icon), type: d.type, tier: d.tier, itemType: d.itemType, classType: d.classType, cost });
      }
      if (items.length === 0) return null;
      items.sort((a, b) => gearRank(b) - gearRank(a));

      let name = "";
      let vicon: string | null = null;
      let banner: string | null = null;
      let location = "";
      try {
        const def = await getEntityDefinition("DestinyVendorDefinition", Number(vendorHash));
        const dp = def?.displayProperties ?? {};
        name = dp.name ?? "";
        // Logo: icon met fallback op de transparante varianten.
        vicon = icon(dp.icon || dp.smallTransparentIcon || dp.largeTransparentIcon);
        const locs = def?.locations ?? [];
        const idx = vendorsData[vendorHash]?.vendorLocationIndex ?? 0;
        const loc = locs[idx] ?? locs[0];
        if (loc?.backgroundImagePath) banner = icon(loc.backgroundImagePath);
        if (loc?.destinationHash) {
          const dd = await getEntityDefinition("DestinyDestinationDefinition", loc.destinationHash);
          location = dd?.displayProperties?.name ?? "";
        }
      } catch {
        /* negeer */
      }
      if (!name) return null;

      return { hash: Number(vendorHash), name, icon: vicon, banner, location, items: items.slice(0, 30) };
    })
  );
  const views = built.filter((v): v is VendorView => v !== null);

  // Belangrijke vendors eerst, daarna op aantal gear-items.
  views.sort((a, b) => {
    const pa = VENDOR_PRIORITY[a.hash] ?? 99;
    const pb = VENDOR_PRIORITY[b.hash] ?? 99;
    if (pa !== pb) return pa - pb;
    return b.items.length - a.items.length;
  });

  return views;
}
