/**
 * Meta builds — editorial/community content. The Bungie API provides NO "meta"
 * or "best build" data, so this is maintained here by hand.
 *
 * Recent community sources (June 2026, Armor 3.0 / Edge of Fate / Monument of
 * Triumph) — builds from after the stat rework. Stats: Weapons, Health, Class,
 * Grenade, Super, Melee. Each build tagged with the modes it's meant for.
 * Verify/fine-tune on light.gg, Mobalytics or blueberries.gg.
 *
 * Content language: English (shared community language; the UI itself is
 * localized via the message catalogs).
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

const C = "community (Armor 3.0, June 2026)";

export const BUILDS: Build[] = [
  // ============================ HUNTER ============================
  {
    id: "hunter-void-gyrfalcon",
    name: "Void — Gyrfalcon's Hauberk (Nightstalker)",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Hunter", subclass: "Void", tier: "S",
    summary: "The most reliable endgame Hunter: invisibility, volatile rounds, overshields and team buffs.",
    exoticArmor: "Gyrfalcon's Hauberk",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Starvation", "Echo of Persistence", "Echo of Remnants", "Echo of Obscurity"],
    weapons: ["Void primary", "Blinding GL or special", "Heavy"],
    statPriority: ["Health", "Class", "Grenade"],
    howItWorks: "Going invisible on kills (Stylish Executioner) grants volatile rounds when invis breaks; chain volatile explosions, stay invisible and keep your team safe. Top-tier in GMs.",
    source: "blueberries.gg / itemlevel " + C,
  },
  {
    id: "hunter-celestial-stillhunt",
    name: "Solar — Celestial Nighthawk + Still Hunt (DPS)",
    modes: ["Raid", "Dungeon"], guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Top-class single-target boss DPS via one massive Golden Gun shot.",
    exoticArmor: "Celestial Nighthawk",
    exoticWeapon: "Still Hunt",
    aspects: ["Gunpowder Gamble", "On Your Mark"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Empyrean", "Ember of Char"],
    weapons: ["Still Hunt", "Special", "Heavy DPS"],
    statPriority: ["Super", "Health", "Class"],
    howItWorks: "Celestial Nighthawk condenses Golden Gun into one mega shot; Still Hunt grants a second GG rotation. Together one of the strongest raid DPS setups.",
    source: "lfcarry / thegamer " + C,
  },
  {
    id: "hunter-solar-crackshot",
    name: "Solar — Crackshot Golden Gun",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "New Crackshot aspect: your class ability marks 3 targets + scorching shots, and heals you.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Crackshot", "Knock 'Em Down"],
    fragments: ["Ember of Torches", "Ember of Searing", "Ember of Empyrean", "Ember of Solace"],
    weapons: ["Strong primary", "Special", "Heavy DPS"],
    statPriority: ["Class", "Health", "Super"],
    howItWorks: "Crackshot turns your dodge into a mini Golden Gun that marks 3 targets, applies scorch and heals you. Star-Eater Scales keeps your Super topped up.",
    source: "epiccarry / itemlevel " + C,
  },
  {
    id: "hunter-prismatic-specter",
    name: "Prismatic — Threaded Specter",
    modes: ["Dungeon", "Raid", "GM"], guardianClass: "Hunter", subclass: "Prismatic", tier: "A",
    summary: "Transcendence uptime with clones, threadlings and on-demand ignitions.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Threaded Specter", "Gunpowder Gamble"],
    fragments: ["Facet of Courage", "Facet of Bravery", "Facet of Protection", "Facet of Dawn"],
    weapons: ["Primary", "Special", "Heavy DPS"],
    statPriority: ["Health", "Class", "Super"],
    howItWorks: "Blend Light and Dark for fast Transcendence; Threaded Specter handles add-clear and baits, Gunpowder Gamble delivers ignitions.",
    source: "mobalytics " + C,
  },
  {
    id: "hunter-solar-duelist",
    name: "Solar — Crackshot Duelist",
    modes: ["Trials", "Crucible"], guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Primary duels with radar control, heals and aggressive peeks.",
    exoticArmor: "Lucky Pants / St0mp-EE5",
    aspects: ["Crackshot", "On Your Mark"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["Top-tier hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Weapons", "Health", "Class"],
    howItWorks: "Lucky Pants boosts hand cannon damage/handling; Crackshot gives burst + cure, and the dodge rhythm keeps radar control high. Strong in 3v3.",
    source: "epiccarry " + C,
  },
  {
    id: "hunter-stompees",
    name: "Arc — St0mp-EE5 Movement",
    modes: ["Crucible", "IronBanner", "Trials"], guardianClass: "Hunter", subclass: "Arc", tier: "A",
    summary: "Maximum jump/slide + reduced airborne damage; force duels on your terms.",
    exoticArmor: "St0mp-EE5",
    aspects: ["Flow State", "Tempest Strike"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency"],
    weapons: ["120 hand cannon", "Shotgun or fusion", "Heavy"],
    statPriority: ["Weapons", "Health", "Class"],
    howItWorks: "St0mp-EE5 grants extra mobility and dampens airborne damage; amplified + dodge resets make you elusive.",
    source: "blueberries.gg " + C,
  },
  {
    id: "hunter-sixthcoyote",
    name: "Void — Sixth Coyote (Double Dodge)",
    modes: ["Trials", "Crucible"], guardianClass: "Hunter", subclass: "Void", tier: "A",
    summary: "Two dodges back to back for flanks, baits and invis plays.",
    exoticArmor: "Sixth Coyote",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Obscurity", "Echo of Persistence", "Echo of Starvation"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Weapons", "Class", "Health"],
    howItWorks: "Sixth Coyote grants a second dodge; dodge into invis to flank, reset or revive safely.",
    source: "fandomwire " + C,
  },

  // ============================ TITAN ============================
  {
    id: "titan-cuirass-thundercrash",
    name: "Arc — Cuirass Thundercrash (DPS)",
    modes: ["Raid", "Dungeon"], guardianClass: "Titan", subclass: "Arc", tier: "S",
    summary: "Burst-DPS Super that closes out boss damage phases.",
    exoticArmor: "Cuirass of the Falling Star",
    aspects: ["Touch of Thunder", "Knockout"],
    fragments: ["Spark of Ions", "Spark of Discharge", "Spark of Shock", "Spark of Frequency"],
    weapons: ["Primary", "Special", "Rocket/heavy"],
    statPriority: ["Super", "Health", "Class"],
    howItWorks: "Cuirass of the Falling Star turns Thundercrash into a huge burst-DPS Super; stack damage buffs and use it in the DPS phase.",
    source: "lfcarry " + C,
  },
  {
    id: "titan-solar-ashenwake",
    name: "Solar — Ashen Wake Fusion Grenade",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Titan", subclass: "Solar", tier: "S",
    summary: "Insta-fusion grenades that ignite — massive add-clear with grenade spam.",
    exoticArmor: "Ashen Wake",
    aspects: ["Roaring Flames", "Sol Invictus"],
    fragments: ["Ember of Resolve", "Ember of Empyrean", "Ember of Torches", "Ember of Char"],
    weapons: ["Demolitionist primary", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Ashen Wake makes fusion grenades instant + stronger; kills return grenade energy and sunspots keep you alive for non-stop spam.",
    source: "skycoach / sportskeeda " + C,
  },
  {
    id: "titan-prismatic-hoil",
    name: "Prismatic — Heart of Inmost Light",
    modes: ["GM", "Raid", "Dungeon"], guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Ability economy for GMs: one ability empowers the other two.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Consecration", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Hope", "Facet of Dawn"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Health", "Grenade", "Melee"],
    howItWorks: "Heart of Inmost Light empowers your other two abilities after each ability use; Consecration slams ignite and the loop keeps you standing under pressure.",
    source: "lagofast / mobalytics " + C,
  },
  {
    id: "titan-arc-skullfort",
    name: "Arc — Insurmountable Skullfort",
    modes: ["Dungeon", "GM"], guardianClass: "Titan", subclass: "Arc", tier: "A",
    summary: "Melee loop with heals: Thunderclap + One-Two Punch.",
    exoticArmor: "An Insurmountable Skullfort",
    aspects: ["Knockout", "Touch of Thunder"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency", "Spark of Discharge"],
    weapons: ["Without Remorse (One-Two Punch)", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Skullfort grants melee energy + heal on Arc melee kills; stack Melee to crush cooldowns and stay in the loop with One-Two Punch.",
    source: "skycoach " + C,
  },
  {
    id: "titan-strand-wishful",
    name: "Strand — Wishful Ignorance",
    modes: ["Dungeon", "Raid"], guardianClass: "Titan", subclass: "Strand", tier: "A",
    summary: "\"Green Man\": absurd melee damage with Frenzied Blade + Flechette Storm.",
    exoticArmor: "Wishful Ignorance",
    aspects: ["Flechette Storm", "Banner of War"],
    fragments: ["Thread of Warding", "Thread of Generation", "Thread of Ascent", "Thread of Transmutation"],
    weapons: ["Primary", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Wishful Ignorance pushes your Frenzied Blade/Flechette Storm damage above some supers; Banner of War heals your team while you keep smashing.",
    source: "skycoach " + C,
  },
  {
    id: "titan-hoil-pvp",
    name: "Prismatic — Heart of Inmost Light (PvP)",
    modes: ["IronBanner", "Crucible", "Trials"], guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Ability spam under pressure: the best ability economy in Crucible.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Juggernaut", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Resolve", "Facet of Protection"],
    weapons: ["120 hand cannon", "Shotgun or fusion", "Heavy"],
    statPriority: ["Health", "Class", "Weapons"],
    howItWorks: "Endless empowered grenades, melees and barricades; strongest under sustained pressure and in 6v6 (Iron Banner).",
    source: "lagofast " + C,
  },
  {
    id: "titan-void-bubble-pvp",
    name: "Void — Bubble Support",
    modes: ["Trials", "IronBanner"], guardianClass: "Titan", subclass: "Void", tier: "A",
    summary: "Ward of Dawn as zone control + Weapons of Light.",
    exoticArmor: "Helm of Saint-14",
    aspects: ["Bastion", "Offensive Bulwark"],
    fragments: ["Echo of Persistence", "Echo of Leeching", "Echo of Provision"],
    weapons: ["Adaptive hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Health", "Class", "Super"],
    howItWorks: "Helm of Saint-14 blinds enemies in your bubble and grants your team Weapons of Light for round control in 3v3.",
    source: "leprestore " + C,
  },

  // ============================ WARLOCK ============================
  {
    id: "warlock-starfire-dps",
    name: "Solar — Starfire Protocol (DPS)",
    modes: ["Raid", "Dungeon"], guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Fusion grenade spam for high sustained boss DPS + ability energy.",
    exoticArmor: "Starfire Protocol",
    aspects: ["Touch of Flame", "Icarus Dash"],
    fragments: ["Ember of Ashes", "Ember of Empyrean", "Ember of Char", "Ember of Solace"],
    weapons: ["Fusion rifle / rocket", "Special", "Heavy DPS"],
    statPriority: ["Grenade", "Super", "Health"],
    howItWorks: "Starfire Protocol returns grenade energy on weapon damage and grants stronger fusion grenades; spam them in the DPS phase with a Well/empowering rift.",
    source: "lfcarry " + C,
  },
  {
    id: "warlock-well-phoenix",
    name: "Solar — Well of Radiance (Phoenix Protocol)",
    modes: ["GM", "Raid", "Dungeon"], guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Team-heal + damage-buff Well, available almost constantly.",
    exoticArmor: "Phoenix Protocol",
    aspects: ["Heat Rises", "Touch of Flame"],
    fragments: ["Ember of Benevolence", "Ember of Empyrean", "Ember of Solace", "Ember of Torches"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Super", "Health", "Class"],
    howItWorks: "Phoenix Protocol returns Super energy while you stand in your Well; keep the team alive and buffed and pop it again and again.",
    source: "pcinvasion " + C,
  },
  {
    id: "warlock-prismatic-getaway",
    name: "Prismatic — Getaway Artist",
    modes: ["GM", "Dungeon", "Raid"], guardianClass: "Warlock", subclass: "Prismatic", tier: "S",
    summary: "Constant Devour + Arc Soul + stasis-turret area denial.",
    exoticArmor: "Getaway Artist",
    aspects: ["Bleak Watcher", "Feed the Void"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Dawn", "Facet of Bravery"],
    weapons: ["Primary", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Getaway Artist consumes your arc grenade for an aggressive Arc Soul; Feed the Void sustains Devour and Bleak Watcher turrets handle area denial.",
    source: "skycoach / leprestore " + C,
  },
  {
    id: "warlock-void-contraverse",
    name: "Void — Contraverse Devour (Solo)",
    modes: ["GM", "Dungeon"], guardianClass: "Warlock", subclass: "Void", tier: "S",
    summary: "Grenade spam with permanent Devour + damage resist — top for solo/endgame.",
    exoticArmor: "Contraverse Hold",
    aspects: ["Chaos Accelerant", "Feed the Void"],
    fragments: ["Echo of Persistence", "Echo of Undermining", "Echo of Instability", "Echo of Remnants"],
    weapons: ["Void primary (volatile)", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Charged Void grenades return energy + damage resist via Contraverse Hold; Feed the Void keeps Devour running for heals.",
    source: "blueberries.gg " + C,
  },
  {
    id: "warlock-solar-ophidian-pvp",
    name: "Solar — Ophidian Dawnblade",
    modes: ["Trials", "Crucible", "IronBanner"], guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Snappy weapon handling + restoration heals after duels — a safe all-rounder.",
    exoticArmor: "Ophidian Aspect",
    aspects: ["Heat Rises", "Touch of Flame"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["120 or 180 hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Class", "Health", "Weapons"],
    howItWorks: "Ophidian Aspect grants top-class ready/reload/handling; healing nades + Touch of Flame give restoration after fights.",
    source: "blueberries.gg " + C,
  },
  {
    id: "warlock-stasis-osmiomancy-pvp",
    name: "Stasis — Osmiomancy Coldsnap",
    modes: ["Trials", "IronBanner", "Crucible"], guardianClass: "Warlock", subclass: "Stasis", tier: "A",
    summary: "Coldsnap grenades as unmatched shutdown + freeze control.",
    exoticArmor: "Osmiomancy Gloves",
    aspects: ["Iceflare Bolts", "Frostpulse"],
    fragments: ["Whisper of Rime", "Whisper of Chains", "Whisper of Shards"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Class", "Health", "Weapons"],
    howItWorks: "Two coldsnap grenades with extra range (Osmiomancy) freeze pushers and provide zone control; follow up with a quick kill.",
    source: "blueberries.gg " + C,
  },
];
