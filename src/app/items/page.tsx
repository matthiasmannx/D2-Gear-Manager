import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SearchBar from "@/components/SearchBar";
import ItemFilters from "@/components/ItemFilters";
import { icon } from "@/lib/bungie";
import { searchItemIndex, ItemIndexEntry } from "@/lib/manifest";

export const metadata = { title: "Items · Guardian Hub" };

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const t = await getTranslations("items");

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <SearchBar basePath="/items" initial={q} placeholder={t("searchPlaceholder")} live />
      <ItemFilters />
      {q ? <Results query={q} category={cat} /> : <Hint />}
    </>
  );
}

async function Hint() {
  const t = await getTranslations("items");
  return <div className="empty">{t("hint")}</div>;
}

async function Results({ query, category }: { query: string; category?: string }) {
  const t = await getTranslations("items");
  let items: ItemIndexEntry[] = [];
  try {
    items = await searchItemIndex(query, category);
  } catch (e: any) {
    return <div className="notice error">{t("searchFailed", { error: e.message })}</div>;
  }

  if (items.length === 0) {
    return <div className="empty">{t("noResults", { query })}</div>;
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
                {[i.tier, i.type].filter(Boolean).join(" · ") || t("itemFallback")}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
