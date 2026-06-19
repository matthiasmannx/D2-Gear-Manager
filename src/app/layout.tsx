import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import SettingsSync from "@/components/SettingsSync";
import { isLoggedIn } from "@/lib/auth";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Guardian Hub, Destiny 2 Companion",
  description:
    "Items, gear, events en gidsen voor Destiny 2, aangedreven door de Bungie API.",
  applicationName: "Guardian Hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    // translucent → content loopt onder de status bar (donker), i.p.v. witte balk.
    statusBarStyle: "black-translucent",
    title: "Guardian Hub",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0b0e14",
  // Vereist zodat env(safe-area-inset-*) werkt op iOS (notch + home indicator).
  // Zonder dit blijven die 0 → nav onder de status bar en witte vlakken boven/onder.
  viewportFit: "cover" as const,
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
          <SettingsSync loggedIn={loggedIn} />
          <main className="container">{children}</main>
          <footer className="site-footer">
            DESIGNED &amp; DEVELOPED BY <strong className="footer-name">MATTHIAS MANN</strong>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
