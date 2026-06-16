import Link from "next/link";
import {
  getPvpStats,
  getPveStats,
  getPlayerExtras,
  getRecentMatches,
  PvpStatsResult,
  PveStats,
  PlayerExtras,
  MatchResult,
} from "@/lib/bungie";

export const metadata = { title: "Player stats — Guardian Hub" };

export default async function PlayerStats({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const mType = Number(type);

  let stats: PvpStatsResult = { modes: [], weapons: [], highlights: null };
  let extras: PlayerExtras = { characters: [], ranks: [], flawlessCount: null };
  let pve: PveStats | null = null;
  let failed = false;
  try {
    [stats, extras, pve] = await Promise.all([
      getPvpStats(mType, id),
      getPlayerExtras(mType, id),
      getPveStats(mType, id),
    ]);
  } catch {
    failed = true;
  }

  // Match history hangt af van de character-ids uit extras.
  let matches: MatchResult[] = [];
  if (extras.characters.length > 0) {
    try {
      matches = await getRecentMatches(
        mType,
        id,
        extras.characters.map((c) => c.characterId)
      );
    } catch {
      /* negeer; match history is optioneel */
    }
  }

  const h = stats.highlights;

  return (
    <>
      <Link href="/players" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Terug naar zoeken
      </Link>
      <h1>PvP Stats</h1>

      {failed && (
        <div className="notice error">
          Kon de stats niet laden. Mogelijk staat het profiel op privé in de
          Bungie-privacy-instellingen.
        </div>
      )}

      {/* ---- Highlights + ranks + flawless ---- */}
      <div className="stat-cards">
        <BigStat label="Lifetime K/D" value={h?.kd ?? "—"} accent />
        <BigStat label="Win rate" value={h?.winRate ?? "—"} />
        <BigStat label="Flawless (Trials)" value={extras.flawlessCount ?? "—"} accent />
        {extras.ranks.map((r) => (
          <BigStat key={r.label} label={r.label} value={r.rankName}
            sub={r.resets != null ? `${r.resets} resets` : undefined} small />
        ))}
      </div>

      {h && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Career highlights</h3>
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

      {/* ---- PvE ---- */}
      {pve && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>PvE</h3>
          <div className="hl-grid">
            <Mini label="K/D" value={pve.kd} />
            <Mini label="KDA" value={pve.kda} />
            <Mini label="Kills" value={pve.kills} />
            <Mini label="Deaths" value={pve.deaths} />
            <Mini label="Activiteiten geclear" value={pve.activitiesCleared} />
            <Mini label="Public events" value={pve.publicEvents} />
            <Mini label="Beste game (kills)" value={pve.bestGameKills} />
            <Mini label="Langste kill-streak" value={pve.longestSpree} />
            <Mini label="Tijd gespeeld" value={pve.timePlayed} />
          </div>
          {pve.weapons.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <span className="build-section-h">Favoriete wapentypes (PvE)</span>
              <WeaponBars weapons={pve.weapons} />
            </div>
          )}
        </div>
      )}

      {/* ---- Favoriete wapentypes (PvP) ---- */}
      {stats.weapons.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Favoriete wapentypes (PvP)</h3>
          <WeaponBars weapons={stats.weapons} />
        </div>
      )}

      {/* ---- Per-mode stats ---- */}
      {stats.modes.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Per playlist</h2>
          <div className="section-list">
            {stats.modes.map((s) => (
              <div key={s.mode} className="card">
                <h3 style={{ marginBottom: "0.6rem" }}>{s.label}</h3>
                <StatRow label="K/D" value={s.kd} highlight />
                <StatRow label="KDA" value={s.kda} />
                <StatRow label="Efficiency" value={s.efficiency} />
                <StatRow label="Win rate" value={s.winRate} />
                <StatRow label="Wins / games" value={`${s.wins} / ${s.games}`} />
                <StatRow label="Precisie-kills" value={s.precisionPct} />
                <StatRow label="Beste game" value={`${s.bestGameKills} kills`} />
                <StatRow label="Langste streak" value={s.longestSpree} />
                <StatRow label="Combat rating" value={s.combatRating} />
                <StatRow label="Tijd gespeeld" value={s.timePlayed} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- Recente wedstrijden ---- */}
      {matches.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Recente wedstrijden</h2>
          <div className="match-list">
            {matches.map((m, i) => (
              <div key={i} className={`match ${m.won ? "win" : "loss"}`}>
                <span className="match-result">{m.won ? "W" : "L"}</span>
                <span className="match-map">{m.mapName}</span>
                <span className="match-kda muted">
                  {m.kills}/{m.deaths}/{m.assists}
                </span>
                <span className="match-kd">{m.kd} K/D</span>
                <span className="match-date muted">{relTime(m.date)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!failed && !h && (
        <div className="empty">
          Geen publieke PvP-stats gevonden (geen PvP gespeeld of profiel op privé).
        </div>
      )}
    </>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="card big-stat">
      <div className="item-type">{label}</div>
      <div
        style={{
          fontSize: small ? "1.15rem" : "2rem",
          fontWeight: 800,
          color: accent ? "var(--accent)" : "var(--text)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
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
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(w.kills / max) * 100}%`,
                background: w.isAbility ? "var(--accent-2)" : "var(--accent)",
              }}
            />
          </div>
          <span className="muted" style={{ fontSize: "0.82rem", textAlign: "right" }}>
            {w.kills.toLocaleString("nl-NL")}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="stat-line">
      <span className="muted">{label}</span>
      <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? "var(--accent-2)" : undefined }}>
        {value}
      </span>
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
