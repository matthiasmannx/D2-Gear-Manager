// Bouwt data/plug-index.json: alle selecteerbare plugs (perks, mods, aspects,
// fragments, abilities, supers) uit het Bungie-manifest, gecategoriseerd zodat
// de Build Creator overal kan zoeken i.p.v. vrije tekst. Run lokaal:
//   node scripts/build-plug-index.mjs
import fs from "node:fs/promises";

const ROOT = "https://www.bungie.net";
const env = await fs.readFile(".env.local", "utf8").catch(() => "");
const key = (process.env.BUNGIE_API_KEY || (env.match(/BUNGIE_API_KEY=(.+)/) || [])[1] || "").trim();
if (!key) throw new Error("BUNGIE_API_KEY ontbreekt (.env.local).");

const ELEMENTS = ["arc", "solar", "void", "stasis", "strand", "prismatic"];
const WEAPON_CATS = ["barrels", "blades", "scopes", "tubes", "bowstrings", "hafts", "arrows", "batteries", "magazines", "magazines_gl", "sights", "stocks", "grips", "frames", "guards", "origins", "intrinsics", "masterworks"];

function categorize(pci) {
  if (!pci) return null;
  if (pci.includes("aspects")) return "aspect";
  if (pci.includes("fragments")) return "fragment";
  if (pci.includes("supers")) return "super";
  if (pci.includes("class_abilities")) return "classability";
  if (pci.includes("movement")) return "movement";
  if (pci.includes("grenades")) return "grenade";
  if (pci.includes("melee")) return "melee";
  if (pci.startsWith("enhancements")) return "armormod";
  if (WEAPON_CATS.some((w) => pci.includes(w))) return "weaponperk";
  return null;
}

console.log("Manifest ophalen...");
const m = await (await fetch(`${ROOT}/Platform/Destiny2/Manifest/`, { headers: { "X-API-Key": key } })).json();
const rel = m.Response?.jsonWorldComponentContentPaths?.en?.DestinyInventoryItemDefinition;
if (!rel) throw new Error("Geen DestinyInventoryItemDefinition-pad in manifest.");
console.log("Item-tabel downloaden:", rel);
const table = await (await fetch(ROOT + rel)).json();

const plugs = [];
const seen = new Set();
for (const k in table) {
  const def = table[k];
  if (!def?.plug || def.redacted) continue;
  const name = def.displayProperties?.name;
  if (!name) continue;
  const pci = (def.plug.plugCategoryIdentifier || "").toLowerCase();
  const cat = categorize(pci);
  if (!cat) continue;
  if (seen.has(def.hash)) continue;
  seen.add(def.hash);
  const el = ELEMENTS.find((e) => pci.includes(e)) || null;
  plugs.push({
    hash: def.hash,
    name,
    icon: def.displayProperties?.icon || null,
    cat,
    el,
    type: def.itemTypeDisplayName || "",
  });
}

plugs.sort((a, b) => a.name.localeCompare(b.name));
const out = { version: m.Response.version, plugs };
await fs.writeFile("data/plug-index.json", JSON.stringify(out));
const byCat = {};
for (const p of plugs) byCat[p.cat] = (byCat[p.cat] || 0) + 1;
console.log(`Klaar: ${plugs.length} plugs → data/plug-index.json`);
console.log(byCat);
