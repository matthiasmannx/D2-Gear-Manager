import Link from "next/link";
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

export const metadata = { title: "Player stats — Guardian Hub" };

export default async function PlayerStats({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const mType = Number(type);
  const token = await getValidAccessToken();

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
      <Link href="/players" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Terug naar zoeken
      </Link>
      <div className="player-head">
        {extras.emblemPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={extras.emblemPath} alt="" className="player-emblem" />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>{extras.name ?? "Onbekende speler"}</h1>
          <div className="muted">PvP Stats{extras.platform ? ` · ${extras.platform}` : ""}</div>
        </div>
        {extras.name && <FavStar type={mType} id={id} name={extras.name} />}
      </div>

      {failed && (
        <div className="notice error">
          Kon de stats niet laden. Mogelijk staat het profiel op privé in de Bungie-privacy-instellingen.
        </div>
      )}

      {/* Samen gematcht */}
      {shared && !shared.self && (
        <div className="notice" style={{ marginTop: "0.5rem", borderLeftColor: shared.count > 0 ? "#38d39f" : "var(--border)" }}>
          {shared.count > 0 ? (
            <>
              🤝 Je hebt recent <strong>{shared.count}×</strong> in dezelfde PvP-match gezeten als deze speler
              {shared.teammate + shared.opponent > 0 && (
                <> — <span style={{ color: "#38d39f" }}>{shared.teammate}× teammate</span>, <span style={{ color: "var(--danger)" }}>{shared.opponent}× tegenstander</span></>
              )}
              .
            </>
          ) : (
            "Geen recente PvP-matches samen gevonden (op basis van je laatste ~50 games)."
          )}
        </div>
      )}

      {/* Top: K/D, win rate, flawless, ranks */}
      <div className="stat-cards">
        <BigStat label="Lifetime K/D" value={h?.kd ?? "—"} accent />
        <BigStat label="Win rate" value={h?.winRate ?? "—"} />
        <BigStat label="Flawless tickets" value={extras.flawlessCount ?? "—"} accent sub="verifieer op Trials Report" />
        {extras.ranks.map((r) => (
          <BigStat key={r.label} label={r.label} value={r.rankName} sub={r.resets != null ? `${r.resets} resets` : undefined} small />
        ))}
      </div>
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
        ℹ️ Lifetime-flawless zit niet betrouwbaar in de Bungie-API (de "tickets"-metric telt niet alles).{" "}
        <a href={`https://destinytrialsreport.com/report/${mType}/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>
          Bekijk de geverifieerde flawless-count op Trials Report ↗
        </a>
      </p>

      {/* Per modus: weekly + lifetime */}
      {modes.some((m) => m.lifetime.games > 0) && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Per modus</h2>
          <div className="section-list">
            {modes.filter((m) => m.lifetime.games > 0).map((m) => {
              const s = streaks[m.label];
              return (
              <div key={m.label} className="card">
                <h3 style={{ marginBottom: "0.3rem" }}>{m.label}</h3>
                <div className="streak-row">
                  {s?.current && (
                    <span className={`streak ${s.current.won ? "win" : "loss"}`}>
                      {s.current.won ? "🔥" : "❄️"} {s.current.n} {s.current.won ? "wins" : "losses"} op rij
                    </span>
                  )}
                  {s && s.longestWin > 1 && (
                    <span className="streak best">🏆 langste: {s.longestWin} wins</span>
                  )}
                </div>
                <div className="mode-block">
                  <span className="mode-block-h">Deze week</span>
                  {m.weekly.games > 0 ? (
                    <>
                      <StatRow label="K/D" value={m.weekly.kd} highlight />
                      <StatRow label="Win rate" value={m.weekly.winRate} />
                      <StatRow label="Wins / games" value={`${m.weekly.wins} / ${m.weekly.games}`} />
                    </>
                  ) : (
                    <div className="muted" style={{ fontSize: "0.85rem", padding: "0.2rem 0" }}>Geen games deze week.</div>
                  )}
                </div>
                <div className="mode-block">
                  <span className="mode-block-h">Lifetime</span>
                  <StatRow label="K/D" value={m.lifetime.kd} highlight />
                  <StatRow label="Win rate" value={m.lifetime.winRate} />
                  <StatRow label="Wins / games" value={`${m.lifetime.wins} / ${m.lifetime.games}`} />
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
          <h3>Career highlights (PvP)</h3>
          <div className="hl-grid">
            <Mini label="Totale kills" value={h.totalKills} />
            <Mini label="KDA" value={h.kda} />
            <Mini label="Precisie-kills" value={h.precisionPct} />
            <Mini label="Beste game (kills)" value={h.bestGameKills} />
            <Mini label="Langste kill-streak" value={h.longestSpree} />
            <Mini label="Langste leven" value={h.longestLife} />
            <Mini label="Combat rating" value={h.combatRating} />
            <Mini label="Tijd gespeeld" value={h.timePlayed} />
          </div>
        </div>
      )}

      {/* Favoriete wapentypes */}
      {stats.weapons.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Favoriete wapentypes</h3>
          <WeaponBars weapons={stats.weapons} />
        </div>
      )}

      {/* Recente wedstrijden */}
      {matches.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Recente wedstrijden</h2>
          <div className="match-list">
            {matches.map((m, i) => {
              const inner = (
                <>
                  <span className="match-result">{m.won ? "W" : "L"}</span>
                  <span className="match-map">{m.mapName}</span>
                  <span className="match-mode">{m.mode}</span>
                  <span className="match-kda muted">{m.kills}/{m.deaths}/{m.assists}</span>
                  <span className="match-kd">{m.kd} K/D</span>
                  <span className="match-date muted">{relTime(m.date)}</span>
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
        <div className="empty">Geen publieke PvP-stats gevonden (geen PvP gespeeld of profiel op privé).</div>
      )}
    </>
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
function WeaponBars({ weapons }: { weapons: { label: string; kills: number; isAbility: boolean }[] }) {
  const max = Math.max(...weapons.map((w) => w.kills), 1);
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {weapons.slice(0, 12).map((w) => (
        <div key={w.label} style={{ display: "grid", gridTemplateColumns: "130px 1fr 70px", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "0.85rem" }}>{w.label}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(w.kills / max) * 100}%`, background: w.isAbility ? "var(--accent-2)" : "var(--accent)" }} /></div>
          <span className="muted" style={{ fontSize: "0.82rem", textAlign: "right" }}>{w.kills.toLocaleString("nl-NL")}</span>
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
function relTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const days = Math.floor((Date.now() - then) / 86400000);
    if (days <= 0) return "vandaag";
    if (days === 1) return "gisteren";
    if (days < 7) return `${days}d geleden`;
    return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(then);
  } catch {
    return "";
  }
}
