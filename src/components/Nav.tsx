"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
          ⟡ Guardian Hub
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} className={active ? "active" : ""}>
                {l.label}
              </Link>
            );
          })}
        </div>
        {loggedIn ? (
          <a href="/api/auth/logout" className="btn btn-ghost">
            Uitloggen
          </a>
        ) : (
          <a href="/api/auth/login" className="btn">
            Login met Bungie
          </a>
        )}
      </div>
    </nav>
  );
}
