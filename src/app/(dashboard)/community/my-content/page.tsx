"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface MyContentItem {
  id: string;
  title: string;
  type: string;
  level: string;
  languageCode: string;
  status: string;
  upvotes: number;
  downvotes: number;
  usageCount: number;
  reviewNote: string | null;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  LESSON: "bg-blue-500/20 text-blue-300",
  DIALOGUE: "bg-emerald-500/20 text-emerald-300",
  FLASHCARD_PACK: "bg-amber-500/20 text-amber-300",
  EXERCISE_SET: "bg-purple-500/20 text-purple-300",
  VOCABULARY: "bg-cyan-500/20 text-cyan-300",
  EXPRESSION: "bg-pink-500/20 text-pink-300",
  CULTURAL_NOTE: "bg-orange-500/20 text-orange-300",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  APPROVED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
  FLAGGED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

export default function MyContentPage() {
  const { t } = useI18n();
  const tc = t.dashboard.community;

  const [items, setItems] = useState<MyContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/community/my-content");
        const json = await res.json();
        if (json.data) setItems(json.data);
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/community/content/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // silent
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  const typeLabels: Record<string, string> = {
    LESSON: tc.lessons,
    DIALOGUE: tc.dialogues,
    FLASHCARD_PACK: tc.flashcardPacks,
    EXERCISE_SET: tc.exerciseSets,
    VOCABULARY: tc.vocabulary,
    EXPRESSION: tc.expressions,
    CULTURAL_NOTE: tc.culturalNotes,
  };

  const statusLabels: Record<string, string> = {
    PENDING: tc.pending,
    APPROVED: tc.approved,
    REJECTED: tc.rejected,
    FLAGGED: tc.flagged,
  };

  // Stats
  const totalItems = items.length;
  const approvedCount = items.filter((i) => i.status === "APPROVED").length;
  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const totalVotes = items.reduce(
    (acc, i) => acc + i.upvotes - i.downvotes,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.dashboard.common.back}
      </Link>

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white/90">{tc.myContent}</h1>
        <Link
          href="/community/submit"
          className="rounded-xl bg-[#a78bfa] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 hover:bg-[#9575f0] transition-colors"
        >
          {tc.submitContent}
        </Link>
      </div>
      <p className="mb-6 text-sm text-white/40">{tc.subtitle}</p>

      {/* Stats row */}
      {!loading && items.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
            <div className="text-xl font-bold text-white/90">{totalItems}</div>
            <div className="text-xs text-white/40">{tc.total}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
            <div className="text-xl font-bold text-emerald-400">
              {approvedCount}
            </div>
            <div className="text-xs text-white/40">{tc.approved}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
            <div className="text-xl font-bold text-amber-400">
              {pendingCount}
            </div>
            <div className="text-xs text-white/40">{tc.pending}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
            <div
              className={`text-xl font-bold ${totalVotes >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {totalVotes > 0 ? `+${totalVotes}` : totalVotes}
            </div>
            <div className="text-xs text-white/40">{tc.votes}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-white/30">
          {t.dashboard.common.loading}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-4 text-white/30">{tc.noContent}</p>
          <Link
            href="/community/submit"
            className="inline-flex rounded-xl bg-[#a78bfa] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 hover:bg-[#9575f0] transition-colors"
          >
            {tc.submitContent}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[item.type] ?? "bg-white/10 text-white/60"}`}
                    >
                      {typeLabels[item.type] ?? item.type}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                      {item.level}
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/40">
                      {item.languageCode.toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] ?? "bg-white/10 text-white/60"}`}
                    >
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                  <Link
                    href={`/community/${item.id}`}
                    className="group/link inline-flex items-center gap-1.5"
                  >
                    <h3 className="text-base font-semibold text-white/90 group-hover/link:text-[#a78bfa] transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover/link:text-[#a78bfa] transition-colors" />
                  </Link>
                  {item.reviewNote && item.status === "REJECTED" && (
                    <p className="mt-1 text-sm text-red-300/70">
                      {item.reviewNote}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-white/25">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span>
                      {tc.votes}:{" "}
                      <span
                        className={
                          item.upvotes - item.downvotes >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {item.upvotes - item.downvotes > 0 ? "+" : ""}
                        {item.upvotes - item.downvotes}
                      </span>
                    </span>
                    <span>
                      {tc.uses}: {item.usageCount}
                    </span>
                  </div>

                  {/* Delete button */}
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg bg-red-500/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === item.id
                          ? "..."
                          : tc.deleteContent}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                      >
                        {t.dashboard.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="rounded-lg p-2 text-white/20 opacity-0 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 transition-all"
                      title={tc.deleteContent}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
