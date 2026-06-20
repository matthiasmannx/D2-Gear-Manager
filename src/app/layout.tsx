import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import SettingsSync from "@/components/SettingsSync";
import ShellMode from "@/components/ShellMode";
import ExternalLinks from "@/components/ExternalLinks";
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
    statusBarStyle: "default",
    title: "Guardian Hub",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0b0e14",
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
          <ShellMode />
          <ExternalLinks />
          <Nav loggedIn={loggedIn} />
          <SettingsSync loggedIn={loggedIn} />
          <main className="container">{children}</main>
          <footer className="site-footer">
            DESIGNED &amp; DEVELOPED BY{" "}
            <a href="https://www.linkedin.com/in/matthias-mann-ab4193134/" target="_blank" rel="noopener noreferrer" className="footer-name">MATTHIAS MANN</a>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
