"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Flag,
  Trash2,
  Clock,
  User as UserIcon,
  Globe,
  BookOpen,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { FlagModal } from "@/components/community/FlagModal";

interface ContentAuthor {
  id: string;
  name: string | null;
  image: string | null;
  reputation: number;
}

interface ContentVoteData {
  userId: string;
  vote: number;
}

interface ContentDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  level: string;
  languageCode: string;
  content: Record<string, unknown>;
  status: string;
  upvotes: number;
  downvotes: number;
  usageCount: number;
  createdAt: string;
  author: ContentAuthor;
  votes: ContentVoteData[];
  userVote: number | null;
  userFlagged: boolean;
  flagCount: number;
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

const languageNames: Record<string, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ru: "Russian",
  ar: "Arabic",
};

export default function ContentDetailPage() {
  const { t } = useI18n();
  const tc = t.dashboard.community;
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  const [item, setItem] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const typeLabels: Record<string, string> = {
    LESSON: tc.lessons,
    DIALOGUE: tc.dialogues,
    FLASHCARD_PACK: tc.flashcardPacks,
    EXERCISE_SET: tc.exerciseSets,
    VOCABULARY: tc.vocabulary,
    EXPRESSION: tc.expressions,
    CULTURAL_NOTE: tc.culturalNotes,
  };

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/content/${contentId}`);
      const json = await res.json();
      if (json.data) {
        setItem(json.data);
        setUserVote(json.data.userVote);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }, [contentId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  async function handleVote(vote: number) {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/community/content/${contentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      const json = await res.json();
      if (json.data) {
        if (json.data.action === "removed") {
          setUserVote(null);
        } else {
          setUserVote(vote);
        }
        fetchContent();
      }
    } catch {
      // silent
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/community/content/${contentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/community/my-content");
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="py-20 text-center text-white/30">
          {t.dashboard.common.loading}
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="py-20 text-center text-white/40">
          Contenu introuvable
        </div>
      </div>
    );
  }

  const isAuthor = session?.user?.id === item.author.id;
  const netScore = item.upvotes - item.downvotes;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {tc.backToCommunity}
      </Link>

      {/* Main card */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 sm:p-8">
        {/* Header badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${typeColors[item.type] ?? "bg-white/10 text-white/60 border-white/10"}`}
          >
            {typeLabels[item.type] ?? item.type}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${levelColors[item.level] ?? "bg-white/10 text-white/60"}`}
          >
            {item.level}
          </span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/50">
            {languageNames[item.languageCode] ?? item.languageCode}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-white/90">{item.title}</h1>

        {/* Description */}
        {item.description && (
          <p className="mb-6 text-sm text-white/50 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Meta info row */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-white/40">
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" />
            <span>{item.author.name ?? "Anonyme"}</span>
            {item.author.reputation > 0 && (
              <span className="rounded-full bg-[#a78bfa]/10 px-2 py-0.5 text-xs text-[#a78bfa]">
                {item.author.reputation} pts
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>
              {item.usageCount} {tc.uses}
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <ContentBody type={item.type} content={item.content} tc={tc} />
        </div>

        {/* Vote bar + actions */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Votes */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                userVote === 1
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-white/50 hover:text-emerald-300 hover:bg-white/5 border border-white/10"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{item.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote(-1)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                userVote === -1
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "text-white/50 hover:text-red-300 hover:bg-white/5 border border-white/10"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{item.downvotes}</span>
            </button>
            <span
              className={`text-sm font-semibold ${
                netScore > 0
                  ? "text-emerald-400"
                  : netScore < 0
                    ? "text-red-400"
                    : "text-white/30"
              }`}
            >
              {tc.score}: {netScore > 0 ? `+${netScore}` : netScore}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isAuthor && !item.userFlagged && (
              <button
                onClick={() => setShowFlagModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/40 hover:text-red-400 hover:border-red-500/20 transition-colors"
              >
                <Flag className="h-3.5 w-3.5" />
                {tc.flag}
              </button>
            )}
            {item.userFlagged && (
              <span className="text-xs text-red-400/60">
                {tc.flagAlready}
              </span>
            )}
            {isAuthor && (
              <>
                {deleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-300">
                      {tc.deleteConfirm}
                    </span>
                    <button
                      onClick={handleDelete}
                      className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
                    >
                      {tc.deleteContent}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                      {t.dashboard.common.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/40 hover:text-red-400 hover:border-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {tc.deleteContent}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Flag success toast */}
      {flagSuccess && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {tc.flagSuccess}
        </div>
      )}

      {/* Flag modal */}
      {showFlagModal && (
        <FlagModal
          contentId={contentId}
          contentTitle={item.title}
          onClose={() => setShowFlagModal(false)}
          onSuccess={() => {
            setShowFlagModal(false);
            setFlagSuccess(true);
            fetchContent();
            setTimeout(() => setFlagSuccess(false), 4000);
          }}
        />
      )}
    </div>
  );
}

// --- Content rendering sub-component ---

interface ContentBodyProps {
  type: string;
  content: Record<string, unknown>;
  tc: Record<string, unknown>;
}

function ContentBody({ type, content }: ContentBodyProps) {
  switch (type) {
    case "VOCABULARY": {
      const entries = (content as { entries?: Array<{ word: string; translation: string; example?: string; context?: string }> }).entries ?? [];
      return (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <span className="text-base font-semibold text-cyan-300">
                  {entry.word}
                </span>
                <span className="text-sm text-white/60">
                  {entry.translation}
                </span>
              </div>
              {entry.example && (
                <p className="mb-1 text-sm text-white/40 italic">
                  &ldquo;{entry.example}&rdquo;
                </p>
              )}
              {entry.context && (
                <p className="text-xs text-white/30">
                  <Globe className="mr-1 inline h-3 w-3" />
                  {entry.context}
                </p>
              )}
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-white/30">Aucune entree</p>
          )}
        </div>
      );
    }

    case "EXPRESSION": {
      const entries = (content as { entries?: Array<{ expression: string; meaning: string; example?: string; usage?: string }> }).entries ?? [];
      return (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <span className="text-base font-semibold text-pink-300">
                  {entry.expression}
                </span>
                <span className="text-sm text-white/60">
                  {entry.meaning}
                </span>
              </div>
              {entry.example && (
                <p className="mb-1 text-sm text-white/40 italic">
                  &ldquo;{entry.example}&rdquo;
                </p>
              )}
              {entry.usage && (
                <p className="text-xs text-white/30">
                  <BookOpen className="mr-1 inline h-3 w-3" />
                  {entry.usage}
                </p>
              )}
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-white/30">Aucune entree</p>
          )}
        </div>
      );
    }

    case "CULTURAL_NOTE": {
      const body = (content as { body?: string }).body ?? "";
      return (
        <div className="prose prose-invert max-w-none text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
          {body}
        </div>
      );
    }

    case "LESSON": {
      const body = (content as { body?: string }).body ?? "";
      return (
        <div className="prose prose-invert max-w-none text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
          {body}
        </div>
      );
    }

    case "DIALOGUE": {
      const lines = (content as { lines?: Array<{ speaker: string; text: string }> }).lines ?? [];
      return (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="min-w-[80px] text-right text-sm font-semibold text-emerald-300">
                {line.speaker}:
              </span>
              <span className="text-sm text-white/70">{line.text}</span>
            </div>
          ))}
        </div>
      );
    }

    case "FLASHCARD_PACK": {
      const cards = (content as { cards?: Array<{ front: string; back: string }> }).cards ?? [];
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
            >
              <div className="text-sm font-medium text-amber-300">
                {card.front}
              </div>
              <div className="mt-1 text-sm text-white/50">{card.back}</div>
            </div>
          ))}
        </div>
      );
    }

    case "EXERCISE_SET": {
      return (
        <pre className="max-h-60 overflow-auto text-xs text-white/50 whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }

    default:
      return (
        <pre className="text-xs text-white/50 whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
  }
}
