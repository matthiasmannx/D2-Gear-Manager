/**
 * Meta builds — redactionele/community content. De Bungie API levert GEEN
 * "meta" of "beste build"-data, dus dit onderhoud je hier handmatig.
 *
 * Samengesteld uit recente community-bronnen (juni 2026, Armor 3.0 / Edge of
 * Fate / Monument of Triumph) — bewust builds van ná de stat-rework, want het
 * stat-systeem is volledig veranderd. Stats: Weapons, Health, Class, Grenade,
 * Super, Melee. Verifieer/fine-tune op light.gg, Mobalytics of blueberries.gg.
 * De pagina toont per class de top 5 (gesorteerd op tier) per activiteit.
 */

export const META_SEASON = "Monument of Triumph";
export const META_UPDATED = "2026-06-17";

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

const C = "community (Armor 3.0, juni 2026)";

export const BUILDS: Build[] = [
  // ===================== HUNTER — PvE =====================
  {
    id: "hunter-void-gyrfalcon-pve",
    name: "Void — Gyrfalcon's Hauberk (Nightstalker)",
    activity: "PvE", guardianClass: "Hunter", subclass: "Void", tier: "S",
    summary: "De meest betrouwbare endgame-Hunter: invisibility + volatile rounds + team-buffs.",
    exoticArmor: "Gyrfalcon's Hauberk",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Starvation", "Echo of Persistence", "Echo of Remnants", "Echo of Obscurity"],
    weapons: ["Void primary", "Special naar keuze", "Heavy DPS"],
    statPriority: ["Health", "Class", "Grenade"],
    howItWorks: "Stylish Executioner geeft invis bij kills; bij het breken van invis krijg je volatile rounds (Gyrfalcon's). Ketent volatile-explosies en houdt je team veilig — top-tier in GMs.",
    source: "blueberries.gg / itemlevel.net " + C,
  },
  {
    id: "hunter-solar-crackshot-pve",
    name: "Solar — Crackshot Golden Gun",
    activity: "PvE", guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Nieuwe Crackshot-aspect: class ability markeert 3 targets + scorching shots, en heelt je.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Crackshot", "Knock 'Em Down"],
    fragments: ["Ember of Torches", "Ember of Searing", "Ember of Empyrean", "Ember of Solace"],
    weapons: ["Sterke primary", "Special naar keuze", "Heavy DPS"],
    statPriority: ["Class", "Health", "Super"],
    howItWorks: "Crackshot maakt van je class ability een mini Golden Gun die 3 targets markeert, scorch toepast en je heelt bij 3 hits. Star-Eater Scales houdt je Super hoog.",
    source: "epiccarry / itemlevel " + C,
  },
  {
    id: "hunter-solar-caliban-pve",
    name: "Solar — Caliban's Hand (Scorch-Ignite)",
    activity: "PvE", guardianClass: "Hunter", subclass: "Solar", tier: "A",
    summary: "Melee-ignition loop: throwing knife ontbrandt, Crackshot vult bij.",
    exoticArmor: "Caliban's Hand",
    aspects: ["Crackshot", "On Your Mark"],
    fragments: ["Ember of Ashes", "Ember of Searing", "Ember of Torches", "Ember of Empyrean"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Caliban's Hand maakt je throwing knife een ontbrandende ignition; combineer met Crackshot voor een scorch/ignite-loop die groepen opruimt.",
    source: "epiccarry " + C,
  },
  {
    id: "hunter-prismatic-pve",
    name: "Prismatic — Threaded Specter",
    activity: "PvE", guardianClass: "Hunter", subclass: "Prismatic", tier: "A",
    summary: "Transcendence-uptime met clones, threadlings en burst-Super.",
    exoticArmor: "Star-Eater Scales",
    aspects: ["Threaded Specter", "Gunpowder Gamble"],
    fragments: ["Facet of Courage", "Facet of Bravery", "Facet of Protection", "Facet of Dawn"],
    weapons: ["Primary", "Special", "Heavy DPS"],
    statPriority: ["Health", "Class", "Super"],
    howItWorks: "Meng licht/duister voor snelle Transcendence; Threaded Specter levert add-clear en baits, Gunpowder Gamble geeft on-demand ignitions.",
    source: "mobalytics " + C,
  },
  // ===================== HUNTER — PvP =====================
  {
    id: "hunter-solar-duelist-pvp",
    name: "Solar — Crackshot Duelist",
    activity: "PvP", guardianClass: "Hunter", subclass: "Solar", tier: "S",
    summary: "Primary-duels met radar-control, heals en agressieve peeks.",
    exoticArmor: "Lucky Pants / St0mp-EE5",
    aspects: ["Crackshot", "On Your Mark"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["Top-tier hand cannon", "Shotgun", "Heavy naar keuze"],
    statPriority: ["Weapons", "Health", "Class"],
    howItWorks: "Lucky Pants pusht hand-cannon-damage/handling; Crackshot geeft een burst-optie + cure, en het dodge-ritme houdt je radar-control hoog.",
    source: "epiccarry " + C,
  },
  {
    id: "hunter-stompees-pvp",
    name: "Arc — St0mp-EE5 Movement",
    activity: "PvP", guardianClass: "Hunter", subclass: "Arc", tier: "A",
    summary: "Maximale sprong/slide + minder airborne-damage voor duels.",
    exoticArmor: "St0mp-EE5",
    aspects: ["Flow State", "Tempest Strike"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency"],
    weapons: ["120 hand cannon", "Shotgun of fusion", "Heavy"],
    statPriority: ["Weapons", "Health", "Class"],
    howItWorks: "St0mp-EE5 geeft extra sprong/slide-afstand en dempt airborne-damage; dwing duels op jouw voorwaarden met amplified-snelheid en dodge-resets.",
    source: "blueberries.gg " + C,
  },
  {
    id: "hunter-sixthcoyote-pvp",
    name: "Void — Sixth Coyote (Double Dodge)",
    activity: "PvP", guardianClass: "Hunter", subclass: "Void", tier: "A",
    summary: "Twee dodges achter elkaar voor flanks, baits en invis-plays.",
    exoticArmor: "Sixth Coyote",
    aspects: ["Stylish Executioner", "Vanishing Step"],
    fragments: ["Echo of Obscurity", "Echo of Persistence", "Echo of Starvation"],
    weapons: ["Hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Weapons", "Class", "Health"],
    howItWorks: "Sixth Coyote geeft een tweede dodge-lading; gebruik dodge naar invis (Vanishing Step) om te flanken, te resetten of veilig te reviven.",
    source: "fandomwire " + C,
  },

  // ===================== TITAN — PvE =====================
  {
    id: "titan-solar-ashenwake-pve",
    name: "Solar — Ashen Wake Fusion Grenade",
    activity: "PvE", guardianClass: "Titan", subclass: "Solar", tier: "S",
    summary: "Insta-fusion grenades die ontbranden — enorme add-clear met granaat-spam.",
    exoticArmor: "Ashen Wake",
    aspects: ["Roaring Flames", "Sol Invictus"],
    fragments: ["Ember of Resolve", "Ember of Empyrean", "Ember of Torches", "Ember of Char"],
    weapons: ["Demolitionist-primary", "Special naar keuze", "Heavy DPS"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Ashen Wake maakt fusion grenades instant + sterker; kills geven granaat-energie terug en sunspots (Sol Invictus) houden je in leven voor non-stop grenade-spam.",
    source: "skycoach / sportskeeda " + C,
  },
  {
    id: "titan-prismatic-hoil-pve",
    name: "Prismatic — Heart of Inmost Light",
    activity: "PvE", guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Ability-economie voor GMs: één ability empowert de andere twee.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Consecration", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Hope", "Facet of Dawn"],
    weapons: ["Add-clear primary", "Special", "Heavy DPS"],
    statPriority: ["Health", "Grenade", "Melee"],
    howItWorks: "Heart of Inmost Light empowert na elk ability-gebruik je andere twee abilities; Consecration-slams ontbranden en de loop houdt je staande onder druk in GMs.",
    source: "lagofast / mobalytics " + C,
  },
  {
    id: "titan-arc-skullfort-pve",
    name: "Arc — Insurmountable Skullfort",
    activity: "PvE", guardianClass: "Titan", subclass: "Arc", tier: "A",
    summary: "Melee-loop met heals: Thunderclap + One-Two Punch.",
    exoticArmor: "An Insurmountable Skullfort",
    aspects: ["Knockout", "Touch of Thunder"],
    fragments: ["Spark of Resistance", "Spark of Shock", "Spark of Frequency", "Spark of Discharge"],
    weapons: ["Without Remorse (One-Two Punch)", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Skullfort geeft melee-energie + heal bij Arc-melee-kills; stack Melee om cooldowns te slopen en blijf in de melee-loop met One-Two Punch.",
    source: "skycoach " + C,
  },
  {
    id: "titan-strand-wishful-pve",
    name: "Strand — Wishful Ignorance",
    activity: "PvE", guardianClass: "Titan", subclass: "Strand", tier: "A",
    summary: "\"Green Man\": absurde melee-damage met Frenzied Blade + Flechette Storm.",
    exoticArmor: "Wishful Ignorance",
    aspects: ["Flechette Storm", "Banner of War"],
    fragments: ["Thread of Warding", "Thread of Generation", "Thread of Ascent", "Thread of Transmutation"],
    weapons: ["Primary", "Special", "Heavy"],
    statPriority: ["Melee", "Health", "Class"],
    howItWorks: "Wishful Ignorance pompt je Frenzied Blade/Flechette Storm-damage omhoog tot boven sommige supers; Banner of War heelt je team terwijl je doorbeukt.",
    source: "skycoach " + C,
  },
  // ===================== TITAN — PvP =====================
  {
    id: "titan-hoil-pvp",
    name: "Prismatic — Heart of Inmost Light",
    activity: "PvP", guardianClass: "Titan", subclass: "Prismatic", tier: "S",
    summary: "Ability-spam onder druk: beste ability-economie in Crucible.",
    exoticArmor: "Heart of Inmost Light",
    aspects: ["Juggernaut", "Knockout"],
    fragments: ["Facet of Courage", "Facet of Resolve", "Facet of Protection"],
    weapons: ["120 hand cannon", "Shotgun of fusion", "Heavy naar keuze"],
    statPriority: ["Health", "Class", "Weapons"],
    howItWorks: "Heart of Inmost Light geeft eindeloze empowered grenades, melees en barricades; sterkste onder aanhoudende druk.",
    source: "lagofast " + C,
  },
  {
    id: "titan-void-bubble-pvp",
    name: "Void — Bubble Support (Trials)",
    activity: "PvP", guardianClass: "Titan", subclass: "Void", tier: "A",
    summary: "Ward of Dawn als zone-control + Weapons of Light; beste balans in Crucible.",
    exoticArmor: "Helm of Saint-14",
    aspects: ["Bastion", "Offensive Bulwark"],
    fragments: ["Echo of Persistence", "Echo of Leeching", "Echo of Provision"],
    weapons: ["Adaptive hand cannon", "Shotgun", "Heavy"],
    statPriority: ["Health", "Class", "Super"],
    howItWorks: "Helm of Saint-14 blindt vijanden in je bubbel; geeft je team Weapons of Light voor round-control. Void biedt de beste mix van survivability en lethality.",
    source: "leprestore " + C,
  },

  // ===================== WARLOCK — PvE =====================
  {
    id: "warlock-prismatic-getaway-pve",
    name: "Prismatic — Getaway Artist",
    activity: "PvE", guardianClass: "Warlock", subclass: "Prismatic", tier: "S",
    summary: "Constante Devour + Arc Soul + stasis-turret area denial.",
    exoticArmor: "Getaway Artist",
    aspects: ["Bleak Watcher", "Feed the Void"],
    fragments: ["Facet of Courage", "Facet of Protection", "Facet of Dawn", "Facet of Bravery"],
    weapons: ["Primary", "Special", "Heavy DPS"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Getaway Artist verbruikt je arc grenade voor een agressieve Arc Soul; Feed the Void houdt Devour permanent en Bleak Watcher-turrets doen area denial. Flexibel en survivable.",
    source: "skycoach / leprestore " + C,
  },
  {
    id: "warlock-void-contraverse-pve",
    name: "Void — Contraverse Devour (Solo)",
    activity: "PvE", guardianClass: "Warlock", subclass: "Void", tier: "S",
    summary: "Grenade-spam met permanente Devour + damage resist — top voor solo/endgame.",
    exoticArmor: "Contraverse Hold",
    aspects: ["Chaos Accelerant", "Feed the Void"],
    fragments: ["Echo of Persistence", "Echo of Undermining", "Echo of Instability", "Echo of Remnants"],
    weapons: ["Void primary (volatile)", "Special", "Heavy DPS"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Charged Void-granaten geven via Contraverse Hold energie terug en damage resist; Feed the Void houdt Devour draaiend voor constante heals.",
    source: "blueberries.gg " + C,
  },
  {
    id: "warlock-void-novabomb-pve",
    name: "Void — Double Nova Bomb (Skull)",
    activity: "PvE", guardianClass: "Warlock", subclass: "Void", tier: "A",
    summary: "Twee Nova Bombs achter elkaar + Bad Juju Devour-loop.",
    exoticArmor: "Skull of Dire Ahamkara",
    aspects: ["Chaos Accelerant", "Feed the Void"],
    fragments: ["Echo of Persistence", "Echo of Cessation", "Echo of Instability", "Echo of Remnants"],
    weapons: ["Bad Juju", "Special", "Heavy"],
    exoticWeapon: "Bad Juju",
    statPriority: ["Super", "Health", "Grenade"],
    howItWorks: "Skull of Dire Ahamkara laat je Nova Bomb: Lance direct nog eens casten; Bad Juju's String of Curses voedt Super-energie en houdt Devour aan.",
    source: "boostmatch / lagofast " + C,
  },
  {
    id: "warlock-solar-sunbracers-pve",
    name: "Solar — Sunbracers",
    activity: "PvE", guardianClass: "Warlock", subclass: "Solar", tier: "A",
    summary: "Oneindige solar-granaten voor massale add-clear.",
    exoticArmor: "Sunbracers",
    aspects: ["Touch of Flame", "Heat Rises"],
    fragments: ["Ember of Ashes", "Ember of Searing", "Ember of Empyrean", "Ember of Solace"],
    weapons: ["Add-clear primary", "Special", "Heavy"],
    statPriority: ["Grenade", "Health", "Class"],
    howItWorks: "Een melee-kill tijdens Heat Rises geeft 5s oneindige solar-granaten (Sunbracers) — spam ze voor enorme add-clear.",
    source: "blueberries.gg " + C,
  },
  // ===================== WARLOCK — PvP =====================
  {
    id: "warlock-solar-ophidian-pvp",
    name: "Solar — Ophidian Dawnblade",
    activity: "PvP", guardianClass: "Warlock", subclass: "Solar", tier: "S",
    summary: "Snappy weapon handling + restoration heals na duels — veilige all-rounder.",
    exoticArmor: "Ophidian Aspect",
    aspects: ["Heat Rises", "Touch of Flame"],
    fragments: ["Ember of Torches", "Ember of Solace", "Ember of Searing"],
    weapons: ["120 of 180 hand cannon", "Shotgun", "Heavy naar keuze"],
    statPriority: ["Class", "Health", "Weapons"],
    howItWorks: "Ophidian Aspect geeft topklasse ready/reload/handling voor betere duels; healing nades + Touch of Flame geven restoration na gevechten.",
    source: "blueberries.gg " + C,
  },
  {
    id: "warlock-stasis-osmiomancy-pvp",
    name: "Stasis — Osmiomancy Coldsnap",
    activity: "PvP", guardianClass: "Warlock", subclass: "Stasis", tier: "A",
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
