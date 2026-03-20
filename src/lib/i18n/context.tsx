"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Locale } from "./locales";
import { defaultLocale } from "./locales";
import fr from "./fr";
import en from "./en";
import zh from "./zh";
import ja from "./ja";
import ru from "./ru";
import es from "./es";
import de from "./de";
import ko from "./ko";
import ar from "./ar";

/* eslint-disable @typescript-eslint/no-explicit-any */
const dictionaries: Record<string, any> = { fr, en, zh, ja, ru, es, de, ko, ar };

type Dict = typeof fr;

interface I18nContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
  isImmersion: boolean;
  immersionLang: Locale | null;
  enableImmersion: (lang: Locale) => void;
  disableImmersion: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: fr,
  setLocale: () => {},
  isImmersion: false,
  immersionLang: null,
  enableImmersion: () => {},
  disableImmersion: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isImmersion, setIsImmersion] = useState(false);
  const [immersionLang, setImmersionLang] = useState<Locale | null>(null);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : l === "ja" ? "ja" : l === "ru" ? "ru" : l === "en" ? "en" : l === "es" ? "es" : l === "de" ? "de" : l === "ko" ? "ko" : l === "ar" ? "ar" : "fr";
  }, []);

  const enableImmersion = useCallback((lang: Locale) => {
    setIsImmersion(true);
    setImmersionLang(lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, []);

  const disableImmersion = useCallback(() => {
    setIsImmersion(false);
    setImmersionLang(null);
    // Restore document lang to current locale
    setLocaleState((prev) => {
      document.documentElement.lang = prev === "zh" ? "zh-CN" : prev;
      return prev;
    });
  }, []);

  const t = useMemo(() => {
    if (isImmersion && immersionLang) {
      return (dictionaries[immersionLang] ?? fr) as Dict;
    }
    return (dictionaries[locale] ?? fr) as Dict;
  }, [locale, isImmersion, immersionLang]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, isImmersion, immersionLang, enableImmersion, disableImmersion }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
