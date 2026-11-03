"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Favoriete gear (wapens/armor), per device in localStorage, gesleuteld op de
 * item-hash zodat ÁLLE exemplaren van dat wapen de markering tonen.
 */
const KEY = "gh_fav_gear";
const EVT = "gh-favgear-changed";

function read(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useGearFavorites() {
  const [favs, setFavs] = useState<Set<number>>(new Set());

  useEffect(() => {
    setFavs(new Set(read()));
    const h = () => setFavs(new Set(read()));
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const toggle = useCallback((hash: number) => {
    const cur = read();
    const next = cur.includes(hash) ? cur.filter((h) => h !== hash) : [...cur, hash];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }, []);

  return { favs, toggle };
}
