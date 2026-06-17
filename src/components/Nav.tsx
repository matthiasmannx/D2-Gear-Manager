"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sectionColor } from "@/lib/sectionColors";

const LINKS = [
  { href: "/items", label: "Items" },
  { href: "/gear", label: "Gear" },
  { href: "/builds", label: "Meta Builds" },
  { href: "/players", label: "Players" },
  { href: "/events", label: "Events Tracker" },
  { href: "/changelog", label: "Changelog" },
  { href: "/sandbox", label: "Buffs & Nerfs" },
];

export default function Nav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          ⟡<span className="brand-text"> Guardian Hub</span>
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
                {l.label}
              </Link>
            );
          })}
        </div>
        {loggedIn ? (
          <a href="/api/auth/logout" className="btn btn-logout nav-auth" title="Uitloggen" aria-label="Uitloggen">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="nav-auth-extra">Uitloggen</span>
          </a>
        ) : (
          <a href="/api/auth/login" className="btn nav-auth">
            Login<span className="nav-auth-extra"> met Bungie</span>
          </a>
        )}
      </div>
    </nav>
  );
}
