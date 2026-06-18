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
  765357505: 2, // Saint-14 (Trials)
  895295461: 3, // Lord Saladin (Iron Banner)
  672118013: 4, // Banshee-44 (Gunsmith)
  350061650: 5, // Ada-1
  3361454721: 6, // Tess Everis (Eververse)
};

export interface VendorItem {
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
}
export interface VendorView {
  hash: number;
  name: string;
  icon: string | null;
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

  const views: VendorView[] = [];
  // Loop over ÁLLE vendors die de API teruggeeft (niet hardcoded).
  for (const vendorHash of Object.keys(salesData)) {
    const sales = salesData[vendorHash]?.saleItems;
    if (!sales) continue;

    const saleHashes = [...new Set(Object.values<any>(sales).map((s) => s.itemHash).filter(Boolean))];
    const defs = await lookupItems(saleHashes);

    // Alleen wapens/armor tonen (geen materialen/engrams/cosmetics-rommel).
    const items: VendorItem[] = [];
    for (const h of saleHashes) {
      const d = defs.get(h as number);
      if (d && (d.itemType === 2 || d.itemType === 3)) {
        items.push({ hash: d.hash, name: d.name, icon: icon(d.icon), type: d.type, tier: d.tier });
      }
    }
    if (items.length === 0) continue; // vendor verkoopt geen gear → overslaan

    // Vendor-naam/icoon; sla naamloze/interne vendors over.
    let name = "";
    let vicon: string | null = null;
    try {
      const def = await getEntityDefinition("DestinyVendorDefinition", Number(vendorHash));
      name = def?.displayProperties?.name ?? "";
      vicon = icon(def?.displayProperties?.icon);
    } catch {
      /* negeer */
    }
    if (!name) continue;

    views.push({ hash: Number(vendorHash), name, icon: vicon, items: items.slice(0, 30) });
  }

  // Belangrijke vendors eerst, daarna op aantal gear-items.
  views.sort((a, b) => {
    const pa = VENDOR_PRIORITY[a.hash] ?? 99;
    const pb = VENDOR_PRIORITY[b.hash] ?? 99;
    if (pa !== pb) return pa - pb;
    return b.items.length - a.items.length;
  });

  return views;
}
