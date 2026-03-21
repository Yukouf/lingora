"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Crown, CreditCard } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { ImmersionToggle } from "@/components/settings/ImmersionToggle";

interface SubData {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  nativeLanguage: string;
}

const nativeLanguageLabels: Record<string, string> = {
  fr: "Fran\u00e7ais",
  en: "English",
  es: "Espa\u00f1ol",
  de: "Deutsch",
  zh: "\u4e2d\u6587",
  ja: "\u65e5\u672c\u8a9e",
  ko: "\ud55c\uad6d\uc5b4",
  ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/subscription")
      .then((res) => res.json())
      .then((json) => setSub(json.data))
      .catch(console.error)
      .finally(() => setSubLoading(false));
  }, []);

  const isPremium = sub?.status === "ACTIVE";

  function isStripeUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname.endsWith(".stripe.com");
    } catch {
      return false;
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (json.data?.url && isStripeUrl(json.data.url)) {
        window.location.href = json.data.url;
      }
    } catch {
      console.error("Checkout error");
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json.data?.url && isStripeUrl(json.data.url)) {
        window.location.href = json.data.url;
      }
    } catch {
      console.error("Portal error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white/90">{t.dashboard.settingsPage.title}</h1>

      {/* Profile */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">{t.dashboard.settingsPage.profile}</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-white/30">{t.dashboard.settingsPage.name}</p>
            <p className="mt-0.5 text-white/80">{session?.user?.name ?? "—"}</p>
          </div>
          <div className="h-px bg-white/5" />
          <div>
            <p className="text-xs text-white/30">{t.dashboard.settingsPage.email}</p>
            <p className="mt-0.5 text-white/80">{session?.user?.email ?? "—"}</p>
          </div>
          <div className="h-px bg-white/5" />
          <div>
            <p className="text-xs text-white/30">{t.dashboard.settingsPage.nativeLanguage}</p>
            <p className="mt-0.5 text-white/80">{sub ? (nativeLanguageLabels[sub.nativeLanguage] ?? sub.nativeLanguage) : "\u2014"}</p>
          </div>
        </div>
      </div>

      {/* Immersion */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">{t.dashboard.settingsPage.immersion}</h2>
        <div className="mt-4">
          <ImmersionToggle />
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">{t.dashboard.settingsPage.subscription}</h2>

        {subLoading ? (
          <div className="mt-4 flex items-center gap-2 text-white/30">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t.dashboard.common.loading}</span>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white/90">
                    {isPremium ? t.dashboard.settingsPage.premiumPlan : t.dashboard.settingsPage.freePlan}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      isPremium
                        ? "bg-[#5353ff]/20 text-[#818cf8]"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {isPremium ? t.dashboard.settingsPage.active : t.dashboard.settingsPage.free}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/40">
                  {isPremium
                    ? t.dashboard.settingsPage.premiumDesc
                    : t.dashboard.settingsPage.freeDesc}
                </p>
                {isPremium && sub?.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-white/25">
                    {sub.cancelAtPeriodEnd
                      ? `${t.dashboard.settingsPage.endsOn} ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                      : `${t.dashboard.settingsPage.renewsOn} ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                  </p>
                )}
              </div>

              {isPremium ? (
                <button
                  onClick={handleManage}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {t.dashboard.settingsPage.manage}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="h-4 w-4" />
                  )}
                  {t.dashboard.settingsPage.upgrade}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400/70">{t.dashboard.settingsPage.dangerZone}</h2>
        <p className="mt-2 text-sm text-white/40">
          {t.dashboard.settingsPage.deleteDesc}
        </p>
        <button className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20">
          {t.dashboard.settingsPage.deleteAccount}
        </button>
      </div>
    </div>
  );
}
