import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { icon } from "@/lib/bungie";
import { searchItemIndex, ItemIndexEntry } from "@/lib/manifest";

export const metadata = { title: "Items — Guardian Hub" };

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <h1>Items</h1>
      <p className="muted">
        Doorzoek alle wapens, armor, mods en meer uit de Destiny 2 database.
      </p>
      <SearchBar basePath="/items" initial={q} placeholder="Bijv. Gjallarhorn, Riskrunner…" />
      {q ? <Results query={q} /> : <Hint />}
    </>
  );
}

function Hint() {
  return <div className="empty">Typ een itemnaam hierboven om te zoeken.</div>;
}

async function Results({ query }: { query: string }) {
  let items: ItemIndexEntry[] = [];
  try {
    items = await searchItemIndex(query);
  } catch (e: any) {
    return (
      <div className="notice error">
        Zoeken mislukt: {e.message}. Heb je je BUNGIE_API_KEY al ingesteld?
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="empty">Geen items gevonden voor “{query}”.</div>;
  }

  return (
    <div className="grid">
      {items.map((i) => (
        <Link key={i.hash} href={`/items/${i.hash}`} className="card card-link">
          <div className="item">
            {icon(i.icon) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="item-icon" src={icon(i.icon)!} alt="" />
            ) : (
              <div className="item-icon" />
            )}
            <div>
              <div className="item-name">{i.name}</div>
              <div className="item-type">
                {[i.tier, i.type].filter(Boolean).join(" · ") || "Item"}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
