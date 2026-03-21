"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  MessageSquare,
  Clock,
  Flame,
  Target,
  CheckCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProgressData {
  userName: string | null;
  userImage: string | null;
  memberSince: string | null;
  wordsLearned: number;
  lessonsCompleted: number;
  practiceHours: number;
  conversationsHeld: number;
  currentStreak: number;
  averageScore: number;
  currentLevel: string;
  nextLevel: string;
  levelProgress: number;
  flashcardTotal: number;
  masteredWords: number;
  hasPerfectScore: boolean;
  language: { name: string; flag: string; code: string } | null;
  skills: Record<string, number>;
  activityDays: string[];
}

type TrophyRarity = "bronze" | "silver" | "gold" | "platinum";

interface Trophy {
  id: string;
  label: string;
  description: string;
  rarity: TrophyRarity;
  unlocked: boolean;
  unlockedDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ------------------------------------------------------------------ */
/*  Radar chart (SVG)                                                  */
/* ------------------------------------------------------------------ */

interface RadarChartProps {
  skills: Record<string, number>;
  labels: Record<string, string>;
}

function RadarChart({ skills, labels }: RadarChartProps) {
  const keys = Object.keys(skills);
  const n = keys.length;
  if (n === 0) return null;

  const cx = 150;
  const cy = 150;
  const maxR = 110;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const angleStep = (2 * Math.PI) / n;
  // Start from top (-PI/2)
  const getPoint = (i: number, r: number) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const dataPoints = keys.map((k, i) => {
    const val = (skills[k] ?? 0) / 100;
    return getPoint(i, val * maxR);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]">
      {/* Grid levels */}
      {levels.map((l) => {
        const pts = keys.map((_, i) => getPoint(i, l * maxR));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
        return <path key={l} d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const p = getPoint(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}

      {/* Data fill */}
      <path d={dataPath} fill="url(#radarGrad)" stroke="rgba(139,92,246,0.8)" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#a78bfa" stroke="#1e1b2e" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(167,139,250,0.7)]" />
      ))}

      {/* Labels */}
      {keys.map((k, i) => {
        const p = getPoint(i, maxR + 22);
        return (
          <text
            key={k}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white/50 text-[10px] font-medium"
          >
            {labels[k] ?? k}
          </text>
        );
      })}

      {/* Gradient def */}
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.35)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0.08)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Trophy card                                                        */
/* ------------------------------------------------------------------ */

const rarityStyles: Record<TrophyRarity, { border: string; glow: string; icon: string; bg: string }> = {
  bronze: {
    border: "border-amber-700/40",
    glow: "shadow-[0_0_20px_rgba(180,83,9,0.25)]",
    icon: "text-amber-600",
    bg: "bg-amber-900/20",
  },
  silver: {
    border: "border-gray-400/40",
    glow: "shadow-[0_0_20px_rgba(156,163,175,0.25)]",
    icon: "text-gray-300",
    bg: "bg-gray-500/15",
  },
  gold: {
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    icon: "text-yellow-400",
    bg: "bg-yellow-500/15",
  },
  platinum: {
    border: "border-blue-400/40",
    glow: "shadow-[0_0_24px_rgba(96,165,250,0.35)]",
    icon: "text-blue-400",
    bg: "bg-blue-500/15",
  },
};

function TrophyCard({ trophy, rarityLabel }: { trophy: Trophy; rarityLabel: string }) {
  const config = rarityStyles[trophy.rarity];

  if (!trophy.unlocked) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 opacity-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
          <Lock className="h-5 w-5 text-white/20" />
        </div>
        <p className="text-center text-xs text-white/20">{trophy.label}</p>
        <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/15">
          {rarityLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border ${config.border} ${config.bg} ${config.glow} p-4 transition-transform hover:scale-105`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bg}`}>
        <span className="text-2xl">
          {trophy.rarity === "platinum" ? "💎" : "🏆"}
        </span>
      </div>
      <p className={`text-center text-xs font-medium ${config.icon}`}>{trophy.label}</p>
      <span className={`rounded-full ${config.bg} px-2 py-0.5 text-[10px] ${config.icon}`}>
        {rarityLabel}
      </span>
      {trophy.unlockedDate && (
        <p className="text-[10px] text-white/20">{trophy.unlockedDate}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity heatmap                                                   */
/* ------------------------------------------------------------------ */

function ActivityHeatmap({ activityDays }: { activityDays: string[] }) {
  const daySet = new Set(activityDays);
  const weeks: { date: string; active: boolean }[][] = [];

  // Build 12 weeks of dates ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the start of the grid: go back 83 days from today, then to the previous Monday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83);
  // Adjust to Monday
  const dayOfWeek = startDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + diff);

  const cursor = new Date(startDate);
  let currentWeek: { date: string; active: boolean }[] = [];

  while (cursor <= today) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    currentWeek.push({ date: dateStr, active: daySet.has(dateStr) });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="flex gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day, di) => (
            <div
              key={di}
              title={day.date}
              className={`h-3 w-3 rounded-[2px] transition-colors ${
                day.active
                  ? "bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                  : "bg-white/[0.06]"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  accentColor: string;
  glowColor: string;
}

function StatCard({ label, value, suffix, icon: Icon, accentColor, glowColor }: StatCardProps) {
  const { value: animatedValue, ref } = useCountUp(value);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.05] ${glowColor}`}
    >
      {/* Subtle gradient accent top border */}
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accentColor} opacity-60`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight text-white/90">
            {animatedValue}
            {suffix && <span className="text-xl text-white/50">{suffix}</span>}
          </p>
          <p className="mt-1 text-xs text-white/35">{label}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentColor} opacity-20`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level badge                                                        */
/* ------------------------------------------------------------------ */

function LevelBadge({ level, rankLabel }: { level: string; rankLabel: string }) {
  const levelColors: Record<string, string> = {
    A1: "from-green-400 to-emerald-600",
    A2: "from-teal-400 to-cyan-600",
    B1: "from-blue-400 to-indigo-600",
    B2: "from-violet-400 to-purple-600",
    C1: "from-amber-400 to-orange-600",
    C2: "from-rose-400 to-red-600",
  };

  const gradient = levelColors[level] ?? "from-gray-400 to-gray-600";

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${gradient} px-3 py-1.5 text-sm font-bold tracking-wider text-white shadow-lg`}>
      <span className="text-[10px] uppercase opacity-80">{rankLabel}</span>
      <span>{level}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

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

  const pp = t.dashboard.progressPage;

  const buildTrophies = useCallback(
    (d: ProgressData): Trophy[] => {
      const today = new Date().toLocaleDateString();
      return [
        {
          id: "first-lesson",
          label: pp.trophyFirstLesson,
          description: pp.trophyFirstLessonDesc,
          rarity: "bronze" as TrophyRarity,
          unlocked: d.lessonsCompleted >= 1,
          unlockedDate: d.lessonsCompleted >= 1 ? today : undefined,
        },
        {
          id: "10-words",
          label: pp.trophy10Words,
          description: pp.trophy10WordsDesc,
          rarity: "bronze" as TrophyRarity,
          unlocked: d.wordsLearned >= 10,
          unlockedDate: d.wordsLearned >= 10 ? today : undefined,
        },
        {
          id: "first-conversation",
          label: pp.trophyFirstConversation,
          description: pp.trophyFirstConversationDesc,
          rarity: "silver" as TrophyRarity,
          unlocked: d.conversationsHeld >= 1,
          unlockedDate: d.conversationsHeld >= 1 ? today : undefined,
        },
        {
          id: "level-a2",
          label: pp.trophyLevelA2,
          description: pp.trophyLevelA2Desc,
          rarity: "gold" as TrophyRarity,
          unlocked: ["A2", "B1", "B2", "C1", "C2"].includes(d.currentLevel),
          unlockedDate: ["A2", "B1", "B2", "C1", "C2"].includes(d.currentLevel) ? today : undefined,
        },
        {
          id: "7-day-streak",
          label: pp.trophy7DayStreak,
          description: pp.trophy7DayStreakDesc,
          rarity: "silver" as TrophyRarity,
          unlocked: d.currentStreak >= 7,
          unlockedDate: d.currentStreak >= 7 ? today : undefined,
        },
        {
          id: "50-words-mastered",
          label: pp.trophy50WordsMastered,
          description: pp.trophy50WordsMasteredDesc,
          rarity: "gold" as TrophyRarity,
          unlocked: d.masteredWords >= 50,
          unlockedDate: d.masteredWords >= 50 ? today : undefined,
        },
        {
          id: "perfect-exam",
          label: pp.trophyPerfectExam,
          description: pp.trophyPerfectExamDesc,
          rarity: "platinum" as TrophyRarity,
          unlocked: d.hasPerfectScore,
          unlockedDate: d.hasPerfectScore ? today : undefined,
        },
      ];
    },
    [pp]
  );

  const rarityLabels: Record<TrophyRarity, string> = {
    bronze: pp.rarityBronze,
    silver: pp.raritySilver,
    gold: pp.rarityGold,
    platinum: pp.rarityPlatinum,
  };

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

  const trophies = buildTrophies(data);
  const unlockedCount = trophies.filter((t) => t.unlocked).length;
  const initials = data.userName
    ? data.userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const memberDate = data.memberSince
    ? new Date(data.memberSince).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* ========== HERO — Player Card ========== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-8">
        {/* Animated gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/4 h-[200%] w-[200%] animate-[spin_20s_linear_infinite] opacity-[0.04]">
            <div className="h-full w-full bg-[conic-gradient(from_0deg,#8b5cf6,#3b82f6,#06b6d4,#8b5cf6)]" />
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          {/* Avatar with glow ring */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 opacity-60 blur-md" />
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />
            {data.userImage ? (
              <img
                src={data.userImage}
                alt=""
                className="relative h-24 w-24 rounded-full border-2 border-[#0d0b14] object-cover"
              />
            ) : (
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#0d0b14] bg-[#1a1625] text-2xl font-bold text-white/80">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white/95 md:text-3xl">
              {data.userName ?? t.dashboard.progressPage.player}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <LevelBadge level={data.currentLevel} rankLabel={pp.rank} />
              {data.language && (
                <span className="text-sm text-white/40">
                  {data.language.flag} {data.language.name}
                </span>
              )}
            </div>
            {memberDate && (
              <p className="mt-2 text-xs text-white/25">
                {t.dashboard.progressPage.memberSince} {memberDate}
              </p>
            )}

            {/* XP progress bar */}
            <div className="mt-5 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">
                  {t.dashboard.progressPage.towardLevel}{" "}
                  <span className="font-semibold text-white/60">{data.nextLevel}</span>
                </span>
                <span className="font-mono text-white/50">{data.levelProgress}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000 ease-out"
                  style={{ width: `${data.levelProgress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </div>
              </div>
            </div>

            {/* Trophy summary */}
            <div className="mt-3 flex items-center justify-center gap-1.5 md:justify-start">
              <span className="text-sm">🏆</span>
              <span className="text-xs text-white/40">
                {unlockedCount}/{trophies.length} {t.dashboard.progressPage.trophiesUnlocked}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== STATS GRID ========== */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          {t.dashboard.progressPage.statistics}
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={t.dashboard.progressPage.wordsLearned}
            value={data.wordsLearned}
            icon={BookOpen}
            accentColor="from-blue-500 to-cyan-500"
            glowColor="hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
          />
          <StatCard
            label={t.dashboard.progressPage.practiceHours}
            value={data.practiceHours}
            suffix="h"
            icon={Clock}
            accentColor="from-amber-500 to-orange-500"
            glowColor="hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]"
          />
          <StatCard
            label={t.dashboard.progressPage.lessonsCompleted}
            value={data.lessonsCompleted}
            icon={CheckCircle}
            accentColor="from-emerald-500 to-green-500"
            glowColor="hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          />
          <StatCard
            label={t.dashboard.progressPage.avgScore}
            value={data.averageScore}
            suffix="%"
            icon={Target}
            accentColor="from-rose-500 to-pink-500"
            glowColor="hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]"
          />
          <StatCard
            label={t.dashboard.progressPage.streak}
            value={data.currentStreak}
            icon={Flame}
            accentColor="from-red-500 to-orange-500"
            glowColor="hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          />
          <StatCard
            label={t.dashboard.progressPage.conversations}
            value={data.conversationsHeld}
            icon={MessageSquare}
            accentColor="from-purple-500 to-violet-500"
            glowColor="hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
          />
        </div>
      </div>

      {/* ========== SKILLS RADAR + ACTIVITY ========== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            {t.dashboard.progressPage.skills}
          </h2>

          {Object.values(data.skills).every((v) => v === 0) ? (
            <p className="py-12 text-center text-xs text-white/20">
              {t.dashboard.progressPage.noSkillsYet}
            </p>
          ) : (
            <RadarChart skills={data.skills} labels={skillLabels} />
          )}

          {/* Skill list below radar */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(data.skills).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
                <span className="text-[11px] text-white/40">{skillLabels[key] ?? key}</span>
                <span className="font-mono text-xs font-semibold text-white/60">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            {t.dashboard.progressPage.activity}
          </h2>
          <div className="flex justify-center overflow-x-auto py-2">
            <ActivityHeatmap activityDays={data.activityDays} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-white/25">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-[2px] bg-white/[0.06]" />
              <span>{t.dashboard.progressPage.inactive}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-[2px] bg-emerald-500/80" />
              <span>{t.dashboard.progressPage.active}</span>
            </div>
          </div>

          {/* Streak highlight */}
          {data.currentStreak > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-3 border border-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-semibold text-orange-300">
                {data.currentStreak} {t.dashboard.progressPage.streak.toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========== TROPHIES ========== */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            {t.dashboard.progressPage.trophies}
          </h2>
          <span className="text-xs text-white/25">
            {unlockedCount}/{trophies.length}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {trophies.map((trophy) => (
            <TrophyCard key={trophy.id} trophy={trophy} rarityLabel={rarityLabels[trophy.rarity]} />
          ))}
        </div>
      </div>

      {/* Shimmer keyframe (injected via style tag since Tailwind doesn't have it by default) */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
