import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getValidAccessToken } from "@/lib/auth";
import { loadGear } from "@/lib/gear";
import { analyzeVault, CleanupItem } from "@/lib/vaultCleanup";
import { Loading } from "@/components/Skeleton";
import LockKeepers from "@/components/LockKeepers";
import ArmorThreshold from "@/components/ArmorThreshold";

export const metadata = { title: "Vault cleanup · Guardian Hub" };
export const dynamic = "force-dynamic";

const TIER_COLOR: Record<string, string> = { Exotic: "#ceae33", Legendary: "#b58cf6", Rare: "#5076a3", Uncommon: "#5b9e4d", Common: "#c3bcb4" };

export default async function CleanupPage({ searchParams }: { searchParams: Promise<{ armorMin?: string }> }) {
  const { armorMin } = await searchParams;
  const min = Math.max(0, Math.min(100, Number(armorMin) || 65));
  const t = await getTranslations("cleanup");
  return (
    <>
      <Link href="/gear" className="muted" style={{ display: "inline-block", marginBottom: "0.75rem" }}>← Gear</Link>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <Suspense fallback={<Loading cards={4} rows={3} />}>
        <CleanupBody armorMin={min} />
      </Suspense>
    </>
  );
}

async function CleanupBody({ armorMin }: { armorMin: number }) {
  const t = await getTranslations("cleanup");
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <div className="notice" style={{ marginTop: "1rem" }}>
        {t("loginPrompt")} <a href="/api/auth/login" className="btn" style={{ marginLeft: "0.5rem" }}>Login</a>
      </div>
    );
  }
  let data;
  try {
    data = await loadGear(token);
  } catch (e: any) {
    return <div className="notice error">{e.message}</div>;
  }
  if (!data || data.vault.length === 0) return <div className="empty">{t("noVault")}</div>;

  const a = await analyzeVault(data.vault, armorMin);
  const charId = data.characters[0]?.characterId ?? "";

  return (
    <>
      <div className="stat-cards" style={{ marginTop: "1rem" }}>
        <Stat label={t("sumGod")} value={a.counts.godroll} accent />
        <Stat label={t("sumArmor")} value={a.counts.armorgood} accent />
        <Stat label={t("sumExotic")} value={a.counts.exotic} />
        <Stat label={t("sumMw")} value={a.counts.masterwork} />
        <Stat label={t("sumJunk")} value={a.counts.junk} />
        <Stat label={t("sumReview")} value={a.counts.review} />
      </div>

      <div className="cleanup-bar">
        <LockKeepers targets={a.lockTargets} characterId={charId} membershipType={data.membershipType} labels={{ lock: t("lock"), locking: t("locking"), none: t("lockNone") }} />
        <ArmorThreshold value={a.armorMin} label={t("armorMinLabel")} />
        <span className="muted cleanup-note">{t("powerNote")}</span>
      </div>

      <CleanupSection title={`★ ${t("godTitle")}`} count={a.godRolls.length} desc={t("godDesc")} items={a.godRolls} t={t} />
      <CleanupSection title={`🛡 ${t("armorTitle")}`} count={a.armorGood.length} desc={t("armorDesc")} items={a.armorGood} t={t} />
      <CleanupSection title={`✦ ${t("sumExotic")}`} count={a.exotics.length} items={a.exotics} t={t} collapsed />
      <CleanupSection title={`◆ ${t("mwTitle")}`} count={a.masterworks.length} desc={t("mwDesc")} items={a.masterworks} t={t} collapsed />
      <CleanupSection title={`🗑 ${t("junkTitle")}`} count={a.junk.length} desc={t("junkDesc")} items={a.junk} t={t} collapsed />
      <CleanupSection title={`❓ ${t("reviewTitle")}`} count={a.review.length} desc={t("reviewDesc")} items={a.review} t={t} collapsed />
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="card big-stat">
      <div className="item-type">{label}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
    </div>
  );
}

function CleanupSection({ title, count, desc, items, t, collapsed }: { title: string; count: number; desc?: string; items: CleanupItem[]; t: (k: string) => string; collapsed?: boolean }) {
  if (count === 0) return null;
  const shown = items.slice(0, 200);
  const body = (
    <>
      {desc && <p className="muted" style={{ margin: "0 0 0.6rem", fontSize: "0.85rem" }}>{desc}</p>}
      <div className="cleanup-list">
        {shown.map((it) => (
          <div key={it.instanceId ?? it.hash} className="cleanup-row" style={{ borderLeft: `3px solid ${TIER_COLOR[it.tier] ?? "var(--border)"}` }}>
            {it.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img className="item-icon" src={it.icon} alt="" />}
            <div className="cleanup-info">
              <div className="cleanup-name">
                {it.name}
                {it.rollPve && <span className="cleanup-tag pve"> PvE</span>}
                {it.rollPvp && <span className="cleanup-tag pvp"> PvP</span>}
              </div>
              <div className="cleanup-meta muted">
                {[it.tier, it.type].filter(Boolean).join(" · ")}
                {it.statTotal != null && <span className="cleanup-total"> {it.statTotal} pts</span>}
                {it.gearTier ? <span className="cleanup-tag tier"> T{it.gearTier}</span> : null}
                {it.dupe && <span className="cleanup-tag dupe"> {t("dupeTag")}</span>}
                {it.locked && <span className="cleanup-tag locked"> 🔒</span>}
              </div>
            </div>
            <a className="cleanup-lgg" href={it.lightgg} target="_blank" rel="noopener noreferrer">light.gg ↗</a>
          </div>
        ))}
      </div>
      {items.length > shown.length && <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>+{items.length - shown.length}…</p>}
    </>
  );
  return (
    <section className="card cb-section" style={{ marginTop: "1rem" }}>
      {collapsed ? (
        <details>
          <summary className="cleanup-summary"><h2 style={{ display: "inline", fontSize: "1.05rem" }}>{title} ({count})</h2></summary>
          <div style={{ marginTop: "0.6rem" }}>{body}</div>
        </details>
      ) : (
        <>
          <h2 style={{ fontSize: "1.05rem" }}>{title} ({count})</h2>
          {body}
        </>
      )}
    </section>
  );
}
