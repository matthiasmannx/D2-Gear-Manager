/**
 * Destiny 2 changelog — editorial. The Bungie API provides no patch notes, so
 * add new updates here (newest on top). Fill `url` with the official Bungie
 * patch notes or TWID. Content language: English.
 */

export interface ChangeEntry {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  highlights: string[];
  url?: string;
  tag?: "Major" | "Hotfix" | "Event" | "Rotation";
}

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "Weekly Reset",
    date: "2026-06-16",
    title: "Pantheon boss rotation started",
    tag: "Rotation",
    summary:
      "At the weekly reset the Pantheon 2.0 boss rotation began: two featured bosses are active in the rotators at a time.",
    highlights: [
      "Two featured Pantheon bosses per week",
      "New weekly milestones and challenges",
    ],
    url: "https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0",
  },
  {
    version: "9.7.0",
    date: "2026-06-09",
    title: "Destiny 2 — Final Live Service Update",
    tag: "Major",
    summary:
      "The last major update for Destiny 2 with 71 pages of patch notes: Pantheon 2.0, countless bug fixes and balance changes.",
    highlights: [
      "Pantheon 2.0 activity added",
      "Extensive weapon and sandbox balance",
      "Large batch of bug fixes",
    ],
    url: "https://www.bungie.net/7/en/News/Article/destiny_update_9_7_0",
  },
  {
    version: "Monument of Triumph",
    date: "2026-05-21",
    title: "Every End is a New Beginning",
    tag: "Event",
    summary:
      "Start of the Monument of Triumph era — the current meta the Meta Builds section is based on.",
    highlights: [
      "New seasonal meta and armor tiers",
      "Reworked exotic traits and builds",
    ],
    url: "https://www.bungie.net/7/en/News/Article/d2_may_21_2026",
  },
];
