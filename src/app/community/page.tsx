import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { listBuilds, SortKey } from "@/lib/communityBuilds";
import { dbConfigured } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";
import BuildCard from "@/components/BuildCard";
import BuildFilters from "@/components/BuildFilters";
import { Loading } from "@/components/Skeleton";

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

      {dbConfigured() && (
        <Suspense key={`${sort}:${sp.class ?? ""}:${sp.subclass ?? ""}:${sp.activity ?? ""}`} fallback={<Loading head={false} cards={6} rows={0} />}>
          <BuildList sort={sort} guardianClass={sp.class} subclass={sp.subclass} activity={sp.activity} />
        </Suspense>
      )}
    </div>
  );
}

async function BuildList({ sort, guardianClass, subclass, activity }: { sort: SortKey; guardianClass?: string; subclass?: string; activity?: string }) {
  const t = await getTranslations("community");
  const labels = { by: t("by"), views: t("views"), verifiedBadge: t("verifiedBadge"), featuredBadge: t("featuredBadge") };
  const builds = await listBuilds({ sort, guardianClass, subclass, activity });
  if (builds.length === 0) return <p className="muted" style={{ marginTop: "1.5rem" }}>{t("empty")}</p>;
  return (
    <div className="bc-grid">
      {builds.map((b) => <BuildCard key={b.id} build={b} labels={labels} />)}
    </div>
  );
}
