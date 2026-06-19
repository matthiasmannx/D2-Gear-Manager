import Link from "next/link";
import { Suspense } from "react";
import {
  getPvpStats,
  getPvpModes,
  getPlayerExtras,
  getRecentMatches,
  getSharedMatchCount,
  getMatchStreaks,
  PvpStatsResult,
  PvpModeSummary,
  PlayerExtras,
  MatchResult,
  StreakInfo,
} from "@/lib/bungie";
import { getValidAccessToken } from "@/lib/auth";
import { FavStar } from "@/components/Favorites";
import LiveActivity from "@/components/LiveActivity";
import { getTranslations, getLocale } from "next-intl/server";

export const metadata = { title: "Player stats · Guardian Hub" };

export default async function PlayerStats({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const t = await getTranslations("players");
  return (
    <>
      <Link href="/players" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        {t("back")}
      </Link>
      <Suspense fallback={<PlayerSkeleton label={t("pvpStats")} />}>
        <PlayerBody type={type} id={id} />
      </Suspense>
    </>
  );
}

async function PlayerBody({ type, id }: { type: string; id: string }) {
  const mType = Number(type);
  const token = await getValidAccessToken();
  const t = await getTranslations("players");
  const locale = await getLocale();

  let stats: PvpStatsResult = { modes: [], weapons: [], highlights: null };
  let extras: PlayerExtras = { name: null, platform: null, emblemPath: null, characters: [], ranks: [], flawlessCount: null };
  let failed = false;
  try {
    [stats, extras] = await Promise.all([getPvpStats(mType, id), getPlayerExtras(mType, id)]);
  } catch {
    failed = true;
  }

  const charIds = extras.characters.map((c) => c.characterId);
  const [modes, matches, shared, streaks] = await Promise.all([
    charIds.length ? getPvpModes(mType, id, charIds).catch(() => []) : Promise.resolve([] as PvpModeSummary[]),
    charIds.length ? getRecentMatches(mType, id, charIds).catch(() => []) : Promise.resolve([] as MatchResult[]),
    token && charIds.length
      ? getSharedMatchCount(token, { membershipType: mType, membershipId: id, characterIds: charIds }).catch(() => null)
      : Promise.resolve(null),
    charIds.length ? getMatchStreaks(mType, id, charIds).catch(() => ({} as Record<string, StreakInfo>)) : Promise.resolve({} as Record<string, StreakInfo>),
  ]);

  const h = stats.highlights;

  return (
    <>
      <div className="player-head">
        {extras.emblemPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={extras.emblemPath} alt="" className="player-emblem" />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>{extras.name ?? t("unknownPlayer")}</h1>
          <div className="muted">{t("pvpStats")}{extras.platform ? ` · ${extras.platform}` : ""}</div>
        </div>
        {extras.name && <FavStar type={mType} id={id} name={extras.name} />}
      </div>

      <LiveActivity type={mType} id={id} />

      {failed && <div className="notice error">{t("loadFailed")}</div>}

      {/* Samen gematcht */}
      {shared && !shared.self && (
        <div className="notice" style={{ marginTop: "0.5rem", borderLeftColor: shared.count > 0 ? "#38d39f" : "var(--border)" }}>
          {shared.count > 0 ? (
            <>
              {t("shared", { count: shared.count })}
              {shared.teammate + shared.opponent > 0 && (
                <>, <span style={{ color: "#38d39f" }}>{t("sharedTeammate", { n: shared.teammate })}</span>, <span style={{ color: "var(--danger)" }}>{t("sharedOpponent", { n: shared.opponent })}</span></>
              )}
              .
            </>
          ) : (
            t("sharedNone")
          )}
        </div>
      )}

      {/* Top: K/D, win rate, flawless, ranks */}
      <div className="stat-cards">
        <BigStat label={t("statKd")} value={h?.kd ?? "-"} accent />
        <BigStat label={t("statWinRate")} value={h?.winRate ?? "-"} />
        <BigStat label={t("statFlawless")} value={extras.flawlessCount ?? "-"} accent sub={t("flawlessSub")} />
        {extras.ranks.map((r) => (
          <BigStat key={r.label} label={r.label} value={r.rankName} sub={r.resets != null ? t("resets", { n: r.resets }) : undefined} small />
        ))}
      </div>
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
        {t("flawlessNote")}{" "}
        <a href={`https://destinytrialsreport.com/report/${mType}/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>
          {t("flawlessLink")}
        </a>
      </p>

      {/* Per modus: weekly + lifetime */}
      {modes.some((m) => m.lifetime.games > 0) && (
        <>
          <h2 style={{ marginTop: "2rem" }}>{t("perMode")}</h2>
          <div className="section-list">
            {modes.filter((m) => m.lifetime.games > 0).map((m) => {
              const s = streaks[m.label];
              return (
              <div key={m.label} className="card">
                <h3 style={{ marginBottom: "0.3rem" }}>{m.label}</h3>
                <div className="streak-row">
                  {s?.current && (
                    <span className={`streak ${s.current.won ? "win" : "loss"}`}>
                      {s.current.won ? "🔥" : "❄️"} {t(s.current.won ? "streakWin" : "streakLoss", { n: s.current.n })}
                    </span>
                  )}
                  {s && s.longestWin > 1 && (
                    <span className="streak best">🏆 {t("longest", { n: s.longestWin })}</span>
                  )}
                </div>
                <div className="mode-block">
                  <span className="mode-block-h">{t("thisWeek")}</span>
                  {m.weekly.games > 0 ? (
                    <>
                      <StatRow label={t("kd")} value={m.weekly.kd} highlight />
                      <StatRow label={t("winRate")} value={m.weekly.winRate} />
                      <StatRow label={t("winsGames")} value={`${m.weekly.wins} / ${m.weekly.games}`} />
                    </>
                  ) : (
                    <div className="muted" style={{ fontSize: "0.85rem", padding: "0.2rem 0" }}>{t("noGamesWeek")}</div>
                  )}
                </div>
                <div className="mode-block">
                  <span className="mode-block-h">{t("lifetime")}</span>
                  <StatRow label={t("kd")} value={m.lifetime.kd} highlight />
                  <StatRow label={t("winRate")} value={m.lifetime.winRate} />
                  <StatRow label={t("winsGames")} value={`${m.lifetime.wins} / ${m.lifetime.games}`} />
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* Career highlights */}
      {h && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>{t("careerHighlights")}</h3>
          <div className="hl-grid">
            <Mini label={t("hlTotalKills")} value={h.totalKills} />
            <Mini label={t("hlKda")} value={h.kda} />
            <Mini label={t("hlPrecision")} value={h.precisionPct} />
            <Mini label={t("hlBestGame")} value={h.bestGameKills} />
            <Mini label={t("hlLongestSpree")} value={h.longestSpree} />
            <Mini label={t("hlLongestLife")} value={h.longestLife} />
            <Mini label={t("hlCombatRating")} value={h.combatRating} />
            <Mini label={t("hlTimePlayed")} value={h.timePlayed} />
          </div>
        </div>
      )}

      {/* Favoriete wapentypes */}
      {stats.weapons.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>{t("favWeapons")}</h3>
          <WeaponBars weapons={stats.weapons} locale={locale} />
        </div>
      )}

      {/* Recente wedstrijden */}
      {matches.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>{t("recentMatches")}</h2>
          <div className="match-list">
            {matches.map((m, i) => {
              const inner = (
                <>
                  <span className="match-result">{m.won ? "W" : "L"}</span>
                  <span className="match-map">{m.mapName}</span>
                  <span className="match-mode">{m.mode}</span>
                  <span className="match-kda muted">{m.kills}/{m.deaths}/{m.assists}</span>
                  <span className="match-kd">{m.kd} K/D</span>
                  <span className="match-date muted">{relTime(m.date, locale, { today: t("relToday"), yesterday: t("relYesterday"), daysAgo: (n: number) => t("relDaysAgo", { n }) })}</span>
                </>
              );
              return m.instanceId ? (
                <Link key={i} href={`/players/match/${m.instanceId}`} className={`match match-link ${m.won ? "win" : "loss"}`}>
                  {inner}
                </Link>
              ) : (
                <div key={i} className={`match ${m.won ? "win" : "loss"}`}>{inner}</div>
              );
            })}
          </div>
        </>
      )}

      {!failed && !h && modes.every((m) => m.lifetime.games === 0) && (
        <div className="empty">{t("noPvp")}</div>
      )}
    </>
  );
}

function PlayerSkeleton({ label }: { label: string }) {
  return (
    <div className="player-skel" aria-busy="true">
      <div className="player-head">
        <div className="skel skel-emblem" />
        <div style={{ flex: 1 }}>
          <div className="skel skel-line" style={{ width: "40%", height: "1.6rem" }} />
          <div className="skel skel-line muted" style={{ width: "20%", marginTop: "0.5rem" }} />
        </div>
      </div>
      <div className="muted" style={{ fontSize: "0.85rem", margin: "0.5rem 0 1rem" }}>{label}…</div>
      <div className="stat-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card big-stat"><div className="skel skel-line" style={{ width: "60%" }} /><div className="skel skel-line" style={{ width: "40%", height: "1.8rem", marginTop: "0.5rem" }} /></div>
        ))}
      </div>
      <div className="section-list" style={{ marginTop: "1.5rem" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card"><div className="skel skel-line" style={{ width: "50%", height: "1.2rem" }} /><div className="skel skel-line" style={{ width: "80%", marginTop: "0.6rem" }} /><div className="skel skel-line" style={{ width: "70%", marginTop: "0.4rem" }} /></div>
        ))}
      </div>
    </div>
  );
}

function BigStat({ label, value, sub, accent, small }: { label: string; value: string | number; sub?: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="card big-stat">
      <div className="item-type">{label}</div>
      <div style={{ fontSize: small ? "1.15rem" : "2rem", fontWeight: 800, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: "0.75rem" }}>{sub}</div>}
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: "0.78rem" }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}
function WeaponBars({ weapons, locale }: { weapons: { label: string; kills: number; isAbility: boolean }[]; locale: string }) {
  const max = Math.max(...weapons.map((w) => w.kills), 1);
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {weapons.slice(0, 12).map((w) => (
        <div key={w.label} style={{ display: "grid", gridTemplateColumns: "130px 1fr 70px", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "0.85rem" }}>{w.label}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(w.kills / max) * 100}%`, background: w.isAbility ? "var(--accent-2)" : "var(--accent)" }} /></div>
          <span className="muted" style={{ fontSize: "0.82rem", textAlign: "right" }}>{w.kills.toLocaleString(locale)}</span>
        </div>
      ))}
    </div>
  );
}
function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="stat-line">
      <span className="muted">{label}</span>
      <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? "var(--accent-2)" : undefined }}>{value}</span>
    </div>
  );
}
function relTime(
  iso: string,
  locale: string,
  labels: { today: string; yesterday: string; daysAgo: (n: number) => string }
): string {
  try {
    const then = new Date(iso).getTime();
    const days = Math.floor((Date.now() - then) / 86400000);
    if (days <= 0) return labels.today;
    if (days === 1) return labels.yesterday;
    if (days < 7) return labels.daysAgo(days);
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(then);
  } catch {
    return "";
  }
}
