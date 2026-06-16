import "server-only";
import { getMemberships, getProfile, bungieFetch, getEntityDefinition, icon } from "./bungie";
import { lookupItems } from "./manifest";

/**
 * Vendor-inventory (wat verkopen Xûr / Banshee / Ada nu?). Vereist OAuth +
 * een character-context. Xûr is alleen in het weekend aanwezig.
 */

const VENDORS: { hash: number; key: string }[] = [
  { hash: 2190858386, key: "xur" }, // Xûr
  { hash: 672118013, key: "banshee" }, // Banshee-44 (Gunsmith)
  { hash: 350061650, key: "ada" }, // Ada-1
];

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

  const vendorData = res?.vendors?.data ?? {};
  const salesData = res?.sales?.data ?? {};

  const views: VendorView[] = [];
  for (const v of VENDORS) {
    const sales = salesData[v.hash]?.saleItems;
    if (!sales) continue; // vendor niet beschikbaar (bv. Xûr in de week)

    const saleHashes = Object.values<any>(sales)
      .map((s) => s.itemHash)
      .filter(Boolean);
    const defs = await lookupItems(saleHashes);

    // Alleen wapens/armor tonen (geen materialen/engrams-rommel).
    const items: VendorItem[] = [];
    for (const h of saleHashes) {
      const d = defs.get(h);
      if (d && (d.itemType === 2 || d.itemType === 3)) {
        items.push({ hash: h, name: d.name, icon: icon(d.icon), type: d.type, tier: d.tier });
      }
    }
    if (items.length === 0) continue;

    let name = v.key;
    let vicon: string | null = null;
    try {
      const def = await getEntityDefinition("DestinyVendorDefinition", v.hash);
      name = def?.displayProperties?.name ?? v.key;
      vicon = icon(def?.displayProperties?.icon);
    } catch {
      /* val terug op key */
    }

    views.push({ hash: v.hash, name, icon: vicon, items });
  }

  return views;
}
