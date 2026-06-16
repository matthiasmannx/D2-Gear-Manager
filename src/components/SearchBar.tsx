"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
        placeholder={placeholder ?? "Zoeken…"}
        autoFocus
      />
      <button type="submit" className="btn">
        Zoek
      </button>
    </form>
  );
}
