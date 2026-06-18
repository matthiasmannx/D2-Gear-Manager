import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listBuilds, SortKey } from "@/lib/communityBuilds";
import { dbConfigured } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";
import BuildCard from "@/components/BuildCard";
import BuildFilters from "@/components/BuildFilters";

export const dynamic = "force-dynamic";

const SORTS: SortKey[] = ["trending", "top", "newest", "verified"];

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; class?: string; subclass?: string; activity?: string }>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("community");
  const sort = (SORTS.includes(sp.sort as SortKey) ? sp.sort : "trending") as SortKey;
  const loggedIn = await isLoggedIn();

  const labels = { by: t("by"), views: t("views"), verifiedBadge: t("verifiedBadge"), featuredBadge: t("featuredBadge") };
  const builds = dbConfigured()
    ? await listBuilds({ sort, guardianClass: sp.class, subclass: sp.subclass, activity: sp.activity })
    : [];

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { sort, class: sp.class, subclass: sp.subclass, activity: sp.activity, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/community?${p.toString()}`;
  };

  return (
    <div className="community">
      <header className="page-head">
        <div>
          <h1>{t("title")}</h1>
          <p className="muted">{t("tagline")}</p>
        </div>
        {loggedIn ? (
          <Link href="/community/create" className="btn btn-primary">+ {t("create")}</Link>
        ) : (
          <a href="/api/auth/login" className="btn btn-primary">+ {t("create")}</a>
        )}
      </header>

      {!dbConfigured() && <div className="notice">{t("dbMissing")}</div>}
      {!loggedIn && dbConfigured() && <div className="notice">{t("loginCta")}</div>}

      <div className="cb-tabs">
        {SORTS.map((s) => (
          <Link key={s} href={qs({ sort: s })} className={`cb-tab ${sort === s ? "active" : ""}`}>{t(s)}</Link>
        ))}
      </div>

      <BuildFilters labels={{ anyClass: t("anyClass"), anySubclass: t("anySubclass"), anyActivity: t("anyActivity"), clear: t("clearFilters") }} />

      {builds.length === 0 ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>{dbConfigured() ? t("empty") : ""}</p>
      ) : (
        <div className="bc-grid">
          {builds.map((b) => <BuildCard key={b.id} build={b} labels={labels} />)}
        </div>
      )}
    </div>
  );
}
