"use client";

import { useState } from "react";
import {
  Target,
  BookOpen,
  MessageSquare,
  Layers,
  Clock,
  Dumbbell,
  Users2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ChallengeCardProps {
  id: string;
  clubId: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  participantsCount: number;
  startsAt: string;
  endsAt: string;
  isParticipating: boolean;
  isMember: boolean;
  onJoinChallenge?: () => void;
}

const typeIcons: Record<string, typeof Target> = {
  FLASHCARDS_REVIEWED: Layers,
  LESSONS_COMPLETED: BookOpen,
  CONVERSATIONS_HELD: MessageSquare,
  EXERCISES_DONE: Dumbbell,
  PRACTICE_MINUTES: Clock,
};

const typeColors: Record<string, { bg: string; text: string; bar: string; ring: string }> = {
  FLASHCARDS_REVIEWED: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    bar: "bg-pink-500",
    ring: "ring-pink-500/20",
  },
  LESSONS_COMPLETED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  CONVERSATIONS_HELD: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    bar: "bg-purple-500",
    ring: "ring-purple-500/20",
  },
  EXERCISES_DONE: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    bar: "bg-blue-500",
    ring: "ring-blue-500/20",
  },
  PRACTICE_MINUTES: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    bar: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
};

const typeLabels: Record<string, string> = {
  FLASHCARDS_REVIEWED: "Flashcards",
  LESSONS_COMPLETED: "Lecons",
  CONVERSATIONS_HELD: "Conversations",
  EXERCISES_DONE: "Exercices",
  PRACTICE_MINUTES: "Minutes",
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
  id,
  clubId,
  title,
  description,
  type,
  target,
  progress,
  participantsCount,
  startsAt,
  endsAt,
  isParticipating,
  isMember,
  onJoinChallenge,
}: ChallengeCardProps) {
  const { t } = useI18n();
  const [joining, setJoining] = useState(false);
  const Icon = typeIcons[type] || Target;
  const colors = typeColors[type] || typeColors.EXERCISES_DONE;
  const percentage = Math.min(100, Math.round((progress / target) * 100));
  const isCompleted = progress >= target;
  const timeLeft = formatTimeLeft(endsAt, t.dashboard.clubs.finished ?? "Termine");
  const isActive = new Date(startsAt) <= new Date() && new Date(endsAt) > new Date();
  const isUpcoming = new Date(startsAt) > new Date();

  async function handleJoin() {
    if (!onJoinChallenge) return;
    setJoining(true);
    try {
      await onJoinChallenge();
    } finally {
      setJoining(false);
    }
  }

  return (
    <div
      className={`rounded-xl border bg-white/[0.03] p-4 transition-all duration-200 hover:bg-white/[0.05] ${
        isCompleted
          ? "border-emerald-500/20"
          : isActive
          ? "border-white/5"
          : "border-white/5 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ring-1 ${colors.ring}`}
          >
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/85">{title}</h3>
            {description && (
              <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
              isUpcoming
                ? "bg-blue-500/10 text-blue-400"
                : isActive
                ? "bg-white/[0.06] text-white/40"
                : "bg-white/[0.04] text-white/25"
            }`}
          >
            {isUpcoming ? (t.dashboard.clubs.upcoming ?? "Bientot") : timeLeft}
          </span>
          <span className="text-[9px] text-white/20">
            {typeLabels[type] || type}
          </span>
        </div>
      </div>

      {/* Progress bar - only show if participating */}
      {isParticipating && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">
              {progress}/{target}
            </span>
            {isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                {t.dashboard.clubs.finished}
              </span>
            ) : (
              <span className="font-mono text-white/30">{percentage}%</span>
            )}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted ? "bg-emerald-500" : colors.bar
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: participants count + join button */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-white/25">
          <Users2 className="h-3 w-3" />
          <span>
            {participantsCount} {t.dashboard.clubs.participants ?? "participants"}
          </span>
        </div>

        {isMember && !isParticipating && isActive && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium transition-all ${colors.bg} ${colors.text} hover:opacity-80 active:scale-95 disabled:opacity-50`}
          >
            {joining ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              t.dashboard.clubs.participate ?? "Participer"
            )}
          </button>
        )}

        {isParticipating && !isCompleted && isActive && (
          <span className="text-[10px] text-violet-400/60">
            {t.dashboard.clubs.participating ?? "En cours"}
          </span>
        )}
      </div>
    </div>
  );
}
