import Link from "next/link";
import { getMatchReport, MatchReport, MatchTeam } from "@/lib/bungie";

export const metadata = { title: "Match — Guardian Hub" };

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let report: MatchReport | null = null;
  let error: string | null = null;
  try {
    report = await getMatchReport(id);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <>
      <Link href="/players" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Players
      </Link>

      {error || !report ? (
        <>
          <h1>Match</h1>
          <div className="notice error">Kon de match niet laden{error ? `: ${error}` : ""}.</div>
        </>
      ) : (
        <>
          <h1 style={{ marginBottom: 0 }}>{report.mapName}</h1>
          <p className="muted">{report.mode} · {fmtDate(report.date)}</p>

          <div className="match-teams">
            {report.teams.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function TeamCard({ team }: { team: MatchTeam }) {
  const win = /victory/i.test(team.result);
  return (
    <div className="card" style={{ borderLeft: `3px solid ${win ? "#38d39f" : team.result ? "var(--danger)" : "var(--border)"}` }}>
      {team.result && (
        <h3 style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: win ? "#38d39f" : "var(--danger)" }}>{team.result}</span>
          <span className="muted">{team.score}</span>
        </h3>
      )}
      <div className="match-players">
        <div className="mp-head muted">
          <span>Speler</span><span>K</span><span>D</span><span>A</span><span>K/D</span>
        </div>
        {team.players.map((p, i) => {
          const linkable = p.membershipType > 0 && p.membershipId !== "0";
          const row = (
            <>
              <span className="mp-name">
                {p.emblem && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.emblem} alt="" />
                )}
                <span className="mp-name-text">
                  <span className="mp-line1">
                    {p.name}
                    {p.mvp && <span className="mp-mvp">MVP</span>}
                  </span>
                  <span className="muted mp-sub">
                    {p.charClass}
                    {p.topWeapon ? ` · 🔫 ${p.topWeapon}` : ""}
                    {` · ☀️${p.superKills} 👊${p.meleeKills} 💣${p.grenadeKills} · 🎯${p.precisionPct}`}
                  </span>
                </span>
              </span>
              <span>{p.kills}</span>
              <span>{p.deaths}</span>
              <span>{p.assists}</span>
              <span className="mp-kd">{p.kd}</span>
            </>
          );
          return linkable ? (
            <Link key={i} href={`/players/${p.membershipType}/${p.membershipId}`} className="mp-row mp-link">
              {row}
            </Link>
          ) : (
            <div key={i} className="mp-row">{row}</div>
          );
        })}
      </div>
    </div>
  );
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
