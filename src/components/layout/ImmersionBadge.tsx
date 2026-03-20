"use client";

import { Globe, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { localeLabels } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/locales";

export function ImmersionBadge() {
  const { isImmersion, immersionLang, disableImmersion, t } = useI18n();

  if (!isImmersion || !immersionLang) return null;

  async function handleDisable() {
    disableImmersion();
    try {
      await fetch("/api/settings/immersion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immersionMode: false }),
      });
    } catch {
      console.error("Failed to disable immersion");
    }
  }

  return (
    <button
      onClick={handleDisable}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-300 shadow-lg backdrop-blur-sm transition-all hover:bg-amber-500/30 hover:border-amber-500/50"
      title={t.dashboard.settingsPage.immersionBadge}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{localeLabels[immersionLang as Locale]}</span>
      <X className="h-3 w-3 opacity-60" />
    </button>
  );
}
