import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { searchPlayers, getPvpStats, getPlayerExtras } from "@/lib/bungie";
import { Loading } from "@/components/Skeleton";
import CompareForm from "@/components/CompareForm";

export const metadata = { title: "Compare · Guardian Hub" };
export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const { a, b } = await searchParams;
  const t = await getTranslations("compare");
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <CompareForm a0={a} b0={b} labels={{ p1: t("p1"), p2: t("p2"), compare: t("compare") }} />
      {a && b && (
        <Suspense key={`${a}|${b}`} fallback={<Loading head={false} cards={0} rows={6} />}>
          <CompareBody a={a} b={b} />
        </Suspense>
      )}
    </>
  );
}

async function resolve(name: string) {
  const results = await searchPlayers(name).catch(() => []);
  const withM = results.find((r) => r.memberships?.length);
  if (!withM) return null;
  const m = withM.memberships.find((x: any) => x.crossSaveOverride === x.membershipType) ?? withM.memberships[0];
  const [stats, extras] = await Promise.all([
    getPvpStats(m.membershipType, m.membershipId).catch(() => null),
    getPlayerExtras(m.membershipType, m.membershipId).catch(() => null),
  ]);
  return {
    name: extras?.name ?? withM.bungieName ?? name,
    platform: extras?.platform ?? null,
    emblem: extras?.emblemPath ?? null,
    banner: extras?.characters?.[0]?.emblemBackground ?? null,
    h: stats?.highlights ?? null,
    flawless: extras?.flawlessCount ?? null,
    type: m.membershipType,
    id: m.membershipId,
  };
}

const num = (s: any) => { if (s == null) return null; const f = parseFloat(String(s).replace(/[%,\s]/g, "")); return Number.isFinite(f) ? f : null; };

async function CompareBody({ a, b }: { a: string; b: string }) {
  const t = await getTranslations("compare");
  const tp = await getTranslations("players");
  const [pa, pb] = await Promise.all([resolve(a), resolve(b)]);
  if (!pa || !pb) return <div className="empty">{t("notFound")}</div>;

  const rows = [
    { label: tp("statKd"), a: pa.h?.kd, b: pb.h?.kd, cmp: true },
    { label: tp("statWinRate"), a: pa.h?.winRate, b: pb.h?.winRate, cmp: true },
    { label: tp("statFlawless"), a: pa.flawless, b: pb.flawless, cmp: true },
    { label: tp("hlTotalKills"), a: pa.h?.totalKills, b: pb.h?.totalKills, cmp: true },
    { label: tp("hlCombatRating"), a: pa.h?.combatRating, b: pb.h?.combatRating, cmp: true },
    { label: tp("hlTimePlayed"), a: pa.h?.timePlayed, b: pb.h?.timePlayed, cmp: false },
  ];

  let aWins = 0, bWins = 0;
  for (const r of rows) {
    if (!r.cmp) continue;
    const na = num(r.a), nb = num(r.b);
    if (na != null && nb != null) { if (na > nb) aWins++; else if (nb > na) bWins++; }
  }

  return (
    <div className="cmp">
      <div className="cmp-head">
        <PlayerHead p={pa} win={aWins > bWins} />
        <div className="cmp-vs">VS</div>
        <PlayerHead p={pb} win={bWins > aWins} right />
      </div>

      <div className="cmp-stats">
        {rows.map((r) => {
          const na = num(r.a), nb = num(r.b);
          const aWin = r.cmp && na != null && nb != null && na > nb;
          const bWin = r.cmp && na != null && nb != null && nb > na;
          const total = (na ?? 0) + (nb ?? 0);
          const aw = r.cmp && total > 0 ? Math.round(((na ?? 0) / total) * 100) : 50;
          return (
            <div key={r.label} className="cmp-stat">
              <div className="cmp-stat-row">
                <span className={`cmp-val ${aWin ? "win" : ""}`}>{r.a ?? "-"}</span>
                <span className="cmp-stat-label">{r.label}</span>
                <span className={`cmp-val cmp-val-r ${bWin ? "win" : ""}`}>{r.b ?? "-"}</span>
              </div>
              {r.cmp && (
                <div className="cmp-bar">
                  <div className={`cmp-bar-a ${aWin ? "win" : ""}`} style={{ width: `${aw}%` }} />
                  <div className={`cmp-bar-b ${bWin ? "win" : ""}`} style={{ width: `${100 - aw}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerHead({ p, win, right }: { p: any; win: boolean; right?: boolean }) {
  return (
    <Link
      href={`/players/${p.type}/${p.id}`}
      className={`cmp-player ${right ? "right" : ""} ${win ? "winner" : ""}`}
      style={p.banner ? { backgroundImage: `linear-gradient(90deg, rgba(11,14,20,0.82), rgba(11,14,20,0.55)), url(${p.banner})` } : undefined}
    >
      {p.emblem && /* eslint-disable-next-line @next/next/no-img-element */ <img className="cmp-emblem" src={p.emblem} alt="" />}
      <span className="cmp-player-info">
        <span className="cmp-player-name">{win && "🏆 "}{p.name}</span>
        {p.platform && <span className="cmp-player-plat muted">{p.platform}</span>}
      </span>
    </Link>
  );
}
