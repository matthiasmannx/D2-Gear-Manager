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
  return { name: extras?.name ?? withM.bungieName ?? name, h: stats?.highlights ?? null, flawless: extras?.flawlessCount ?? null, type: m.membershipType, id: m.membershipId };
}

async function CompareBody({ a, b }: { a: string; b: string }) {
  const t = await getTranslations("compare");
  const tp = await getTranslations("players");
  const [pa, pb] = await Promise.all([resolve(a), resolve(b)]);
  if (!pa || !pb) return <div className="empty">{t("notFound")}</div>;

  const rows: { label: string; a: any; b: any; cmp?: boolean }[] = [
    { label: tp("statKd"), a: pa.h?.kd, b: pb.h?.kd, cmp: true },
    { label: tp("statWinRate"), a: pa.h?.winRate, b: pb.h?.winRate, cmp: true },
    { label: tp("statFlawless"), a: pa.flawless, b: pb.flawless, cmp: true },
    { label: tp("hlTotalKills"), a: pa.h?.totalKills, b: pb.h?.totalKills, cmp: true },
    { label: tp("hlCombatRating"), a: pa.h?.combatRating, b: pb.h?.combatRating, cmp: true },
    { label: tp("hlTimePlayed"), a: pa.h?.timePlayed, b: pb.h?.timePlayed },
  ];
  const num = (s: any) => { if (s == null) return null; const f = parseFloat(String(s).replace(/[%,\s]/g, "")); return Number.isFinite(f) ? f : null; };

  return (
    <div className="compare-grid">
      <div className="compare-head">
        <Link href={`/players/${pa.type}/${pa.id}`} className="compare-name">{pa.name}</Link>
        <span className="muted">vs</span>
        <Link href={`/players/${pb.type}/${pb.id}`} className="compare-name">{pb.name}</Link>
      </div>
      {rows.map((r) => {
        const na = num(r.a), nb = num(r.b);
        const aWin = r.cmp && na != null && nb != null && na > nb;
        const bWin = r.cmp && na != null && nb != null && nb > na;
        return (
          <div key={r.label} className="compare-row">
            <span className={`compare-val ${aWin ? "win" : ""}`}>{r.a ?? "-"}</span>
            <span className="compare-label muted">{r.label}</span>
            <span className={`compare-val ${bWin ? "win" : ""}`}>{r.b ?? "-"}</span>
          </div>
        );
      })}
    </div>
  );
}
