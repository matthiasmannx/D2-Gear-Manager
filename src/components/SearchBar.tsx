"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function SearchBar({
  basePath,
  initial = "",
  placeholder,
  live = false,
}: {
  basePath: string;
  initial?: string;
  placeholder?: string;
  /** Live zoeken tijdens typen (debounced). Alleen voor snelle, lokale zoekbronnen. */
  live?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("common");
  const [value, setValue] = useState(initial);
  // Laatst genavigeerde query, zodat we niet dubbel navigeren.
  const lastNav = useRef(initial.trim());

  const navigate = (raw: string) => {
    const q = raw.trim();
    if (q === lastNav.current) return;
    lastNav.current = q;
    // Overige params (bv. categorie-filter) behouden.
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    // replace i.p.v. push: geen history-vervuiling terwijl je letters typt.
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate(value);
  }

  // Live zoeken: debounce terwijl je typt. Vanaf 2 tekens (1 letter levert te
  // veel ruis op — daarvoor kun je nog steeds op Enter drukken).
  useEffect(() => {
    if (!live) return;
    if (value.trim().length === 1) return;
    const id = setTimeout(() => navigate(value), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, live]);

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "0.6rem", margin: "1rem 0 1.5rem" }}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? t("searchPlaceholder")}
        autoFocus
      />
      <button type="submit" className="btn">
        {t("search")}
      </button>
    </form>
  );
}
