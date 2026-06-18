import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getValidAccessToken } from "@/lib/auth";
import {
  getMemberships,
  getPlayerExtras,
  getPvpStats,
  PlayerExtras,
  PvpStatsResult,
} from "@/lib/bungie";

export const metadata = { title: "My Profile — Guardian Hub" };

const CLASS_NAMES: Record<number, string> = { 0: "Titan", 1: "Hunter", 2: "Warlock", 3: "Guardian" };
const CLASS_COLOR: Record<number, string> = { 0: "#e0564b", 1: "#4aa3c7", 2: "#e8a13a", 3: "#888" };

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const token = await getValidAccessToken();
  if (!token) return <LoginPrompt />;

  let extras: PlayerExtras | null = null;
  let stats: PvpStatsResult | null = null;
  let mType = 0;
  let mId = "";
  let failed = false;
  try {
    const { primary } = await getMemberships(token);
    if (!primary) throw new Error("no membership");
    mType = primary.membershipType;
    mId = primary.membershipId;
    [extras, stats] = await Promise.all([getPlayerExtras(mType, mId), getPvpStats(mType, mId)]);
  } catch {
    failed = true;
  }

  if (failed || !extras) {
    return (
      <>
        <h1>{t("title")}</h1>
        <div className="notice error">{t("loadFailed")}</div>
      </>
    );
  }

  const h = stats?.highlights;

  return (
    <>
      <div className="player-head">
        {extras.emblemPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={extras.emblemPath} alt="" className="player-emblem" />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>{extras.name ?? t("title")}</h1>
          <div className="muted">{t("title")}{extras.platform ? ` · ${extras.platform}` : ""}</div>
        </div>
      </div>
      <p className="muted">{t("intro")}</p>

      {/* Top stats */}
      <div className="stat-cards">
        <BigStat label={t("statKd")} value={h?.kd ?? "—"} accent />
        <BigStat label={t("statWinRate")} value={h?.winRate ?? "—"} />
        <BigStat label={t("statFlawless")} value={extras.flawlessCount ?? "—"} accent />
        {extras.ranks.map((r) => (
          <BigStat key={r.label} label={r.label} value={r.rankName} small />
        ))}
      </div>

      {/* Guardians */}
      {extras.characters.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>{t("guardians")}</h2>
          <div className="section-list">
            {extras.characters.map((c) => (
              <div
                key={c.characterId}
                className="card prof-guardian"
                style={{ borderLeft: `3px solid ${CLASS_COLOR[c.classType] ?? "var(--border)"}` }}
              >
                {c.emblemPath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.emblemPath} alt="" className="prof-emblem" />
                )}
                <div>
                  <div className="item-name" style={{ color: CLASS_COLOR[c.classType] }}>
                    {CLASS_NAMES[c.classType] ?? "Guardian"}
                  </div>
                  <div className="item-type">◆ {c.light}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Snelkoppelingen */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/gear" className="btn">{t("manageGear")}</Link>
        <Link href={`/players/${mType}/${mId}`} className="btn btn-outline">{t("fullStats")}</Link>
      </div>
    </>
  );
}

function BigStat({ label, value, accent, small }: { label: string; value: string | number; accent?: boolean; small?: boolean }) {
  return (
    <div className="card big-stat">
      <div className="item-type">{label}</div>
      <div style={{ fontSize: small ? "1.15rem" : "2rem", fontWeight: 800, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

async function LoginPrompt() {
  const t = await getTranslations("profile");
  return (
    <>
      <h1>{t("title")}</h1>
      <div className="notice">{t("loginPrompt")}</div>
      <a href="/api/auth/login" className="btn" style={{ marginTop: "1rem" }}>
        {t("loginBtn")}
      </a>
    </>
  );
}
