"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface Fav {
  type: number;
  id: string;
  name: string;
}

const KEY = "gh_fav_players";
const EVT = "gh-favs-changed";

function read(): Fav[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(favs: Fav[]) {
  localStorage.setItem(KEY, JSON.stringify(favs));
  window.dispatchEvent(new Event(EVT));
}

/** Reactieve favorietenlijst die meeluistert naar wijzigingen. */
function useFavs(): [Fav[], boolean] {
  const [favs, setFavs] = useState<Fav[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setFavs(read());
    const h = () => setFavs(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return [favs, mounted];
}

/** Ster-knop om een speler te (de)favorieten. */
export function FavStar({ type, id, name }: Fav) {
  const [favs, mounted] = useFavs();
  if (!mounted) return <span className="fav-star placeholder" aria-hidden />;
  const isFav = favs.some((f) => f.id === id);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    write(isFav ? favs.filter((f) => f.id !== id) : [...favs, { type, id, name }]);
  };
  return (
    <button
      type="button"
      className={`fav-star ${isFav ? "on" : ""}`}
      onClick={toggle}
      title={isFav ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      aria-label={isFav ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}

/** Lijst van opgeslagen favoriete spelers (boven de zoekresultaten). */
export function FavoritesList() {
  const [favs, mounted] = useFavs();
  if (!mounted || favs.length === 0) return null;
  return (
    <section style={{ marginBottom: "1.25rem" }}>
      <h2 style={{ fontSize: "1.1rem" }}>★ Favorieten</h2>
      <div className="section-list">
        {favs.map((f) => (
          <div key={f.id} className="card fav-card">
            <Link href={`/players/${f.type}/${f.id}`} className="fav-card-link">
              <span className="item-name">{f.name}</span>
            </Link>
            <FavStar type={f.type} id={f.id} name={f.name} />
          </div>
        ))}
      </div>
    </section>
  );
}
