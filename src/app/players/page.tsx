import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { searchPlayers, icon, PLATFORMS, PlayerResult } from "@/lib/bungie";

export const metadata = { title: "Players — Guardian Hub" };

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <h1>Players</h1>
      <p className="muted">
        Zoek op <strong>Bungie-naam</strong> (bv. <code>Fhaxyy#3853</code>) en bekijk
        PvP-stats: K/D, wins, Trials, Iron Banner en hoe vaak iemand Flawless is geweest.
      </p>
      <SearchBar basePath="/players" initial={q} placeholder="Bungie-naam, bv. Fhaxyy of Fhaxyy#3853" />
      {q ? <Results query={q} /> : <Hint />}
    </>
  );
}

function Hint() {
  return (
    <div className="empty">
      Typ (een deel van) een Bungie-naam om spelers te vinden.
    </div>
  );
}

async function Results({ query }: { query: string }) {
  let players: PlayerResult[] = [];
  try {
    players = await searchPlayers(query);
  } catch (e: any) {
    return <div className="notice error">Zoeken mislukt: {e.message}</div>;
  }

  players = players.filter((p) => p.memberships.length > 0);
  if (players.length === 0) {
    return (
      <div className="empty">
        <p>Geen spelers gevonden voor “{query}”.</p>
        <p className="muted" style={{ fontSize: "0.85rem", maxWidth: 460, margin: "0 auto" }}>
          Tip: zoek op de <strong>Bungie-naam</strong>, niet de PSN-gamertag. Die
          kunnen verschillen. Weet je de code? Probeer <code>Naam#1234</code> voor
          een exacte match.
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
          <Link
            key={p.bungieName + m.membershipId}
            href={`/players/${m.membershipType}/${m.membershipId}`}
            className="card card-link"
          >
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
                    .map((x) => PLATFORMS[x.membershipType] ?? `Type ${x.membershipType}`)
                    .join(" · ")}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
