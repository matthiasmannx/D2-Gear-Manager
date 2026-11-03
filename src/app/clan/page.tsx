import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getValidAccessToken } from "@/lib/auth";
import { getMemberships } from "@/lib/bungie";
import { getMyClan, getClanMembers, ClanMember } from "@/lib/clan";
import { Loading } from "@/components/Skeleton";

export const metadata = { title: "My Clan · Guardian Hub" };
export const dynamic = "force-dynamic";

export default async function ClanPage() {
  const t = await getTranslations("clan");
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <Suspense fallback={<Loading cards={0} rows={6} />}>
        <ClanBody />
      </Suspense>
    </>
  );
}

async function ClanBody() {
  const t = await getTranslations("clan");
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <div className="notice" style={{ marginTop: "1rem" }}>
        {t("loginPrompt")} <a href="/api/auth/login" className="btn" style={{ marginLeft: "0.5rem" }}>{t("loginBtn")}</a>
      </div>
    );
  }

  let clan = null;
  let members: ClanMember[] = [];
  try {
    const { primary } = await getMemberships(token);
    if (primary) {
      clan = await getMyClan(primary.membershipType, primary.membershipId);
      if (clan) members = await getClanMembers(clan.id);
    }
  } catch {
    /* val terug op geen-clan */
  }
  if (!clan) return <div className="empty">{t("noClan")}</div>;

  const online = members.filter((m) => m.online).length;

  return (
    <>
      <div className="card clan-head">
        <h2 style={{ margin: 0 }}>
          {clan.name} {clan.callsign && <span className="muted">[{clan.callsign}]</span>}
        </h2>
        {clan.motto && <p className="clan-motto">{clan.motto}</p>}
        {clan.about && <p className="muted clan-about">{clan.about}</p>}
        <div className="muted clan-meta">{clan.memberCount} {t("membersTitle")} · 🟢 {t("onlineCount", { n: online })}</div>
      </div>

      <div className="clan-list">
        {members.map((m) => (
          <Link key={m.membershipId} href={`/players/${m.membershipType}/${m.membershipId}`} className="card card-link clan-row">
            <span className={`clan-dot ${m.online ? "on" : ""}`} title={m.online ? "Online" : "Offline"} />
            <span className="clan-name">{m.name}</span>
            {m.rank && <span className="clan-rank">{m.rank}</span>}
          </Link>
        ))}
      </div>
    </>
  );
}
