"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { saveMyPrefs } from "@/app/settings-actions";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    saveMyPrefs({ locale: l }).catch(() => {}); // sync naar account (no-op indien uitgelogd)
    router.refresh();
  };

  return (
    <div className="lang-switch" ref={ref}>
      <button type="button" className="lang-btn" onClick={() => setOpen((o) => !o)} aria-label="Language">
        <span aria-hidden>{LOCALE_FLAGS[locale]}</span>
        <span className="lang-code">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="lang-menu">
          {LOCALES.map((l) => (
            <button key={l} type="button" className={l === locale ? "active" : ""} onClick={() => pick(l)}>
              <span aria-hidden>{LOCALE_FLAGS[l]}</span> {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
