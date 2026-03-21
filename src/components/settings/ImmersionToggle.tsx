"use client";

import { Globe, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useImmersionStore } from "@/stores/useImmersionStore";
import type { Locale } from "@/lib/i18n/locales";
import { localeLabels } from "@/lib/i18n/locales";

const immersionLanguages: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Francais" },
];

export function ImmersionToggle() {
  const { t, enableImmersion, disableImmersion } = useI18n();
  const { enabled, lang, initialized, saving, enable, disable, changeLang } =
    useImmersionStore();

  const selectedLang = lang ?? "en";

  async function handleToggle() {
    if (enabled) {
      disableImmersion();
      await disable();
    } else {
      enableImmersion(selectedLang);
      await enable(selectedLang);
    }
  }

  async function handleLangChange(newLang: Locale) {
    if (!enabled) {
      // Just update the selection visually; don't persist yet
      useImmersionStore.setState({ lang: newLang });
      return;
    }
    enableImmersion(newLang);
    await changeLang(newLang);
  }

  if (!initialized) {
    return (
      <div className="flex items-center gap-2 py-2 text-white/30">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{t.dashboard.common.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
            <Globe className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">
              {enabled
                ? t.dashboard.settingsPage.immersionEnabled
                : t.dashboard.settingsPage.immersionDisabled}
            </p>
            <p className="text-xs text-white/30">
              {t.dashboard.settingsPage.immersionDesc}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            enabled ? "bg-amber-500" : "bg-white/10"
          } ${saving ? "opacity-50" : ""}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div>
          <label className="mb-1.5 block text-xs text-white/40">
            {t.dashboard.settingsPage.immersionLanguage}
          </label>
          <div className="flex flex-wrap gap-2">
            {immersionLanguages.map((item) => (
              <button
                key={item.code}
                onClick={() => handleLangChange(item.code)}
                disabled={saving}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedLang === item.code
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                    : "border-white/5 bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
                }`}
              >
                {localeLabels[item.code]} — {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
