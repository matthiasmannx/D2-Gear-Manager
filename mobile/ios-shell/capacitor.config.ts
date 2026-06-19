import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function getEnvValue(key: string) {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return undefined;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [name, ...rest] = trimmed.split("=");
    if (name === key) return rest.join("=").trim();
  }

  return undefined;
}

const appUrl =
  process.env.GUARDIAN_HUB_APP_URL ??
  getEnvValue("GUARDIAN_HUB_APP_URL") ??
  "https://guardianhub.app";

const remoteUrl = new URL(appUrl);
remoteUrl.searchParams.set("app", "ios");

const host = remoteUrl.hostname;

const config: CapacitorConfig = {
  appId: "com.matthiasmann.guardianhub",
  appName: "Guardian Hub",
  webDir: "www",
  server: {
    url: remoteUrl.toString(),
    cleartext: false,
    allowNavigation: [host],
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0b0e14",
  },
};

export default config;
