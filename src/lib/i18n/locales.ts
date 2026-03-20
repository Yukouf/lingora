// All supported locales (UI + immersion)
export const locales = ["fr", "en", "zh", "ja", "ru", "es", "de", "ko", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

// Locales shown in the language picker (navbar)
export const uiLocales: Locale[] = ["fr", "en", "zh", "ja", "ru"];

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  zh: "中文",
  ja: "日本語",
  ru: "RU",
  es: "ES",
  de: "DE",
  ko: "한국어",
  ar: "العربية",
};

export type Translations = typeof import("./fr").default;
