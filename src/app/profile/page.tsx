import Link from "next/link";
import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Loading } from "@/components/Skeleton";
import { getValidAccessToken } from "@/lib/auth";
import {
  getMemberships,
  getPlayerExtras,
  getPvpStats,
  PlayerExtras,
  PvpStatsResult,
} from "@/lib/bungie";

export const metadata = { title: "My Profile · Guardian Hub" };

const CLASS_NAMES: Record<number, string> = { 0: "Titan", 1: "Hunter", 2: "Warlock", 3: "Guardian" };
const CLASS_COLOR: Record<number, string> = { 0: "#e0564b", 1: "#4aa3c7", 2: "#e8a13a", 3: "#888" };

export default async function ProfilePage() {
  return (
    <Suspense fallback={<Loading cards={4} rows={3} />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const t = await getTranslations("profile");
  const tp = await getTranslations("players");
  const locale = await getLocale();
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
        <BigStat label={t("statKd")} value={h?.kd ?? "-"} accent />
        <BigStat label={t("statWinRate")} value={h?.winRate ?? "-"} />
        <BigStat label={t("statFlawless")} value={extras.flawlessCount ?? "-"} accent />
        {extras.ranks.map((r) => (
          <BigStat key={r.label} label={r.label} value={r.rankName} small />
        ))}
      </div>

      {/* Guardians met banner */}
      {extras.characters.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>{t("guardians")}</h2>
          <div className="section-list">
            {extras.characters.map((c) => (
              <div
                key={c.characterId}
                className="card prof-guardian"
                style={{
                  borderLeft: `3px solid ${CLASS_COLOR[c.classType] ?? "var(--border)"}`,
                  ...bannerBg(c.emblemBackground),
                }}
              >
                <div className="prof-guardian-class" style={{ color: CLASS_COLOR[c.classType] }}>
                  {CLASS_NAMES[c.classType] ?? "Guardian"}
                </div>
                <div className="prof-guardian-power">◆ {c.light}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Career highlights */}
      {h && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>{tp("careerHighlights")}</h3>
          <div className="hl-grid">
            <Mini label={tp("hlTotalKills")} value={h.totalKills} />
            <Mini label={tp("hlKda")} value={h.kda} />
            <Mini label={tp("hlPrecision")} value={h.precisionPct} />
            <Mini label={tp("hlBestGame")} value={h.bestGameKills} />
            <Mini label={tp("hlLongestSpree")} value={h.longestSpree} />
            <Mini label={tp("hlLongestLife")} value={h.longestLife} />
            <Mini label={tp("hlCombatRating")} value={h.combatRating} />
            <Mini label={tp("hlTimePlayed")} value={h.timePlayed} />
          </div>
        </div>
      )}

      {/* Favoriete wapentypes */}
      {stats && stats.weapons.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>{tp("favWeapons")}</h3>
          <WeaponBars weapons={stats.weapons} locale={locale} />
        </div>
      )}

      {/* Snelkoppelingen */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/gear" className="btn">{t("manageGear")}</Link>
        <Link href={`/players/${mType}/${mId}`} className="btn btn-outline">{t("fullStats")}</Link>
      </div>
    </>
  );
}

function bannerBg(url?: string): React.CSSProperties {
  if (!url) return {};
  return {
    backgroundImage: `linear-gradient(90deg, rgba(10,12,18,0.92) 0%, rgba(10,12,18,0.55) 55%, rgba(10,12,18,0.35) 100%), url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
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
