"use client";

import { useState, useEffect } from "react";
import { BookOpen, MessageSquare, Layers, Clock, Flame, TrendingUp, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ProgressData {
  wordsLearned: number;
  lessonsCompleted: number;
  practiceHours: number;
  conversationsHeld: number;
  currentStreak: number;
  currentLevel: string;
  nextLevel: string;
  levelProgress: number;
  flashcardTotal: number;
  language: { name: string; flag: string; code: string } | null;
  skills: Record<string, number>;
}

const skillColors: Record<string, string> = {
  listening: "from-blue-500 to-blue-400",
  reading: "from-emerald-500 to-emerald-400",
  writing: "from-amber-500 to-amber-400",
  speaking: "from-purple-500 to-purple-400",
  grammar: "from-rose-500 to-rose-400",
  vocabulary: "from-cyan-500 to-cyan-400",
};

export default function ProgressPage() {
  const { t } = useI18n();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const skillLabels: Record<string, string> = {
    listening: t.dashboard.progressPage.listening,
    reading: t.dashboard.progressPage.reading,
    writing: t.dashboard.progressPage.writing,
    speaking: t.dashboard.progressPage.speaking,
    grammar: t.dashboard.progressPage.grammar,
    vocabulary: t.dashboard.progressPage.vocabulary,
  };

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-white/40">{t.dashboard.progressPage.loadError}</p>
      </div>
    );
  }

  const statCards = [
    { label: t.dashboard.progressPage.wordsLearned, value: data.wordsLearned, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: t.dashboard.progressPage.lessonsCompleted, value: data.lessonsCompleted, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: t.dashboard.progressPage.conversations, value: data.conversationsHeld, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: t.dashboard.progressPage.practiceHours, value: `${data.practiceHours}h`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: t.dashboard.nav.flashcards, value: data.flashcardTotal, icon: Layers, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: t.dashboard.progressPage.streak, value: data.currentStreak, icon: Flame, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90">{t.dashboard.progressPage.title}</h1>
        <p className="text-sm text-white/40">
          {data.language ? data.language.name : t.dashboard.progressPage.noLanguage} — {t.dashboard.common.level} {data.currentLevel}
        </p>
      </div>

      {/* Level progress */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider">{t.dashboard.progressPage.towardLevel}</p>
            <p className="mt-0.5 text-lg font-bold text-white/90">{t.dashboard.common.level} {data.nextLevel}</p>
          </div>
          <span className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white/50">
            {data.currentLevel}
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-white/60 transition-all duration-700"
            style={{ width: `${data.levelProgress}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs text-white/25">{data.levelProgress}%</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white/85">{stat.value}</p>
                <p className="text-[11px] text-white/30">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
          {t.dashboard.progressPage.skills}
        </h2>
        <div className="mt-4 space-y-4">
          {Object.entries(data.skills).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{skillLabels[key] ?? key}</span>
                <span className="font-mono text-xs text-white/40">{value}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${skillColors[key] ?? "from-gray-500 to-gray-400"} transition-all duration-700`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {Object.values(data.skills).every((v) => v === 0) && (
          <p className="mt-4 text-center text-xs text-white/20">
            {t.dashboard.progressPage.noSkillsYet}
          </p>
        )}
      </div>
    </div>
  );
}
