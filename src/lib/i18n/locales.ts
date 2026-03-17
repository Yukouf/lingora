export const locales = ["fr", "en", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  zh: "中文",
  ja: "日本語",
};

export type Translations = typeof import("./fr").default;
