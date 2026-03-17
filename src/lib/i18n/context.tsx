"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Locale } from "./locales";
import { defaultLocale } from "./locales";
import fr from "./fr";
import en from "./en";
import zh from "./zh";
import ja from "./ja";

/* eslint-disable @typescript-eslint/no-explicit-any */
const dictionaries: Record<string, any> = { fr, en, zh, ja };

type Dict = typeof fr;

interface I18nContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: fr,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : l === "ja" ? "ja" : l === "en" ? "en" : "fr";
  }, []);

  const t = useMemo(() => (dictionaries[locale] ?? fr) as Dict, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
