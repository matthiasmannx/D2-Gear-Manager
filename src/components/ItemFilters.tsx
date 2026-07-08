"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ITEM_CATEGORIES } from "@/lib/itemCategories";

/**
 * Categorie-chips onder de items-zoekbalk. Zetten `?cat=` in de URL en behouden
 * de huidige zoekterm (`q`). De items-pagina leest `cat` server-side en filtert
 * de resultaten daarop.
 */
export default function ItemFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("items");
  const current = params.get("cat") ?? "all";

  const select = (key: string) => {
    const p = new URLSearchParams(params.toString());
    if (key === "all") p.delete("cat");
    else p.set("cat", key);
    const qs = p.toString();
    router.replace(qs ? `/items?${qs}` : "/items");
  };

  const keys = ["all", ...ITEM_CATEGORIES.map((c) => c.key)];

  return (
    <div className="chips item-filters">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          className={`chip ${current === key ? "on" : ""}`}
          aria-pressed={current === key}
          onClick={() => select(key)}
        >
          {t(`filter_${key}` as never)}
        </button>
      ))}
    </div>
  );
}
