"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SearchBar({
  basePath,
  initial = "",
  placeholder,
}: {
  basePath: string;
  initial?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const t = useTranslations("common");
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  }

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
