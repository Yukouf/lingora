import { create } from "zustand";
import type { Locale } from "@/lib/i18n/locales";

interface ImmersionState {
  /** Whether immersion mode is active */
  enabled: boolean;
  /** The target language for immersion (null when disabled) */
  lang: Locale | null;
  /** Whether the initial fetch from the API has completed */
  initialized: boolean;
  /** Whether a save operation is in progress */
  saving: boolean;
}

interface ImmersionActions {
  /** Set the full immersion state (used by initializer) */
  setImmersion: (enabled: boolean, lang: Locale | null) => void;
  /** Mark the store as initialized after first API fetch */
  markInitialized: () => void;
  /** Toggle immersion on with a specific language */
  enable: (lang: Locale) => Promise<void>;
  /** Toggle immersion off */
  disable: () => Promise<void>;
  /** Change the immersion language (while keeping it enabled) */
  changeLang: (lang: Locale) => Promise<void>;
}

type ImmersionStore = ImmersionState & ImmersionActions;

async function patchImmersion(immersionMode: boolean, immersionLang?: string): Promise<{
  immersionMode: boolean;
  immersionLang: string | null;
} | null> {
  try {
    const res = await fetch("/api/settings/immersion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ immersionMode, immersionLang }),
    });
    const json = await res.json() as { data?: { immersionMode: boolean; immersionLang: string | null } };
    return json.data ?? null;
  } catch {
    console.error("Failed to update immersion setting");
    return null;
  }
}

export const useImmersionStore = create<ImmersionStore>((set) => ({
  enabled: false,
  lang: null,
  initialized: false,
  saving: false,

  setImmersion: (enabled, lang) => set({ enabled, lang }),

  markInitialized: () => set({ initialized: true }),

  enable: async (lang) => {
    const prev = useImmersionStore.getState();
    set({ enabled: true, lang, saving: true });
    const result = await patchImmersion(true, lang);
    if (result) {
      set({ enabled: result.immersionMode, lang: (result.immersionLang as Locale) ?? null, saving: false });
    } else {
      // Rollback on failure
      set({ enabled: prev.enabled, lang: prev.lang, saving: false });
    }
  },

  disable: async () => {
    const prev = useImmersionStore.getState();
    set({ enabled: false, lang: null, saving: true });
    const result = await patchImmersion(false);
    if (result) {
      set({ enabled: false, lang: null, saving: false });
    } else {
      set({ enabled: prev.enabled, lang: prev.lang, saving: false });
    }
  },

  changeLang: async (lang) => {
    const prev = useImmersionStore.getState();
    set({ lang, saving: true });
    const result = await patchImmersion(true, lang);
    if (result) {
      set({ lang: (result.immersionLang as Locale) ?? null, saving: false });
    } else {
      set({ lang: prev.lang, saving: false });
    }
  },
}));
