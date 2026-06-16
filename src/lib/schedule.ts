/**
 * Pure datum-helpers voor Destiny-resets en weekend-events. Geen API nodig —
 * Destiny reset op vaste UTC-tijden. Client-bruikbaar.
 *
 * - Dagelijkse reset: 17:00 UTC.
 * - Wekelijkse reset: dinsdag 17:00 UTC.
 * - Trials of Osiris & Xûr: vrijdag 17:00 UTC → dinsdag 17:00 UTC.
 */

const RESET_HOUR = 17; // UTC

/**
 * Bekende komende Iron Banner-startdata (ISO). De Bungie API geeft géén
 * toekomstige IB-data — Bungie kondigt die aan via de "This Week In Destiny".
 * Vul hier de aangekondigde startdata in (een IB-week loopt di → di).
 * Voorbeeld: "2026-07-07T17:00:00Z".
 */
export const IRON_BANNER_DATES: string[] = [];

/** Eerstvolgende bekende IB-startdatum na `from`, of null. */
export function nextIronBanner(from: Date = new Date()): Date | null {
  const upcoming = IRON_BANNER_DATES.map((d) => new Date(d))
    .filter((d) => d.getTime() > from.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0] ?? null;
}

export function nextDailyReset(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setUTCHours(RESET_HOUR, 0, 0, 0);
  if (d.getTime() <= from.getTime()) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

/** Eerstvolgende UTC-weekdag (0=zo..6=za) op RESET_HOUR. */
function nextWeekday(weekday: number, from: Date): Date {
  const d = new Date(from);
  d.setUTCHours(RESET_HOUR, 0, 0, 0);
  let diff = (weekday - d.getUTCDay() + 7) % 7;
  if (diff === 0 && d.getTime() <= from.getTime()) diff = 7;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function nextWeeklyReset(from: Date = new Date()): Date {
  return nextWeekday(2 /* dinsdag */, from);
}

export interface WeekendWindow {
  active: boolean;
  start: Date;
  end: Date;
}

/**
 * Het Trials/Xûr-weekendvenster (vrijdag 17:00 → dinsdag 17:00 UTC).
 * Als actief: start = afgelopen vrijdag, end = aankomende dinsdag.
 * Anders: start = aankomende vrijdag, end = de dinsdag daarna.
 */
export function weekendWindow(from: Date = new Date()): WeekendWindow {
  // Meest recente vrijdag 17:00 UTC <= from.
  const lastFri = new Date(from);
  lastFri.setUTCHours(RESET_HOUR, 0, 0, 0);
  let back = (lastFri.getUTCDay() - 5 + 7) % 7; // 5 = vrijdag
  if (back === 0 && lastFri.getTime() > from.getTime()) back = 7;
  lastFri.setUTCDate(lastFri.getUTCDate() - back);

  const close = new Date(lastFri);
  close.setUTCDate(close.getUTCDate() + 4); // vrijdag + 4 = dinsdag

  if (from.getTime() < close.getTime()) {
    return { active: true, start: lastFri, end: close };
  }
  const nextFri = new Date(lastFri);
  nextFri.setUTCDate(nextFri.getUTCDate() + 7);
  const nextClose = new Date(nextFri);
  nextClose.setUTCDate(nextClose.getUTCDate() + 4);
  return { active: false, start: nextFri, end: nextClose };
}
