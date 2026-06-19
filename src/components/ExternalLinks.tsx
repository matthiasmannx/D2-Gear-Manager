"use client";

import { useEffect } from "react";

/**
 * Zorgt dat externe links (bv. light.gg) overal betrouwbaar openen — ook op
 * mobiel en in de PWA/app-shell, waar een gewone target="_blank" soms niets
 * doet. We vangen de klik globaal af en openen 'm expliciet in een nieuw venster
 * (in de app-shell via "_system" → systeembrowser).
 */
export default function ExternalLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(href)) return;
      let external = false;
      try {
        external = new URL(href, window.location.href).host !== window.location.host;
      } catch {
        return;
      }
      if (!external) return;
      e.preventDefault();
      const shell = document.documentElement.dataset.appShell;
      window.open(href, shell ? "_system" : "_blank", "noopener,noreferrer");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
