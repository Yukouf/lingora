"use client";

import { ThumbsUp, ThumbsDown, Eye, Flag } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface ContentCardProps {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  level: string;
  languageCode?: string;
  authorName: string | null;
  authorImage?: string | null;
  upvotes: number;
  downvotes: number;
  usageCount: number;
  userVote?: number | null; // +1, -1, or null
  onVote: (id: string, vote: number) => void;
  onFlag?: (id: string) => void;
  showFlagButton?: boolean;
}

const typeColors: Record<string, string> = {
  LESSON: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DIALOGUE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  FLASHCARD_PACK: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  EXERCISE_SET: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  VOCABULARY: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  EXPRESSION: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  CULTURAL_NOTE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const levelColors: Record<string, string> = {
  A1: "bg-green-500/20 text-green-300",
  A2: "bg-green-500/20 text-green-300",
  B1: "bg-yellow-500/20 text-yellow-300",
  B2: "bg-yellow-500/20 text-yellow-300",
  C1: "bg-red-500/20 text-red-300",
  C2: "bg-red-500/20 text-red-300",
};

const languageFlags: Record<string, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  ja: "JA",
  zh: "ZH",
  ko: "KO",
  ru: "RU",
  ar: "AR",
};

export function ContentCard({
  id,
  title,
  description,
  type,
  level,
  languageCode,
  authorName,
  authorImage,
  upvotes,
  downvotes,
  usageCount,
  userVote,
  onVote,
  onFlag,
  showFlagButton = true,
}: ContentCardProps) {
  const { t } = useI18n();
  const tc = t.dashboard.community;

  const typeLabels: Record<string, string> = {
    LESSON: tc.lessons,
    DIALOGUE: tc.dialogues,
    FLASHCARD_PACK: tc.flashcardPacks,
    EXERCISE_SET: tc.exerciseSets,
    VOCABULARY: tc.vocabulary,
    EXPRESSION: tc.expressions,
    CULTURAL_NOTE: tc.culturalNotes,
  };

  const netScore = upvotes - downvotes;

  return (
    <div className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.05]">
      {/* Flag button — top right */}
      {showFlagButton && onFlag && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFlag(id);
          }}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-white/20 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          title={tc.flag}
        >
          <Flag className="h-3.5 w-3.5" />
        </button>
      )}

      <Link href={`/community/${id}`} className="block">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColors[type] ?? "bg-white/10 text-white/60 border-white/10"}`}
          >
            {typeLabels[type] ?? type}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[level] ?? "bg-white/10 text-white/60"}`}
          >
            {level}
          </span>
          {languageCode && (
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-white/50">
              {languageFlags[languageCode] ?? languageCode.toUpperCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-base font-semibold text-white/90 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mb-3 text-sm text-white/40 line-clamp-2">
            {description}
          </p>
        )}

        {/* Author */}
        <div className="mb-4 flex items-center gap-2">
          {authorImage ? (
            <img
              src={authorImage}
              alt=""
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a78bfa]/20 text-[10px] font-bold text-[#a78bfa]">
              {authorName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <span className="text-sm text-white/40">
            {authorName ?? "Anonyme"}
          </span>
        </div>
      </Link>

      {/* Bottom row: votes + usage */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
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
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
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
          {/* Net score */}
          <span
            className={`ml-1 text-xs font-medium ${
              netScore > 0
                ? "text-emerald-400"
                : netScore < 0
                  ? "text-red-400"
                  : "text-white/30"
            }`}
          >
            {netScore > 0 ? `+${netScore}` : netScore}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/30">
          <Eye className="h-3.5 w-3.5" />
          <span>
            {usageCount} {tc.uses}
          </span>
        </div>
      </div>
    </div>
  );
}
