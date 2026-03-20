"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface MyContentItem {
  id: string;
  title: string;
  type: string;
  level: string;
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

  const typeLabels: Record<string, string> = {
    LESSON: tc.lessons,
    DIALOGUE: tc.dialogues,
    FLASHCARD_PACK: tc.flashcardPacks,
    EXERCISE_SET: tc.exerciseSets,
  };

  const statusLabels: Record<string, string> = {
    PENDING: tc.pending,
    APPROVED: tc.approved,
    REJECTED: tc.rejected,
    FLAGGED: tc.flagged,
  };

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

      <h1 className="mb-2 text-2xl font-bold text-white/90">{tc.myContent}</h1>
      <p className="mb-8 text-sm text-white/40">{tc.subtitle}</p>

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
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10"
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
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] ?? "bg-white/10 text-white/60"}`}
                    >
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white/90">
                    {item.title}
                  </h3>
                  {item.reviewNote && item.status === "REJECTED" && (
                    <p className="mt-1 text-sm text-red-300/70">
                      {item.reviewNote}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>{tc.votes}: {item.upvotes - item.downvotes}</span>
                  <span>{tc.uses}: {item.usageCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
