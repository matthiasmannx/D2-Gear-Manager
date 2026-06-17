/**
 * Meta builds — redactionele/community content. De Bungie API levert GEEN
 * "meta" of "beste build"-data, dus dit onderhoud je hier handmatig.
 *
 * Recente community-bronnen (juni 2026, Armor 3.0 / Edge of Fate / Monument of
 * Triumph) — builds van ná de stat-rework. Stats: Weapons, Health, Class,
 * Grenade, Super, Melee. Per build getagd met de modi waar hij voor bedoeld is.
 * Verifieer/fine-tune op light.gg, Mobalytics of blueberries.gg.
 */

export const META_SEASON = "Monument of Triumph";
export const META_UPDATED = "2026-06-17";

export type GuardianClass = "Titan" | "Hunter" | "Warlock";
export type Mode = "GM" | "Raid" | "Dungeon" | "Trials" | "IronBanner" | "Crucible";

export interface Build {
  id: string;
  name: string;
  modes: Mode[];
  guardianClass: GuardianClass;
  subclass: string;
  tier: "S" | "A" | "B";
  summary: string;
  exoticArmor?: string;
  exoticWeapon?: string;
  aspects: string[];
  fragments: string[];
  weapons: string[];
  statPriority: string[];
  howItWorks: string;
  source?: string;
}

const C = "community (Armor 3.0, juni 2026)";

export const BUILDS: Build[] = [
  // ============================ HUNTER ============================
  {
    id: "hunter-void-gyrfalcon",
    name: "Void — Gyrfalcon's Hauberk (Nightstalker)",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Hunter", subclass: "Void", tier: "S",
    summary: "De betrouwbaarste endgame-Hunter: invisibility, volatile rounds, overshields en team-buffs.",
    exoticArmor: "Gyrfalcon's Hauberk",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Starvation", "Echo of Persistence", "Echo of Remnants", "Echo of Obscurity"],
    weapons: ["Void primary", "Blinding GL of special", "Heavy"],
    statPriority: ["Health", "Class", "Grenade"],
    howItWorks: "Invis bij kills (Stylish Executioner) geeft bij het breken volatile rounds; ketent volatile-explosies, houdt je onzichtbaar en je team veilig. Top in GM's.",
    source: "blueberries.gg / itemlevel " + C,
  },
  {
    id: "hunter-celestial-stillhunt",
    name: "Solar — Celestial Nighthawk + Still Hunt (DPS)",
    modes: ["Raid", "Dungeon"], guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Topklasse single-target boss-DPS via één enorme Golden Gun-shot.",
    exoticArmor: "Celestial Nighthawk",
    exoticWeapon: "Still Hunt",
    aspects: ["Gunpowder Gamble", "On Your Mark"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Empyrean", "Ember of Char"],
    weapons: ["Still Hunt", "Special", "Heavy DPS"],
    statPriority: ["Super", "Health", "Class"],
    howItWorks: "Celestial Nighthawk bundelt Golden Gun in één megashot; Still Hunt geeft een tweede GG-rotatie. Samen een van de sterkste raid-DPS-opstellingen.",
    source: "lfcarry / thegamer " + C,
  },
  {
    id: "hunter-solar-crackshot",
    name: "Solar — Crackshot Golden Gun",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Nieuwe Crackshot-aspect: class ability markeert 3 targets + scorching shots, en heelt je.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Crackshot", "Knock 'Em Down"],
    fragments: ["Ember of Torches", "Ember of Searing", "Ember of Empyrean", "Ember of Solace"],
    weapons: ["Sterke primary", "Special", "Heavy DPS"],
    statPriority: ["Class", "Health", "Super"],
    howItWorks: "Crackshot maakt van je dodge een mini Golden Gun die 3 targets markeert, scorch toepast en je heelt. Star-Eater Scales houdt je Super hoog.",
    source: "epiccarry / itemlevel " + C,
  },
  {
    id: "hunter-prismatic-specter",
    name: "Prismatic — Threaded Specter",
    modes: ["Dungeon", "Raid", "GM"], guardianClass: "Hunter", subclass: "Prismatic", tier: "A",
    summary: "Transcendence-uptime met clones, threadlings en on-demand ignitions.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Threaded Specter", "Gunpowder Gamble"],
    fragments: ["Facet of Courage", "Facet of Bravery", "Facet of Protection", "Facet of Dawn"],
    weapons: ["Primary", "Special", "Heavy DPS"],
    statPriority: ["Health", "Class", "Super"],
    howItWorks: "Meng licht/duister voor snelle Transcendence; Threaded Specter doet add-clear en baits, Gunpowder Gamble levert ignitions.",
    source: "mobalytics " + C,
  },
  {
    id: "hunter-solar-duelist",
    name: "Solar — Crackshot Duelist",
    modes: ["Trials", "Crucible"], guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Primary-duels met radar-control, heals en agressieve peeks.",
    exoticArmor: "Lucky Pants / St0mp-EE5",
    aspects: ["Crackshot", "On Your Mark"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["Top-tier hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Weapons", "Health", "Class"],
    howItWorks: "Lucky Pants pusht hand-cannon-damage/handling; Crackshot geeft burst + cure, dodge-ritme houdt radar-control hoog. Sterk in 3v3.",
    source: "epiccarry " + C,
  },
  {
    id: "hunter-stompees",
    name: "Arc — St0mp-EE5 Movement",
    modes: ["Crucible", "IronBanner", "Trials"], guardianClass: "Hunter", subclass: "Arc", tier: "A",
    summary: "Maximale sprong/slide + minder airborne-damage; forceer duels op jouw voorwaarden.",
    exoticArmor: "St0mp-EE5",
    aspects: ["Flow State", "Tempest Strike"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency"],
    weapons: ["120 hand cannon", "Shotgun of fusion", "Heavy"],
    statPriority: ["Weapons", "Health", "Class"],
    howItWorks: "St0mp-EE5 geeft extra mobiliteit en dempt airborne-damage; amplified + dodge-resets maken je ongrijpbaar.",
    source: "blueberries.gg " + C,
  },
  {
    id: "hunter-sixthcoyote",
    name: "Void — Sixth Coyote (Double Dodge)",
    modes: ["Trials", "Crucible"], guardianClass: "Hunter", subclass: "Void", tier: "A",
    summary: "Twee dodges achter elkaar voor flanks, baits en invis-plays.",
    exoticArmor: "Sixth Coyote",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Obscurity", "Echo of Persistence", "Echo of Starvation"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Weapons", "Class", "Health"],
    howItWorks: "Sixth Coyote geeft een tweede dodge; dodge naar invis om te flanken, resetten of veilig te reviven.",
    source: "fandomwire " + C,
  },

  // ============================ TITAN ============================
  {
    id: "titan-cuirass-thundercrash",
    name: "Arc — Cuirass Thundercrash (DPS)",
    modes: ["Raid", "Dungeon"], guardianClass: "Titan", subclass: "Arc", tier: "S",
    summary: "Burst-DPS Super die boss-DPS-fases afsluit.",
    exoticArmor: "Cuirass of the Falling Star",
    aspects: ["Touch of Thunder", "Knockout"],
    fragments: ["Spark of Ions", "Spark of Discharge", "Spark of Shock", "Spark of Frequency"],
    weapons: ["Primary", "Special", "Rocket/heavy"],
    statPriority: ["Super", "Health", "Class"],
    howItWorks: "Cuirass of the Falling Star maakt Thundercrash een enorme burst-DPS Super; stack damage-buffs en gebruik 'm in de DPS-fase.",
    source: "lfcarry " + C,
  },
  {
    id: "titan-solar-ashenwake",
    name: "Solar — Ashen Wake Fusion Grenade",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Titan", subclass: "Solar", tier: "S",
    summary: "Insta-fusion grenades die ontbranden — massale add-clear met granaat-spam.",
    exoticArmor: "Ashen Wake",
    aspects: ["Roaring Flames", "Sol Invictus"],
    fragments: ["Ember of Resolve", "Ember of Empyrean", "Ember of Torches", "Ember of Char"],
    weapons: ["Demolitionist-primary", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Ashen Wake maakt fusion grenades instant + sterker; kills geven granaat-energie en sunspots houden je in leven voor non-stop spam.",
    source: "skycoach / sportskeeda " + C,
  },
  {
    id: "titan-prismatic-hoil",
    name: "Prismatic — Heart of Inmost Light",
    modes: ["GM", "Raid", "Dungeon"], guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Ability-economie voor GM's: één ability empowert de andere twee.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Consecration", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Hope", "Facet of Dawn"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Health", "Grenade", "Melee"],
    howItWorks: "Heart of Inmost Light empowert na elk ability-gebruik je andere twee; Consecration-slams ontbranden en de loop houdt je staande onder druk.",
    source: "lagofast / mobalytics " + C,
  },
  {
    id: "titan-arc-skullfort",
    name: "Arc — Insurmountable Skullfort",
    modes: ["Dungeon", "GM"], guardianClass: "Titan", subclass: "Arc", tier: "A",
    summary: "Melee-loop met heals: Thunderclap + One-Two Punch.",
    exoticArmor: "An Insurmountable Skullfort",
    aspects: ["Knockout", "Touch of Thunder"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency", "Spark of Discharge"],
    weapons: ["Without Remorse (One-Two Punch)", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Skullfort geeft melee-energie + heal bij Arc-melee-kills; stack Melee om cooldowns te slopen en blijf in de loop met One-Two Punch.",
    source: "skycoach " + C,
  },
  {
    id: "titan-strand-wishful",
    name: "Strand — Wishful Ignorance",
    modes: ["Dungeon", "Raid"], guardianClass: "Titan", subclass: "Strand", tier: "A",
    summary: "\"Green Man\": absurde melee-damage met Frenzied Blade + Flechette Storm.",
    exoticArmor: "Wishful Ignorance",
    aspects: ["Flechette Storm", "Banner of War"],
    fragments: ["Thread of Warding", "Thread of Generation", "Thread of Ascent", "Thread of Transmutation"],
    weapons: ["Primary", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Wishful Ignorance pompt je Frenzied Blade/Flechette Storm-damage tot boven sommige supers; Banner of War heelt je team terwijl je doorbeukt.",
    source: "skycoach " + C,
  },
  {
    id: "titan-hoil-pvp",
    name: "Prismatic — Heart of Inmost Light (PvP)",
    modes: ["IronBanner", "Crucible", "Trials"], guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Ability-spam onder druk: beste ability-economie in Crucible.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Juggernaut", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Resolve", "Facet of Protection"],
    weapons: ["120 hand cannon", "Shotgun of fusion", "Heavy"],
    statPriority: ["Health", "Class", "Weapons"],
    howItWorks: "Eindeloze empowered grenades, melees en barricades; sterkst onder aanhoudende druk en in 6v6 (Iron Banner).",
    source: "lagofast " + C,
  },
  {
    id: "titan-void-bubble-pvp",
    name: "Void — Bubble Support",
    modes: ["Trials", "IronBanner"], guardianClass: "Titan", subclass: "Void", tier: "A",
    summary: "Ward of Dawn als zone-control + Weapons of Light.",
    exoticArmor: "Helm of Saint-14",
    aspects: ["Bastion", "Offensive Bulwark"],
    fragments: ["Echo of Persistence", "Echo of Leeching", "Echo of Provision"],
    weapons: ["Adaptive hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Health", "Class", "Super"],
    howItWorks: "Helm of Saint-14 blindt vijanden in je bubbel en geeft je team Weapons of Light voor round-control in 3v3.",
    source: "leprestore " + C,
  },

  // ============================ WARLOCK ============================
  {
    id: "warlock-starfire-dps",
    name: "Solar — Starfire Protocol (DPS)",
    modes: ["Raid", "Dungeon"], guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Fusion-grenade-spam voor hoge sustained boss-DPS + ability-energie.",
    exoticArmor: "Starfire Protocol",
    aspects: ["Touch of Flame", "Icarus Dash"],
    fragments: ["Ember of Ashes", "Ember of Empyrean", "Ember of Char", "Ember of Solace"],
    weapons: ["Fusion rifle / rocket", "Special", "Heavy DPS"],
    statPriority: ["Grenade", "Super", "Health"],
    howItWorks: "Starfire Protocol geeft granaat-energie op weapon damage en sterkere fusion grenades; spam ze in de DPS-fase met Well/empowering rift.",
    source: "lfcarry " + C,
  },
  {
    id: "warlock-well-phoenix",
    name: "Solar — Well of Radiance (Phoenix Protocol)",
    modes: ["GM", "Raid", "Dungeon"], guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Team-heal + damage-buff Well, bijna constant beschikbaar.",
    exoticArmor: "Phoenix Protocol",
    aspects: ["Heat Rises", "Touch of Flame"],
    fragments: ["Ember of Benevolence", "Ember of Empyrean", "Ember of Solace", "Ember of Torches"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Super", "Health", "Class"],
    howItWorks: "Phoenix Protocol geeft Super-energie terug terwijl je in je Well staat; houd het team levend en gebuffd en pop het keer op keer.",
    source: "pcinvasion " + C,
  },
  {
    id: "warlock-prismatic-getaway",
    name: "Prismatic — Getaway Artist",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Warlock", subclass: "Prismatic", tier: "S",
    summary: "Constante Devour + Arc Soul + stasis-turret area denial.",
    exoticArmor: "Getaway Artist",
    aspects: ["Bleak Watcher", "Feed the Void"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Dawn", "Facet of Bravery"],
    weapons: ["Primary", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Getaway Artist verbruikt je arc grenade voor een agressieve Arc Soul; Feed the Void houdt Devour aan en Bleak Watcher-turrets doen area denial.",
    source: "skycoach / leprestore " + C,
  },
  {
    id: "warlock-void-contraverse",
    name: "Void — Contraverse Devour (Solo)",
    modes: ["GM", "Dungeon"], guardianClass: "Warlock", subclass: "Void", tier: "S",
    summary: "Grenade-spam met permanente Devour + damage resist — top voor solo/endgame.",
    exoticArmor: "Contraverse Hold",
    aspects: ["Chaos Accelerant", "Feed the Void"],
    fragments: ["Echo of Persistence", "Echo of Undermining", "Echo of Instability", "Echo of Remnants"],
    weapons: ["Void primary (volatile)", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Charged Void-granaten geven via Contraverse Hold energie terug + damage resist; Feed the Void houdt Devour draaiend voor heals.",
    source: "blueberries.gg " + C,
  },
  {
    id: "warlock-solar-ophidian-pvp",
    name: "Solar — Ophidian Dawnblade",
    modes: ["Trials", "Crucible", "IronBanner"], guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Snappy weapon handling + restoration heals na duels — veilige all-rounder.",
    exoticArmor: "Ophidian Aspect",
    aspects: ["Heat Rises", "Touch of Flame"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["120 of 180 hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Class", "Health", "Weapons"],
    howItWorks: "Ophidian Aspect geeft topklasse ready/reload/handling; healing nades + Touch of Flame geven restoration na gevechten.",
    source: "blueberries.gg " + C,
  },
  {
    id: "warlock-stasis-osmiomancy-pvp",
    name: "Stasis — Osmiomancy Coldsnap",
    modes: ["Trials", "IronBanner", "Crucible"], guardianClass: "Warlock", subclass: "Stasis", tier: "A",
    summary: "Coldsnap-granaten als ongeëvenaarde shutdown + freeze-control.",
    exoticArmor: "Osmiomancy Gloves",
    aspects: ["Iceflare Bolts", "Frostpulse"],
    fragments: ["Whisper of Rime", "Whisper of Chains", "Whisper of Shards"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Class", "Health", "Weapons"],
    howItWorks: "Twee coldsnap-granaten met extra reikwijdte (Osmiomancy) freezen pushers en doen zone-control; volg op met een snelle kill.",
    source: "blueberries.gg " + C,
  },
];
