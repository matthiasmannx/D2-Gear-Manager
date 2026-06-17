export const LOCALES = ["nl", "en", "de", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};
export const LOCALE_FLAGS: Record<Locale, string> = {
  nl: "🇳🇱",
  en: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
  es: "🇪🇸",
};

// Bungie's manifest ondersteunt geen Nederlands → terugval op Engels.
const BUNGIE_LANG: Record<string, string> = { nl: "en", en: "en", de: "de", fr: "fr", es: "es" };
export function bungieLang(locale: string): string {
  return BUNGIE_LANG[locale] ?? "en";
}
