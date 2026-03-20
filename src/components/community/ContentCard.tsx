"use client";

import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ContentCardProps {
  id: string;
  title: string;
  type: string;
  level: string;
  authorName: string | null;
  upvotes: number;
  downvotes: number;
  usageCount: number;
  userVote?: number | null; // +1, -1, or null
  onVote: (id: string, vote: number) => void;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  LESSON: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DIALOGUE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  FLASHCARD_PACK: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  EXERCISE_SET: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const levelColors: Record<string, string> = {
  A1: "bg-green-500/20 text-green-300",
  A2: "bg-green-500/20 text-green-300",
  B1: "bg-yellow-500/20 text-yellow-300",
  B2: "bg-yellow-500/20 text-yellow-300",
  C1: "bg-red-500/20 text-red-300",
  C2: "bg-red-500/20 text-red-300",
};

export function ContentCard({
  id,
  title,
  type,
  level,
  authorName,
  upvotes,
  downvotes,
  usageCount,
  userVote,
  onVote,
  onClick,
}: ContentCardProps) {
  const { t } = useI18n();
  const tc = t.dashboard.community;

  const typeLabels: Record<string, string> = {
    LESSON: tc.lessons,
    DIALOGUE: tc.dialogues,
    FLASHCARD_PACK: tc.flashcardPacks,
    EXERCISE_SET: tc.exerciseSets,
  };

  return (
    <div
      className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.05] cursor-pointer"
      onClick={onClick}
    >
      {/* Badges */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColors[type] ?? "bg-white/10 text-white/60"}`}
        >
          {typeLabels[type] ?? type}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[level] ?? "bg-white/10 text-white/60"}`}
        >
          {level}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-semibold text-white/90 line-clamp-2">
        {title}
      </h3>

      {/* Author */}
      <p className="mb-4 text-sm text-white/40">
        {tc.by} {authorName ?? "Anonyme"}
      </p>

      {/* Bottom row: votes + usage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors ${
              userVote === 1
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-white/40 hover:text-emerald-300 hover:bg-white/5"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onVote(id, 1);
            }}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{upvotes}</span>
          </button>
          <button
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors ${
              userVote === -1
                ? "bg-red-500/20 text-red-300"
                : "text-white/40 hover:text-red-300 hover:bg-white/5"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onVote(id, -1);
            }}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{downvotes}</span>
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/30">
          <Eye className="h-3.5 w-3.5" />
          <span>{usageCount} {tc.uses}</span>
        </div>
      </div>
    </div>
  );
}
