"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { sectionColor } from "@/lib/sectionColors";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Brand from "@/components/Brand";

const LINKS = [
  { href: "/items", key: "items" },
  { href: "/gear", key: "gear" },
  { href: "/builds", key: "builds" },
  { href: "/players", key: "players" },
  { href: "/events", key: "events" },
  { href: "/changelog", key: "changelog" },
  { href: "/sandbox", key: "sandbox" },
] as const;

export default function Nav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <Brand collapsible />
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "active" : ""}
                style={{ ["--link-color" as string]: sectionColor(l.href) } as React.CSSProperties}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </div>
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
    </nav>
  );
}
