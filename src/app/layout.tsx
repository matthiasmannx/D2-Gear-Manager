import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { isLoggedIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Guardian Hub — Destiny 2 Companion",
  description:
    "Items, gear, events en gidsen voor Destiny 2, aangedreven door de Bungie API.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = await isLoggedIn();
  return (
    <html lang="nl">
      <body>
        <Nav loggedIn={loggedIn} />
        <main className="container">{children}</main>
        <footer className="site-footer">
          DESIGNED &amp; DEVELOPED BY <strong className="footer-name">MATTHIAS MANN</strong>
        </footer>
      </body>
    </html>
  );
}
