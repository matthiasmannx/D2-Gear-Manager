/**
 * Destiny 2 changelog — redactioneel. De Bungie API levert geen patch notes,
 * dus voeg nieuwe updates hier toe (nieuwste bovenaan). Vul `url` met de
 * officiële Bungie-patchnotes of TWID.
 */

export interface ChangeEntry {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  highlights: string[];
  url?: string;
  tag?: "Major" | "Hotfix" | "Event" | "Rotatie";
}

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "Weekly Reset",
    date: "2026-06-16",
    title: "Pantheon-bossrotatie gestart",
    tag: "Rotatie",
    summary:
      "Bij de wekelijkse reset begon de Pantheon 2.0-bossrotatie: er zijn telkens twee featured bosses tegelijk actief in de rotators.",
    highlights: [
      "Twee featured Pantheon-bosses per week",
      "Nieuwe wekelijkse milestones en challenges",
    ],
    url: "https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0",
  },
  {
    version: "9.7.0",
    date: "2026-06-09",
    title: "Destiny 2 — Final Live Service Update",
    tag: "Major",
    summary:
      "De laatste grote update voor Destiny 2 met 71 pagina's aan patch notes: Pantheon 2.0, talloze bugfixes en balansaanpassingen.",
    highlights: [
      "Pantheon 2.0-activiteit toegevoegd",
      "Uitgebreide weapon- en sandbox-balans",
      "Grote hoeveelheid bugfixes",
    ],
    url: "https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0",
  },
  {
    version: "Monument of Triumph",
    date: "2026-05-21",
    title: "Every End is a New Beginning",
    tag: "Event",
    summary:
      "Start van het Monument of Triumph-tijdperk — de huidige meta waarop de Meta Builds-sectie is gebaseerd.",
    highlights: [
      "Nieuwe seizoens-meta en armor-tiers",
      "Aangepaste exotic-traits en builds",
    ],
    url: "https://www.bungie.net/7/en/News/Article/d2_may_21_2026",
  },
];
