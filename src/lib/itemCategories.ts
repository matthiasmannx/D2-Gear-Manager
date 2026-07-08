/**
 * Categorie-filters voor de items-zoekpagina. Elke categorie mapt naar één of
 * meer DestinyItemType-waarden (zie Bungie enum). Gedeeld door de zoekfunctie
 * (server) en de filter-chips (client), zodat ze niet uit elkaar lopen.
 */
export interface ItemCategory {
  key: string;
  itemTypes: number[];
}

// Volgorde = weergavevolgorde van de chips ("all" komt daarvóór in de UI).
export const ITEM_CATEGORIES: ItemCategory[] = [
  { key: "weapon", itemTypes: [3] },
  { key: "armor", itemTypes: [2] },
  { key: "mod", itemTypes: [19] },
  { key: "sparrow", itemTypes: [22] }, // DestinyItemType.Vehicle
  { key: "ship", itemTypes: [21] },
  { key: "ghost", itemTypes: [24] },
  { key: "emblem", itemTypes: [14] },
];

/** itemType-waarden voor een categorie, of null bij "all"/onbekend (= geen filter). */
export function categoryTypes(key?: string | null): number[] | null {
  if (!key || key === "all") return null;
  return ITEM_CATEGORIES.find((c) => c.key === key)?.itemTypes ?? null;
}
