"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadMyPrefs, saveMyPrefs } from "@/app/settings-actions";
import { LOCALE_COOKIE } from "@/i18n/config";
import { VAULT_EVT, readVaultView, writeVaultView } from "@/lib/vaultView";

/**
 * Synchroniseert favorieten (spelers + gear), taal en vault-filters met je
 * account in de database, zodat je op elk apparaat hetzelfde ziet zodra je bent
 * ingelogd. Het account is leidend: bij het laden trekken we lokaal gelijk met
 * het account (of zetten het account voor het eerst met dit toestel).
 * Wijzigingen worden teruggeschreven. Uitgelogd blijft alles puur lokaal.
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

function getCookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

export default function SettingsSync({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
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
          // Eerste keer: zet het account met de instellingen van dit toestel.
          await saveMyPrefs({ favPlayers: readP(), favGear: readG(), locale: getCookie(LOCALE_COOKIE) || undefined, vaultView: readVaultView() });
        } else {
          // Account is leidend → lokaal gelijktrekken.
          writeP(acct.favPlayers ?? []);
          writeG(acct.favGear ?? []);
          if (acct.vaultView) writeVaultView(acct.vaultView);
          if (acct.locale && acct.locale !== getCookie(LOCALE_COOKIE)) {
            document.cookie = `${LOCALE_COOKIE}=${acct.locale};path=/;max-age=31536000;samesite=lax`;
            router.refresh();
          }
        }
      } catch {
        /* sync mislukt → val terug op lokaal */
      }
      ready.current = true;
    })();

    const push = () => {
      if (!ready.current) return; // negeer de events van de initiële writes
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        saveMyPrefs({ favPlayers: readP(), favGear: readG(), vaultView: readVaultView() }).catch(() => {});
      }, 800);
    };
    window.addEventListener(PEVT, push);
    window.addEventListener(GEVT, push);
    window.addEventListener(VAULT_EVT, push);
    return () => {
      cancelled = true;
      window.removeEventListener(PEVT, push);
      window.removeEventListener(GEVT, push);
      window.removeEventListener(VAULT_EVT, push);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [loggedIn, router]);

  return null;
}
