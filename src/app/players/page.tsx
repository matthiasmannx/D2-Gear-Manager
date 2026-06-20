import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import SearchBar from "@/components/SearchBar";
import { Loading } from "@/components/Skeleton";
import { searchPlayers, icon, PLATFORMS, PlayerResult } from "@/lib/bungie";
import { isLoggedIn } from "@/lib/auth";
import { FavStar, FavoritesList } from "@/components/Favorites";

export const metadata = { title: "Players · Guardian Hub" };

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const loggedIn = await isLoggedIn();
  const t = await getTranslations("players");

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <Link href="/compare" className="muted" style={{ display: "inline-block", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("compareLink")}</Link>

      {!loggedIn && (
        <div className="notice" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span>{t("loginPrompt")}</span>
          <a href="/api/auth/login" className="btn" style={{ marginLeft: "auto" }}>{t("loginBtn")}</a>
        </div>
      )}

      <SearchBar basePath="/players" initial={q} placeholder={t("searchPlaceholder")} />
      <FavoritesList />
      {q ? (
        <Suspense key={q} fallback={<Loading head={false} cards={0} rows={4} />}>
          <Results query={q} />
        </Suspense>
      ) : (
        <Hint />
      )}
    </>
  );
}

async function Hint() {
  const t = await getTranslations("players");
  return <div className="empty">{t("hint")}</div>;
}

async function Results({ query }: { query: string }) {
  const t = await getTranslations("players");
  let players: PlayerResult[] = [];
  try {
    players = await searchPlayers(query);
  } catch (e: any) {
    return <div className="notice error">{t("searchFailed", { error: e.message })}</div>;
  }

  players = players.filter((p) => p.memberships.length > 0);
  if (players.length === 0) {
    return (
      <div className="empty">
        <p>{t("noResults", { query })}</p>
        <p className="muted" style={{ fontSize: "0.85rem", maxWidth: 460, margin: "0 auto" }}>
          {t("noResultsTip")}
        </p>
      </div>
    );
  }

  return (
    <div className="section-list">
      {players.map((p) => {
        // Kies de cross-save primaire membership, anders de eerste.
        const m =
          p.memberships.find((x: any) => x.crossSaveOverride === x.membershipType) ??
          p.memberships[0];
        return (
          <div key={p.bungieName + m.membershipId} className="card fav-card">
            <Link href={`/players/${m.membershipType}/${m.membershipId}`} className="fav-card-link">
              <div className="item">
                {icon(m.iconPath) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="item-icon" src={icon(m.iconPath)!} alt="" />
                ) : (
                  <div className="item-icon" />
                )}
                <div>
                  <div className="item-name">{p.bungieName}</div>
                  <div className="item-type">
                    {p.memberships
                      .map((x) => PLATFORMS[x.membershipType] ?? t("platformType", { n: x.membershipType }))
                      .join(" · ")}
                  </div>
                </div>
              </div>
            </Link>
            <FavStar type={m.membershipType} id={m.membershipId} name={p.bungieName} />
          </div>
        );
      })}
    </div>
  );
}
