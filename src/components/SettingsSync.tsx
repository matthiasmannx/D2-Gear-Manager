"use client";

import { useEffect, useRef } from "react";
import { loadMyPrefs, saveMyPrefs } from "@/app/settings-actions";

/**
 * Synchroniseert favorieten (spelers + gear) met je account in de database,
 * zodat je op elk apparaat hetzelfde ziet zodra je bent ingelogd. Het account
 * is leidend: bij het laden overschrijven we de lokale lijst met die van het
 * account (of zetten het account voor het eerst met dit toestel). Wijzigingen
 * worden daarna teruggeschreven. Uitgelogd blijft alles puur lokaal.
 */
const PKEY = "gh_fav_players";
const GKEY = "gh_fav_gear";
const PEVT = "gh-favs-changed";
const GEVT = "gh-favgear-changed";

function readP(): { type: number; id: string; name: string }[] {
  try { return JSON.parse(localStorage.getItem(PKEY) || "[]"); } catch { return []; }
}
function readG(): number[] {
  try { return JSON.parse(localStorage.getItem(GKEY) || "[]"); } catch { return []; }
}
function writeP(v: unknown) { localStorage.setItem(PKEY, JSON.stringify(v)); window.dispatchEvent(new Event(PEVT)); }
function writeG(v: unknown) { localStorage.setItem(GKEY, JSON.stringify(v)); window.dispatchEvent(new Event(GEVT)); }

export default function SettingsSync({ loggedIn }: { loggedIn: boolean }) {
  const ready = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;

    (async () => {
      try {
        const acct = await loadMyPrefs();
        if (cancelled) return;
        if (acct === null) {
          // Eerste keer: zet het account met de favorieten van dit toestel.
          await saveMyPrefs({ favPlayers: readP(), favGear: readG() });
        } else {
          // Account is leidend → lokaal gelijktrekken.
          writeP(acct.favPlayers ?? []);
          writeG(acct.favGear ?? []);
        }
      } catch {
        /* sync mislukt → val terug op lokaal */
      }
      ready.current = true;
    })();

    const push = () => {
      if (!ready.current) return; // negeer de events van de initiële writeP/writeG
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        saveMyPrefs({ favPlayers: readP(), favGear: readG() }).catch(() => {});
      }, 800);
    };
    window.addEventListener(PEVT, push);
    window.addEventListener(GEVT, push);
    return () => {
      cancelled = true;
      window.removeEventListener(PEVT, push);
      window.removeEventListener(GEVT, push);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [loggedIn]);

  return null;
}
