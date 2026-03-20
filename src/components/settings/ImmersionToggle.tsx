"use client";

import { useState, useEffect } from "react";
import { Globe, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/locales";
import { localeLabels } from "@/lib/i18n/locales";

const immersionLanguages: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
];

export function ImmersionToggle() {
  const { t, isImmersion, immersionLang, enableImmersion, disableImmersion } = useI18n();
  const [enabled, setEnabled] = useState(isImmersion);
  const [selectedLang, setSelectedLang] = useState<Locale>(immersionLang ?? "en");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings/immersion")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setEnabled(json.data.immersionMode);
          if (json.data.immersionLang) {
            setSelectedLang(json.data.immersionLang as Locale);
          }
          if (json.data.immersionMode && json.data.immersionLang) {
            enableImmersion(json.data.immersionLang as Locale);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle() {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    setSaving(true);

    try {
      const res = await fetch("/api/settings/immersion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          immersionMode: newEnabled,
          immersionLang: newEnabled ? selectedLang : undefined,
        }),
      });
      const json = await res.json();
      if (json.data) {
        if (json.data.immersionMode && json.data.immersionLang) {
          enableImmersion(json.data.immersionLang as Locale);
        } else {
          disableImmersion();
        }
      }
    } catch {
      setEnabled(!newEnabled);
      console.error("Failed to update immersion setting");
    } finally {
      setSaving(false);
    }
  }

  async function handleLangChange(lang: Locale) {
    setSelectedLang(lang);
    if (!enabled) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings/immersion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immersionMode: true, immersionLang: lang }),
      });
      const json = await res.json();
      if (json.data?.immersionMode && json.data.immersionLang) {
        enableImmersion(json.data.immersionLang as Locale);
      }
    } catch {
      console.error("Failed to update immersion language");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
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
              {enabled ? t.dashboard.settingsPage.immersionEnabled : t.dashboard.settingsPage.immersionDisabled}
            </p>
            <p className="text-xs text-white/30">{t.dashboard.settingsPage.immersionDesc}</p>
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
            {immersionLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                disabled={saving}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedLang === lang.code
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                    : "border-white/5 bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
                }`}
              >
                {localeLabels[lang.code]} — {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
