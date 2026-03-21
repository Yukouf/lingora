"use client";

import { Users2, Trophy, Flame, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ClubStatsProps {
  memberCount: number;
  maxMembers: number;
  totalWeeklyXp: number;
  activeChallenges: number;
  totalLessonsThisWeek: number;
}

export function ClubStats({
  memberCount,
  maxMembers,
  totalWeeklyXp,
  activeChallenges,
  totalLessonsThisWeek,
}: ClubStatsProps) {
  const { t } = useI18n();

  const stats = [
    {
      label: t.dashboard.clubs.members,
      value: `${memberCount}/${maxMembers}`,
      icon: Users2,
      color: "text-violet-400 bg-violet-500/10",
    },
    {
      label: t.dashboard.clubs.weeklyXp ?? "XP hebdo",
      value: totalWeeklyXp.toLocaleString(),
      icon: Trophy,
      color: "text-yellow-400 bg-yellow-500/10",
    },
    {
      label: t.dashboard.clubs.activeChallenges ?? "Defis actifs",
      value: activeChallenges.toString(),
      icon: Flame,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      label: t.dashboard.clubs.lessonsThisWeek ?? "Lecons / semaine",
      value: totalLessonsThisWeek.toString(),
      icon: BookOpen,
      color: "text-emerald-400 bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
          >
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-2 text-lg font-bold text-white/85">{stat.value}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
