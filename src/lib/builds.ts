/**
 * Meta builds — redactionele/community content. De Bungie API levert GEEN
 * "meta" of "beste build"-data, dus dit onderhoud je hier handmatig.
 *
 * Samengesteld uit community-bronnen (juni 2026) voor Monument of Triumph.
 * Meta verschuift met elke patch — verifieer/fine-tune op light.gg of Mobalytics.
 * De pagina toont per class de top 5 (gesorteerd op tier) per activiteit.
 */

export const META_SEASON = "Monument of Triumph";
export const META_UPDATED = "2026-06-16";

export type Activity = "PvE" | "PvP";
export type GuardianClass = "Titan" | "Hunter" | "Warlock";

export interface Build {
  id: string;
  name: string;
  activity: Activity;
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

const COMMUNITY = "community (juni 2026)";

export const BUILDS: Build[] = [
  // ===================== HUNTER — PvE =====================
  {
    id: "hunter-solar-crackshot-pve",
    name: "Solar — Crackshot (Mini Golden Gun)",
    activity: "PvE", guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Dodge vuurt een mini Golden Gun: non-stop add-clear, heals en ability-energie.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Crackshot", "Knock 'Em Down"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing", "Ember of Empyrean"],
    weapons: ["Sterke primary", "Special naar keuze", "Heavy DPS"],
    statPriority: ["Class ability", "Resilience", "Recovery"],
    howItWorks: "Crackshot maakt van je dodge een mini Golden Gun. De loop heelt, herlaadt en genereert genoeg class-ability energie om bijna continu te vuren. Star-Eater Scales houdt je Super hoog.",
    source: COMMUNITY,
  },
  {
    id: "hunter-void-gyrfalcon-pve",
    name: "Void — Gyrfalcon's Hauberk",
    activity: "PvE", guardianClass: "Hunter", subclass: "Void", tier: "S",
    summary: "Invisibility + volatile rounds voor team-buffs en add-clear.",
    exoticArmor: "Gyrfalcon's Hauberk",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Persistence", "Echo of Obscurity", "Echo of Cessation", "Echo of Instability"],
    weapons: ["Void primary", "Special naar keuze", "Heavy DPS"],
    statPriority: ["Resilience", "Mobility", "Recovery"],
    howItWorks: "Word invisible via Stylish Executioner; bij het breken van invis krijg je volatile rounds (Gyrfalcon's). Dat ketent volatile-explosies en houdt je team-survivability hoog.",
    source: COMMUNITY,
  },
  {
    id: "hunter-arc-liars-pve",
    name: "Arc — Liar's Handshake",
    activity: "PvE", guardianClass: "Hunter", subclass: "Arc", tier: "A",
    summary: "Melee-loop met enorme single-target burst en heals.",
    exoticArmor: "Liar's Handshake",
    aspects: ["Flow State", "Lethal Current"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Feedback", "Spark of Frequency"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Resilience", "Strength", "Recovery"],
    howItWorks: "Liar's Handshake geeft een verwoestende counter-punch met heal. Combineer met Lethal Current voor jolt en blink-melees voor een agressieve close-range loop.",
    source: COMMUNITY,
  },
  {
    id: "hunter-prismatic-pve",
    name: "Prismatic — Threaded Specter",
    activity: "PvE", guardianClass: "Hunter", subclass: "Prismatic", tier: "A",
    summary: "Transcendence-uptime met clones, threadlings en stasis-control.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Threaded Specter", "Winter's Shroud"],
    fragments: ["Facet of Courage", "Facet of Bravery", "Facet of Protection", "Facet of Dawn"],
    weapons: ["Primary", "Special", "Heavy DPS"],
    statPriority: ["Resilience", "Discipline", "Recovery"],
    howItWorks: "Meng licht- en duistere schade om snel Transcendence te bereiken; Threaded Specter levert add-clear en baits, Winter's Shroud slowt op dodge.",
    source: COMMUNITY,
  },
  // ===================== HUNTER — PvP =====================
  {
    id: "hunter-solar-duelist-pvp",
    name: "Solar — Crackshot Duelist",
    activity: "PvP", guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Primary-duels met radar-control en agressieve peeks.",
    exoticArmor: "Lucky Pants / FR0ST-EE5",
    aspects: ["Crackshot", "On Your Mark"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["Top-tier hand cannon", "Shotgun", "Heavy naar keuze"],
    statPriority: ["Mobility", "Resilience", "Recovery"],
    howItWorks: "Lucky Pants pusht hand-cannon damage/handling voor snelle kills; Crackshot geeft een burst-optie en het dodge-ritme houdt je radar-control hoog.",
    source: COMMUNITY,
  },
  {
    id: "hunter-arc-stompees-pvp",
    name: "Arc — Stompees Movement",
    activity: "PvP", guardianClass: "Hunter", subclass: "Arc", tier: "A",
    summary: "Maximale mobiliteit en strafe-snelheid voor duels.",
    exoticArmor: "Stompees",
    aspects: ["Flow State", "Tempest Strike"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency"],
    weapons: ["120 hand cannon", "Shotgun of fusion", "Heavy"],
    statPriority: ["Mobility", "Resilience", "Recovery"],
    howItWorks: "Stompees geeft extra sprong- en slide-afstand; gebruik amplified-snelheid en dodge-resets om gevechten op jouw voorwaarden te forceren.",
    source: COMMUNITY,
  },
  {
    id: "hunter-void-gyrfalcon-pvp",
    name: "Void — Invisibility Flank",
    activity: "PvP", guardianClass: "Hunter", subclass: "Void", tier: "B",
    summary: "Invisibility voor flanks en revives.",
    exoticArmor: "Gyrfalcon's Hauberk",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Obscurity", "Echo of Persistence", "Echo of Starvation"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Mobility", "Recovery", "Resilience"],
    howItWorks: "Dodge naar invisibility om te flanken, te resetten of veilig te reviven. Sterk in objective-modes.",
    source: COMMUNITY,
  },

  // ===================== TITAN — PvE =====================
  {
    id: "titan-solar-ignition-pve",
    name: "Solar — Shieldburst Ignition",
    activity: "PvE", guardianClass: "Titan", subclass: "Solar", tier: "S",
    summary: "Rally Barricade + scorch/ignition-loop voor constante add-clear.",
    exoticArmor: "Hallowfire Heart",
    aspects: ["Sol Invictus", "Roaring Flames"],
    fragments: ["Ember of Ashes", "Ember of Searing", "Ember of Empyrean", "Ember of Solace"],
    weapons: ["Scorch-synergie primary", "Aggressive frame (Unstoppable)", "Heavy DPS"],
    statPriority: ["Class ability", "Resilience", "Discipline"],
    howItWorks: "Scorching rounds en sunspots (Sol Invictus) voeden ignitions en houden je in leven; Hallowfire Heart boost ability- en Super-uptime.",
    source: COMMUNITY,
  },
  {
    id: "titan-prismatic-consecration-pve",
    name: "Prismatic — Consecration Spam",
    activity: "PvE", guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Slide-melee ignitions met survivability en transcendence.",
    exoticArmor: "Synthoceps / Wormgod Caress",
    aspects: ["Consecration", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Hope", "Facet of Protection", "Facet of Dawn"],
    weapons: ["Add-clear primary", "Special", "Heavy DPS"],
    statPriority: ["Resilience", "Strength", "Discipline"],
    howItWorks: "Slide → melee voor twee Consecration-slams die ontbranden; Synthoceps/Wormgod versterken de melee-damage en de loop draait door op melee-regen.",
    source: COMMUNITY,
  },
  {
    id: "titan-void-hoil-pve",
    name: "Void — Heart of Inmost Light",
    activity: "PvE", guardianClass: "Titan", subclass: "Void", tier: "A",
    summary: "Ability-spam met overshields en volatile.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Offensive Bulwark", "Controlled Demolition"],
    fragments: ["Echo of Persistence", "Echo of Undermining", "Echo of Instability", "Echo of Expulsion"],
    weapons: ["Void primary", "Special", "Heavy"],
    statPriority: ["Resilience", "Discipline", "Recovery"],
    howItWorks: "Heart of Inmost Light empowert je abilities na elk gebruik; Controlled Demolition + volatile zorgt voor constante AoE en overshields.",
    source: COMMUNITY,
  },
  {
    id: "titan-arc-thundercrash-pve",
    name: "Arc — Cuirass Thundercrash (DPS)",
    activity: "PvE", guardianClass: "Titan", subclass: "Arc", tier: "A",
    summary: "Burst-DPS Super voor boss-damage.",
    exoticArmor: "Cuirass of the Falling Star",
    aspects: ["Touch of Thunder", "Knockout"],
    fragments: ["Spark of Ions", "Spark of Discharge", "Spark of Shock", "Spark of Frequency"],
    weapons: ["Primary", "Special", "Rocket/heavy"],
    statPriority: ["Resilience", "Intellect", "Discipline"],
    howItWorks: "Cuirass maakt Thundercrash een topklasse burst-DPS Super; stack damage-buffs en gebruik het in DPS-fases.",
    source: COMMUNITY,
  },
  // ===================== TITAN — PvP =====================
  {
    id: "titan-hoil-pvp",
    name: "Striker — Heart of Inmost Light",
    activity: "PvP", guardianClass: "Titan", subclass: "Striker / Prismatic", tier: "S",
    summary: "Ability-overkill: één ability empowert de andere twee.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Juggernaut", "Knockout"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency"],
    weapons: ["120 hand cannon", "Shotgun of fusion", "Heavy naar keuze"],
    statPriority: ["Resilience", "Recovery", "Discipline"],
    howItWorks: "Heart of Inmost Light empowert na elk ability-gebruik je andere twee abilities met snellere regen en meer damage — eindeloze grenades, melees en barricades.",
    source: COMMUNITY,
  },
  {
    id: "titan-void-bubble-pvp",
    name: "Void — Bubble Support (Trials)",
    activity: "PvP", guardianClass: "Titan", subclass: "Void", tier: "A",
    summary: "Ward of Dawn als zone-control en Weapons of Light.",
    exoticArmor: "Helm of Saint-14",
    aspects: ["Bastion", "Controlled Demolition"],
    fragments: ["Echo of Persistence", "Echo of Leeching", "Echo of Provision"],
    weapons: ["Adaptive hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Resilience", "Recovery", "Intellect"],
    howItWorks: "Ward of Dawn met Helm of Saint-14 blindt vijanden die de bubbel betreden; geeft je team Weapons of Light voor round-control.",
    source: COMMUNITY,
  },
  {
    id: "titan-solar-loreley-pvp",
    name: "Solar — Loreley Sunspots",
    activity: "PvP", guardianClass: "Titan", subclass: "Solar", tier: "B",
    summary: "Bijna onsterfelijk in 1v1's met sunspot-heals.",
    exoticArmor: "Loreley Splendor Helm",
    aspects: ["Sol Invictus", "Roaring Flames"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["120 hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Resilience", "Recovery", "Mobility"],
    howItWorks: "Barricade/laag leven spawnt een sunspot die je heelt (Loreley); win duels door restoration op het juiste moment.",
    source: COMMUNITY,
  },

  // ===================== WARLOCK — PvE =====================
  {
    id: "warlock-void-contraverse-pve",
    name: "Void — Contraverse Devour",
    activity: "PvE", guardianClass: "Warlock", subclass: "Void", tier: "S",
    summary: "Grenade-spam met permanente Devour en damage resist.",
    exoticArmor: "Contraverse Hold",
    aspects: ["Chaos Accelerant", "Feed the Void"],
    fragments: ["Echo of Persistence", "Echo of Undermining", "Echo of Instability", "Echo of Remnants"],
    weapons: ["Void primary (volatile)", "Special", "Heavy DPS"],
    statPriority: ["Discipline", "Recovery", "Resilience"],
    howItWorks: "Charged Void-granaten geven via Contraverse Hold energie terug en damage resist; Feed the Void houdt Devour permanent draaiend voor heals.",
    source: COMMUNITY,
  },
  {
    id: "warlock-prismatic-getaway-pve",
    name: "Prismatic — Getaway Artist",
    activity: "PvE", guardianClass: "Warlock", subclass: "Prismatic", tier: "S",
    summary: "Arc Soul + stasis turret voor add-clear en buffs.",
    exoticArmor: "Getaway Artist",
    aspects: ["Hellion", "Bleak Watcher"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Dawn", "Facet of Bravery"],
    weapons: ["Primary", "Special", "Heavy"],
    statPriority: ["Discipline", "Resilience", "Recovery"],
    howItWorks: "Verbruik je arc grenade voor een agressieve Arc Soul (Getaway Artist), wissel naar Bleak Watcher-turret voor crowd control en vul Transcendence via gemengde damage.",
    source: COMMUNITY,
  },
  {
    id: "warlock-solar-sunbracers-pve",
    name: "Solar — Sunbracers",
    activity: "PvE", guardianClass: "Warlock", subclass: "Solar", tier: "A",
    summary: "Oneindige solar-granaten voor add-clear.",
    exoticArmor: "Sunbracers",
    aspects: ["Touch of Flame", "Heat Rises"],
    fragments: ["Ember of Ashes", "Ember of Searing", "Ember of Empyrean", "Ember of Solace"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Discipline", "Resilience", "Recovery"],
    howItWorks: "Een melee-kill terwijl Heat Rises actief is geeft 5s oneindige solar-granaten (Sunbracers) — spam ze voor enorme add-clear.",
    source: COMMUNITY,
  },
  {
    id: "warlock-stasis-osmiomancy-pve",
    name: "Stasis — Osmiomancy Coldsnap",
    activity: "PvE", guardianClass: "Warlock", subclass: "Stasis", tier: "A",
    summary: "Coldsnap-granaten freezen alles, non-stop.",
    exoticArmor: "Osmiomancy Gloves",
    aspects: ["Bleak Watcher", "Frostpulse"],
    fragments: ["Whisper of Rime", "Whisper of Chains", "Whisper of Torment", "Whisper of Fissures"],
    weapons: ["Stasis primary", "Special", "Heavy"],
    statPriority: ["Discipline", "Resilience", "Recovery"],
    howItWorks: "Osmiomancy geeft een tweede coldsnap-lading en snellere regen; freeze hele groepen en zet Bleak Watcher-turrets neer.",
    source: COMMUNITY,
  },
  // ===================== WARLOCK — PvP =====================
  {
    id: "warlock-solar-ophidian-pvp",
    name: "Solar — Ophidian Dawnblade",
    activity: "PvP", guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Snappy weapon handling + restoration heals na duels.",
    exoticArmor: "Ophidian Aspect",
    aspects: ["Heat Rises", "Touch of Flame"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["120 of 180 hand cannon", "Shotgun", "Heavy naar keuze"],
    statPriority: ["Recovery", "Resilience", "Mobility"],
    howItWorks: "Ophidian Aspect geeft topklasse ready/reload/handling voor betere duels; healing nades + Touch of Flame geven restoration na gevechten.",
    source: COMMUNITY,
  },
  {
    id: "warlock-stasis-osmiomancy-pvp",
    name: "Stasis — Osmiomancy Shutdown",
    activity: "PvP", guardianClass: "Warlock", subclass: "Stasis", tier: "A",
    summary: "Coldsnap-granaten als ongeëvenaarde shutdown.",
    exoticArmor: "Osmiomancy Gloves",
    aspects: ["Iceflare Bolts", "Frostpulse"],
    fragments: ["Whisper of Rime", "Whisper of Chains", "Whisper of Shards"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Recovery", "Resilience", "Mobility"],
    howItWorks: "Twee coldsnap-granaten met extra reikwijdte (Osmiomancy) freezen pushers en zone-control; volg op met een snelle kill.",
    source: COMMUNITY,
  },
  {
    id: "warlock-arc-crown-pvp",
    name: "Arc — Crown of Tempests",
    activity: "PvP", guardianClass: "Warlock", subclass: "Arc", tier: "B",
    summary: "Chain lightning en snelle Stormtrance-uptime.",
    exoticArmor: "Crown of Tempests",
    aspects: ["Arc Soul", "Lightning Surge"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Feedback"],
    weapons: ["Pulse rifle", "Shotgun", "Heavy"],
    statPriority: ["Recovery", "Resilience", "Discipline"],
    howItWorks: "Arc-kills verlengen je ability-regen en Stormtrance (Crown of Tempests); jolt-ketens ruimen groepen op.",
    source: COMMUNITY,
  },
];
