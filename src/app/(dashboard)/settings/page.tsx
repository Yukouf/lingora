"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Crown, CreditCard } from "lucide-react";

interface SubData {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();
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

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (json.data?.url) {
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
      if (json.data?.url) {
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
      <h1 className="text-2xl font-bold text-white/90">Paramètres</h1>

      {/* Profile */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Profil</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-white/30">Nom</p>
            <p className="mt-0.5 text-white/80">{session?.user?.name ?? "—"}</p>
          </div>
          <div className="h-px bg-white/5" />
          <div>
            <p className="text-xs text-white/30">Email</p>
            <p className="mt-0.5 text-white/80">{session?.user?.email ?? "—"}</p>
          </div>
          <div className="h-px bg-white/5" />
          <div>
            <p className="text-xs text-white/30">Langue maternelle</p>
            <p className="mt-0.5 text-white/80">Français</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Abonnement</h2>

        {subLoading ? (
          <div className="mt-4 flex items-center gap-2 text-white/30">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white/90">
                    {isPremium ? "Premium" : "Plan Gratuit"}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      isPremium
                        ? "bg-[#5353ff]/20 text-[#818cf8]"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {isPremium ? "Actif" : "Gratuit"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/40">
                  {isPremium
                    ? "Accès complet — Tous les niveaux, conversations IA illimitées, toutes les langues"
                    : "Accès aux niveaux A1 et A2 — 1 langue — 15 conversations IA/jour"}
                </p>
                {isPremium && sub?.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-white/25">
                    {sub.cancelAtPeriodEnd
                      ? `Se termine le ${new Date(sub.currentPeriodEnd).toLocaleDateString("fr-FR")}`
                      : `Prochain renouvellement le ${new Date(sub.currentPeriodEnd).toLocaleDateString("fr-FR")}`}
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
                  Gérer
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#5353ff] to-[#a78bfa] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#5353ff]/20 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="h-4 w-4" />
                  )}
                  Passer Premium — 10€/mois
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400/70">Zone danger</h2>
        <p className="mt-2 text-sm text-white/40">
          Supprimer ton compte et toutes tes données. Cette action est irréversible.
        </p>
        <button className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20">
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
