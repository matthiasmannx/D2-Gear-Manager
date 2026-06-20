"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { sectionColor } from "@/lib/sectionColors";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Brand from "@/components/Brand";

type Item = { href: string; key: string };
type Entry = { type: "link"; href: string; key: string } | { type: "menu"; key: string; items: Item[] };

const NAV: Entry[] = [
  { type: "link", href: "/items", key: "items" },
  { type: "menu", key: "gBuilds", items: [{ href: "/builds", key: "builds" }, { href: "/community", key: "community" }] },
  { type: "menu", key: "gGuardian", items: [{ href: "/profile", key: "profile" }, { href: "/gear", key: "gear" }, { href: "/power", key: "power" }, { href: "/weekly", key: "weekly" }, { href: "/clan", key: "clan" }] },
  { type: "link", href: "/players", key: "players" },
  { type: "link", href: "/events", key: "events" },
  { type: "link", href: "/changelog", key: "changelog" },
];

export default function Nav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Sluit alles bij navigatie.
  useEffect(() => { setMobileOpen(false); setOpenMenu(null); }, [pathname]);
  // Sluit dropdowns bij klik buiten de nav.
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const linkStyle = (href: string) => ({ ["--link-color" as string]: sectionColor(href) } as React.CSSProperties);

  return (
    <nav className="nav" ref={ref}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand"><Brand /></Link>

        <button type="button" className="nav-hamburger" aria-label={t("menu")} aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
          <span /><span /><span />
        </button>

        <div className={`nav-menu ${mobileOpen ? "open" : ""}`}>
          <div className="nav-links">
            {NAV.map((e) =>
              e.type === "link" ? (
                <Link key={e.href} href={e.href} className={`nav-item ${isActive(e.href) ? "active" : ""}`} style={linkStyle(e.href)}>
                  {t(e.key)}
                </Link>
              ) : (
                <div key={e.key} className={`nav-group ${openMenu === e.key ? "open" : ""} ${e.items.some((i) => isActive(i.href)) ? "active" : ""}`}>
                  <button type="button" className="nav-group-btn nav-item" onClick={() => setOpenMenu((m) => (m === e.key ? null : e.key))}>
                    {t(e.key)} <span className="nav-caret" aria-hidden>▾</span>
                  </button>
                  <div className="nav-dropdown">
                    {e.items.map((i) => (
                      <Link key={i.href} href={i.href} className={`nav-drop-item ${isActive(i.href) ? "active" : ""}`} style={linkStyle(i.href)}>
                        {t(i.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="nav-actions">
            <LanguageSwitcher />
            {loggedIn ? (
              <a href="/api/auth/logout" className="btn btn-logout nav-auth" title={t("logout")} aria-label={t("logout")}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="nav-auth-extra">{t("logout")}</span>
              </a>
            ) : (
              <a href="/api/auth/login" className="btn nav-auth">
                {t("login")}<span className="nav-auth-extra">{t("loginExtra")}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
