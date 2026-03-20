"use client";

import { Target, BookOpen, MessageSquare, Layers, Clock, Dumbbell } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ChallengeCardProps {
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  participantsCount: number;
  startsAt: string;
  endsAt: string;
}

const typeIcons: Record<string, typeof Target> = {
  FLASHCARDS_REVIEWED: Layers,
  LESSONS_COMPLETED: BookOpen,
  CONVERSATIONS_HELD: MessageSquare,
  EXERCISES_DONE: Dumbbell,
  PRACTICE_MINUTES: Clock,
};

const typeColors: Record<string, { bg: string; text: string; bar: string }> = {
  FLASHCARDS_REVIEWED: { bg: "bg-pink-500/10", text: "text-pink-400", bar: "bg-pink-500" },
  LESSONS_COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400", bar: "bg-emerald-500" },
  CONVERSATIONS_HELD: { bg: "bg-purple-500/10", text: "text-purple-400", bar: "bg-purple-500" },
  EXERCISES_DONE: { bg: "bg-blue-500/10", text: "text-blue-400", bar: "bg-blue-500" },
  PRACTICE_MINUTES: { bg: "bg-amber-500/10", text: "text-amber-400", bar: "bg-amber-500" },
};

function formatTimeLeft(endsAt: string, finishedLabel: string): string {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return finishedLabel;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}j ${hours}h`;
  return `${hours}h`;
}

export function ChallengeCard({
  title,
  description,
  type,
  target,
  progress,
  participantsCount,
  endsAt,
}: ChallengeCardProps) {
  const { t } = useI18n();
  const Icon = typeIcons[type] || Target;
  const colors = typeColors[type] || typeColors.EXERCISES_DONE;
  const percentage = Math.min(100, Math.round((progress / target) * 100));
  const timeLeft = formatTimeLeft(endsAt, t.dashboard.clubs.finished ?? "Terminé");

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/85">{title}</h3>
            {description && (
              <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
        </div>
        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40">
          {timeLeft}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">
            {t.dashboard.clubs.progress}: {progress}/{target}
          </span>
          <span className="font-mono text-white/30">{percentage}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-white/25">
        <span>
          {participantsCount} {t.dashboard.clubs.members.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
