"use client";

import { useState, useTransition } from "react";
import { likeAction, favoriteAction } from "@/app/community/actions";

export default function LikeFavorite({
  buildId,
  likes,
  favorites,
  liked,
  favorited,
  loggedIn,
  labels,
}: {
  buildId: string;
  likes: number;
  favorites: number;
  liked: boolean;
  favorited: boolean;
  loggedIn: boolean;
  labels: { like: string; favorite: string };
}) {
  const [lk, setLk] = useState({ on: liked, n: likes });
  const [fv, setFv] = useState({ on: favorited, n: favorites });
  const [pending, start] = useTransition();

  function guard(): boolean {
    if (!loggedIn) {
      window.location.href = "/api/auth/login";
      return false;
    }
    return true;
  }

  return (
    <div className="cb-react">
      <button
        type="button"
        className={`cb-btn ${lk.on ? "on" : ""}`}
        disabled={pending}
        onClick={() => {
          if (!guard()) return;
          // optimistisch
          setLk((s) => ({ on: !s.on, n: s.n + (s.on ? -1 : 1) }));
          start(async () => {
            const r = await likeAction(buildId);
            if (r.ok && typeof r.liked === "boolean") setLk((s) => ({ ...s, on: r.liked! }));
          });
        }}
      >
        ▲ {labels.like} <span className="cb-n">{lk.n}</span>
      </button>
      <button
        type="button"
        className={`cb-btn ${fv.on ? "on fav" : ""}`}
        disabled={pending}
        onClick={() => {
          if (!guard()) return;
          setFv((s) => ({ on: !s.on, n: s.n + (s.on ? -1 : 1) }));
          start(async () => {
            const r = await favoriteAction(buildId);
            if (r.ok && typeof r.favorited === "boolean") setFv((s) => ({ ...s, on: r.favorited! }));
          });
        }}
      >
        ★ {labels.favorite} <span className="cb-n">{fv.n}</span>
      </button>
    </div>
  );
}
