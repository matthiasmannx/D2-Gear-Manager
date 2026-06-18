import { getTranslations } from "next-intl/server";
import { isLoggedIn } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
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
        <BuildCreator forkOf={fork} />
      )}
    </div>
  );
}
