import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getBuild, getUserStates, listComments } from "@/lib/communityBuilds";
import { dbConfigured } from "@/lib/db";
import { isLoggedIn, getCurrentUserId, isAdmin } from "@/lib/auth";
import LikeFavorite from "@/components/LikeFavorite";
import Comments from "@/components/Comments";
import AdminControls from "@/components/AdminControls";

export const dynamic = "force-dynamic";

const STAT_ORDER = ["Weapons", "Health", "Class", "Grenade", "Melee", "Super"] as const;

export default async function BuildDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!dbConfigured()) notFound();
  const build = await getBuild(id, true);
  if (!build) notFound();

  const t = await getTranslations("community");
  const locale = await getLocale();
  const loggedIn = await isLoggedIn();
  const uid = await getCurrentUserId();
  const [states, comments, admin] = await Promise.all([
    uid ? getUserStates(uid, [build.id]) : Promise.resolve({} as Record<string, { liked: boolean; favorited: boolean }>),
    listComments(build.id),
    isAdmin(),
  ]);
  const st = states[build.id] ?? { liked: false, favorited: false };

  const created = (() => {
    try { return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(build.createdAt)); } catch { return ""; }
  })();

  const weapons = [
    { label: t("fKinetic"), w: build.loadout?.kinetic },
    { label: t("fEnergy"), w: build.loadout?.energy },
    { label: t("fPower"), w: build.loadout?.power },
  ].filter((x) => x.w);
  const exotic = build.loadout?.exoticArmor;

  return (
    <div className="community cb-detail">
      <Link href="/community" className="cb-back muted">← {t("back")}</Link>

      <header className="cb-detail-head">
        <div>
          <div className="cb-tags">
            {build.verified && <span className="bc-badge verified">✅ {t("verifiedBadge")}</span>}
            {build.featured && <span className="bc-badge featured">🔥 {t("featuredBadge")}</span>}
          </div>
          <h1>{build.title}</h1>
          <p className="muted">{build.subclass} {build.guardianClass}{build.super ? ` · ${build.super}` : ""} · {t("by")} {build.authorName} · {created}</p>
          {build.forkedFrom && (
            <p className="muted"><Link href={`/community/${build.forkedFrom}`}>↳ {t("forkedFrom")}</Link></p>
          )}
        </div>
        <div className="cb-detail-actions">
          <LikeFavorite buildId={build.id} likes={build.likes} favorites={build.favorites} liked={st.liked} favorited={st.favorited} loggedIn={loggedIn} labels={{ like: t("like"), favorite: t("favorite") }} />
          <Link href={`/community/create?fork=${build.id}`} className="btn">⑂ {t("fork")}</Link>
          {admin && <AdminControls buildId={build.id} verified={build.verified} featured={build.featured} />}
        </div>
      </header>

      <div className="cb-tags">
        {build.activities.map((a) => <span key={a} className={`bc-tag ${a === "PvE" ? "pve" : a === "PvP" ? "pvp" : ""}`}>{a}</span>)}
      </div>

      {build.description && <section className="card cb-section"><p className="cb-desc">{build.description}</p></section>}

      {weapons.length > 0 && (
        <section className="card cb-section">
          <h2>{t("fLoadout")}</h2>
          <div className="cb-loadout">
            {weapons.map(({ label, w }) => (
              <div key={label} className="cb-slot">
                {w!.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={w!.icon} alt="" />}
                <div style={{ minWidth: 0 }}>
                  <div className="muted cb-slot-label">{label}</div>
                  <div>{w!.hash ? <Link href={`/items/${w!.hash}`}>{w!.name}</Link> : w!.name}</div>
                  {w!.perks && (() => {
                    const p = [w!.perks!.barrel, w!.perks!.magazine, w!.perks!.trait1, w!.perks!.trait2, w!.perks!.masterwork].filter(Boolean);
                    return p.length ? <div className="cb-slot-perks">{p.join(" · ")}</div> : null;
                  })()}
                </div>
              </div>
            ))}
            {exotic && (
              <div className="cb-slot">
                {exotic.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={exotic.icon} alt="" />}
                <div>
                  <div className="muted cb-slot-label">{t("fExotic")}</div>
                  <div>{exotic.hash ? <Link href={`/items/${exotic.hash}`}>{exotic.name}</Link> : exotic.name}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {Object.keys(build.stats ?? {}).length > 0 && (
        <section className="card cb-section">
          <h2>{t("fStats")}</h2>
          <div className="cb-stat-bars">
            {STAT_ORDER.filter((k) => build.stats[k] != null).map((k) => (
              <div key={k} className="cb-stat-bar">
                <span className="cb-stat-name">{k}</span>
                <span className="cb-stat-track"><span className="cb-stat-fill" style={{ width: `${Math.min(100, (build.stats[k]! / 200) * 100)}%` }} /></span>
                <span className="cb-stat-val">{build.stats[k]}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(build.aspects.length > 0 || build.fragments.length > 0) && (
        <section className="card cb-section">
          {build.aspects.length > 0 && <><h2>{t("fAspects")}</h2><div className="cb-tags">{build.aspects.map((a) => <span key={a} className="bc-tag">{a}</span>)}</div></>}
          {build.fragments.length > 0 && <><h2 style={{ marginTop: "1rem" }}>{t("fFragments")}</h2><div className="cb-tags">{build.fragments.map((f) => <span key={f} className="bc-tag">{f}</span>)}</div></>}
        </section>
      )}

      {(() => {
        const ab = build.loadout?.abilities;
        const abItems = ab ? ([["Class Ability", ab.classAbility], ["Movement", ab.movement], ["Grenade", ab.grenade], ["Melee", ab.melee]] as [string, string | undefined][]).filter(([, v]) => v) : [];
        const mods = build.loadout?.mods ?? {};
        const modPieces = Object.keys(mods).filter((p) => (mods[p] ?? []).length > 0);
        if (abItems.length === 0 && modPieces.length === 0) return null;
        return (
          <section className="card cb-section">
            {abItems.length > 0 && (
              <>
                <h2>{t("fAbilities")}</h2>
                <div className="cb-tags">
                  {abItems.map(([l, v]) => <span key={l} className="bc-tag">{l}: {v}</span>)}
                </div>
              </>
            )}
            {modPieces.length > 0 && (
              <>
                <h2 style={{ marginTop: abItems.length ? "1rem" : 0 }}>{t("fMods")}</h2>
                {modPieces.map((p) => (
                  <div key={p} className="cb-mod-line"><b>{p}:</b> {mods[p].join(" · ")}</div>
                ))}
              </>
            )}
          </section>
        );
      })()}

      {build.loadout?.artifact && build.loadout.artifact.length > 0 && (
        <section className="card cb-section">
          <h2>{t("fArtifact")}</h2>
          <div className="cb-tags">
            {build.loadout.artifact.map((a) => <span key={a} className="bc-tag">{a}</span>)}
          </div>
        </section>
      )}

      <Comments buildId={build.id} comments={comments} currentUserId={uid} admin={admin} loggedIn={loggedIn} />
    </div>
  );
}
