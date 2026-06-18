import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { isLoggedIn } from "@/lib/auth";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Guardian Hub, Destiny 2 Companion",
  description:
    "Items, gear, events en gidsen voor Destiny 2, aangedreven door de Bungie API.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = await isLoggedIn();
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Nav loggedIn={loggedIn} />
          <main className="container">{children}</main>
          <footer className="site-footer">
            DESIGNED &amp; DEVELOPED BY <strong className="footer-name">MATTHIAS MANN</strong>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
