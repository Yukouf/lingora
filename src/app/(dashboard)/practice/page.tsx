"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Building2,
  ShoppingCart,
  MapPin,
  Stethoscope,
  Briefcase,
  MessageCircle,
  Handshake,
  Lock,
  Crown,
  Layers,
  ArrowRight,
  Loader2,
  Mic,
} from "lucide-react";
import { scenarios } from "@/lib/ai/scenarios";
import { useI18n } from "@/lib/i18n/context";

const scenarioIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  restaurant: { icon: UtensilsCrossed, color: "#f97316", bg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" },
  "hotel-checkin": { icon: Building2, color: "#fbbf24", bg: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80" },
  shopping: { icon: ShoppingCart, color: "#22d3ee", bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80" },
  directions: { icon: MapPin, color: "#ef4444", bg: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80" },
  doctor: { icon: Stethoscope, color: "#10b981", bg: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80" },
  "job-interview": { icon: Briefcase, color: "#8b5cf6", bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" },
  debate: { icon: MessageCircle, color: "#06b6d4", bg: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80" },
  negotiation: { icon: Handshake, color: "#f43f5e", bg: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80" },
};

function getScenarioConfig(id: string) {
  return scenarioIcons[id] ?? { icon: MessageCircle, color: "#a78bfa", bg: "" };
}

export default function PracticePage() {
  const { t } = useI18n();
  const freeScenarios = scenarios.filter((s) => !s.isPremium);
  const premiumScenarios = scenarios.filter((s) => s.isPremium);

  const [dueCount, setDueCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/flashcards")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setDueCount(json.data.cards?.length ?? 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-2xl pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t.dashboard.practice.title}</h1>
            <p className="mt-0.5 text-sm text-white/40">
              {t.dashboard.practice.subtitle}
            </p>
          </div>
          <Link
            href="/practice/flashcards"
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition-all hover:bg-white/[0.06] hover:text-white/80"
          >
            <Layers className="h-4 w-4" />
            {t.dashboard.nav.flashcards}
          </Link>
        </div>
      </div>

      {/* Flashcard review banner */}
      {dueCount !== null && dueCount > 0 && (
        <Link href="/practice/flashcards">
          <div className="mb-6 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <Layers className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">
                  {t.dashboard.practice.wordsToReview.replace("{count}", String(dueCount))}
                </p>
                <p className="text-[11px] text-white/30">
                  {t.dashboard.practice.dailySession}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-white/40">
              {t.dashboard.practice.review} <ArrowRight className="ml-1 inline h-3 w-3" />
            </span>
          </div>
        </Link>
      )}

      {dueCount === null && (
        <div className="mb-6 flex items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.01] px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-white/20" />
        </div>
      )}

      {/* Pronunciation practice banner */}
      <Link href="/practice/pronunciation">
        <div className="mb-6 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all hover:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <Mic className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                {t.dashboard.exercise.pronunciation}
              </p>
              <p className="text-[11px] text-white/30">
                {t.dashboard.practice.pronunciationDesc}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-white/40">
            {t.dashboard.practice.startSession} <ArrowRight className="ml-1 inline h-3 w-3" />
          </span>
        </div>
      </Link>

      {/* Free scenarios */}
      <div className="mb-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
          {t.dashboard.practice.availableScenarios}
        </h2>
        <div className="space-y-3">
          {freeScenarios.map((scenario) => {
            const config = getScenarioConfig(scenario.id);
            const Icon = config.icon;

            return (
              <Link key={scenario.id} href={`/practice/chat/${scenario.id}`}>
                <div className="group relative h-28 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${config.bg})` }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/85 via-[#0d1117]/60 to-[#0d1117]/40 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: config.color }}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {scenario.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-white/40">
                          {scenario.description.length > 60
                            ? scenario.description.slice(0, 60) + "..."
                            : scenario.description}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                      {scenario.level}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Premium scenarios */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-white/30">
            {t.dashboard.practice.premiumScenarios}
          </h2>
          <Crown className="h-3 w-3 text-amber-400/60" />
        </div>
        <div className="space-y-3">
          {premiumScenarios.map((scenario) => {
            const config = getScenarioConfig(scenario.id);
            const Icon = config.icon;

            return (
              <div key={scenario.id}>
                <div className="group relative h-28 overflow-hidden rounded-2xl opacity-40 cursor-not-allowed">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${config.bg})` }}
                  />

                  {/* Heavy overlay */}
                  <div className="absolute inset-0 bg-[#0d1117]/90" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03]">
                        <Icon
                          className="h-5 w-5 text-white/15"
                          strokeWidth={1.8}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white/30">
                          {scenario.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-white/15">
                          {scenario.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                      <Lock className="h-3.5 w-3.5 text-white/30" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium CTA */}
        <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-medium text-white/70">
              {t.dashboard.practice.unlockAll}
            </p>
          </div>
          <p className="text-xs text-white/30 mb-3">
            {t.dashboard.practice.unlockDesc}
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            {t.dashboard.common.premium}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
