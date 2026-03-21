"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useImmersionStore } from "@/stores/useImmersionStore";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Fetches the user's immersion preference from the API on mount
 * and syncs it to both the Zustand store and the i18n context.
 * Renders nothing — pure side-effect component.
 */
export function ImmersionInitializer() {
  const { status } = useSession();
  const { initialized, setImmersion, markInitialized } = useImmersionStore();
  const { enableImmersion, disableImmersion } = useI18n();

  useEffect(() => {
    if (status !== "authenticated" || initialized) return;

    let cancelled = false;

    async function fetchImmersion() {
      try {
        const res = await fetch("/api/settings/immersion");
        const json = await res.json() as {
          data?: { immersionMode: boolean; immersionLang: string | null };
        };

        if (cancelled) return;

        if (json.data) {
          const { immersionMode, immersionLang } = json.data;
          setImmersion(immersionMode, (immersionLang as Locale) ?? null);

          if (immersionMode && immersionLang) {
            enableImmersion(immersionLang as Locale);
          } else {
            disableImmersion();
          }
        }
      } catch {
        console.error("Failed to fetch immersion settings");
      } finally {
        if (!cancelled) {
          markInitialized();
        }
      }
    }

    fetchImmersion();

    return () => {
      cancelled = true;
    };
    // Only run when auth status changes or on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return null;
}
