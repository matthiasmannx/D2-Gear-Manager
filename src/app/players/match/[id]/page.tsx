import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { getMatchReport, MatchReport, MatchTeam } from "@/lib/bungie";

export const metadata = { title: "Match — Guardian Hub" };

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("players");
  const locale = await getLocale();

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
        {t("matchBack")}
      </Link>

      {error || !report ? (
        <>
          <h1>{t("matchTitle")}</h1>
          <div className="notice error">{t("matchLoadFailed")}{error ? `: ${error}` : ""}.</div>
        </>
      ) : (
        <>
          <h1 style={{ marginBottom: 0 }}>{report.mapName}</h1>
          <p className="muted">{report.mode} · {fmtDate(report.date, locale)}</p>

          <div className="match-teams">
            {report.teams.map((tm) => (
              <TeamCard key={tm.id} team={tm} colPlayer={t("colPlayer")} viewStats={t("viewStats")} viewBuild={t("viewBuild")} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function TeamCard({ team, colPlayer, viewStats, viewBuild }: { team: MatchTeam; colPlayer: string; viewStats: string; viewBuild: string }) {
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
          <span>{colPlayer}</span><span>K</span><span>D</span><span>A</span><span>K/D</span><span></span>
        </div>
        {team.players.map((p, i) => {
          const linkable = p.membershipType > 0 && p.membershipId !== "0";
          const nameInner = (
            <>
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
            </>
          );
          return (
            <div key={i} className="mp-row">
              {linkable ? (
                <Link href={`/players/${p.membershipType}/${p.membershipId}`} className="mp-name mp-link" title="Bekijk stats">{nameInner}</Link>
              ) : (
                <span className="mp-name">{nameInner}</span>
              )}
              <span>{p.kills}</span>
              <span>{p.deaths}</span>
              <span>{p.assists}</span>
              <span className="mp-kd">{p.kd}</span>
              {linkable ? (
                <Link href={`/players/${p.membershipType}/${p.membershipId}/build`} className="mp-build" title="Bekijk build">🔧</Link>
              ) : (
                <span />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
