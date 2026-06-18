import { getTranslations } from "next-intl/server";
import { isLoggedIn } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { getBuild, CommunityBuildInput } from "@/lib/communityBuilds";
import BuildCreator from "@/components/BuildCreator";

export const dynamic = "force-dynamic";

export default async function CreateBuildPage({
  searchParams,
}: {
  searchParams: Promise<{ fork?: string }>;
}) {
  const { fork } = await searchParams;
  const t = await getTranslations("community");
  const loggedIn = await isLoggedIn();

  let initial: CommunityBuildInput | undefined;
  if (fork && dbConfigured()) {
    const src = await getBuild(fork);
    if (src) {
      initial = {
        title: `${src.title} v2`,
        description: src.description,
        activities: src.activities,
        guardianClass: src.guardianClass,
        subclass: src.subclass,
        super: src.super,
        loadout: src.loadout,
        stats: src.stats,
        aspects: src.aspects,
        fragments: src.fragments,
        forkedFrom: src.id,
      };
    }
  }

  return (
    <div className="community">
      <header className="page-head">
        <h1>{t("create")}</h1>
      </header>
      {!dbConfigured() ? (
        <div className="notice">{t("dbMissing")}</div>
      ) : !loggedIn ? (
        <div className="notice">
          {t("needLogin")} <a href="/api/auth/login" className="btn" style={{ marginLeft: "0.5rem" }}>Login</a>
        </div>
      ) : (
        <BuildCreator forkOf={fork} initial={initial} />
      )}
    </div>
  );
}
