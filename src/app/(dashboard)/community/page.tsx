"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ContentCard } from "@/components/community/ContentCard";
import { FlagModal } from "@/components/community/FlagModal";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  level: string;
  languageCode: string;
  upvotes: number;
  downvotes: number;
  usageCount: number;
  author: { id: string; name: string | null; image: string | null };
}

interface UserVoteMap {
  [contentId: string]: number;
}

export default function CommunityPage() {
  const { t } = useI18n();
  const tc = t.dashboard.community;
  const { data: session } = useSession();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [typeFilter, setTypeFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("recent");

  const [userVotes, setUserVotes] = useState<UserVoteMap>({});

  // Flag modal
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [flagTargetTitle, setFlagTargetTitle] = useState("");
  const [flagSuccess, setFlagSuccess] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("sort", sort);
    if (typeFilter) params.set("type", typeFilter);
    if (languageFilter) params.set("language", languageFilter);
    if (levelFilter) params.set("level", levelFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/community/content?${params}`);
      const json = await res.json();
      if (json.data) {
        setItems(json.data.items);
        setTotalPages(json.data.totalPages);
        // Load user votes from API
        if (json.data.userVotes) {
          setUserVotes((prev) => ({ ...prev, ...json.data.userVotes }));
        }
      }
    } catch {
      // silent
    }
    setLoading(false);
  }, [page, typeFilter, languageFilter, levelFilter, search, sort]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  async function handleVote(contentId: string, vote: number) {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/community/content/${contentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      const json = await res.json();
      if (json.data) {
        const action = json.data.action;
        setUserVotes((prev) => {
          const copy = { ...prev };
          if (action === "removed") {
            delete copy[contentId];
          } else {
            copy[contentId] = vote;
          }
          return copy;
        });
        fetchContent();
      }
    } catch {
      // silent
    }
  }

  function handleFlag(contentId: string) {
    const item = items.find((i) => i.id === contentId);
    if (item) {
      setFlagTargetId(contentId);
      setFlagTargetTitle(item.title);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const tabs = [
    { key: "", label: tc.all },
    { key: "VOCABULARY", label: tc.vocabulary },
    { key: "EXPRESSION", label: tc.expressions },
    { key: "CULTURAL_NOTE", label: tc.culturalNotes },
    { key: "DIALOGUE", label: tc.dialogues },
    { key: "FLASHCARD_PACK", label: tc.flashcardPacks },
    { key: "LESSON", label: tc.lessons },
    { key: "EXERCISE_SET", label: tc.exerciseSets },
  ];

  const sortOptions = [
    { key: "recent", label: tc.sortRecent },
    { key: "popular", label: tc.sortPopular },
    { key: "used", label: tc.sortMostUsed },
  ];

  const selectClass =
    "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 outline-none focus:border-[#a78bfa]/50 transition-colors";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">{tc.title}</h1>
          <p className="mt-1 text-sm text-white/40">{tc.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/community/my-content"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-colors"
          >
            {tc.myContent}
          </Link>
          <Link
            href="/community/submit"
            className="flex items-center gap-1.5 rounded-xl bg-[#a78bfa] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 hover:bg-[#9575f0] transition-colors"
          >
            <Plus className="h-4 w-4" />
            {tc.submitContent}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setTypeFilter(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === tab.key
                ? "bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30"
                : "text-white/40 hover:text-white/60 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters + Search + Sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={tc.browse + "..."}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white/90 placeholder-white/30 outline-none focus:border-[#a78bfa]/50 transition-colors"
          />
        </form>
        <select
          value={languageFilter}
          onChange={(e) => {
            setLanguageFilter(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">{tc.filterByLanguage}</option>
          <option value="en">English</option>
          <option value="es">Espanol</option>
          <option value="fr">French</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="ru">Russian</option>
          <option value="ko">Korean</option>
          <option value="de">Deutsch</option>
          <option value="ar">Arabic</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => {
            setLevelFilter(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">{tc.filterByLevel}</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-white/30">
          {t.dashboard.common.loading}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-4 text-white/30">{tc.noContent}</p>
          <Link
            href="/community/submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#a78bfa] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 hover:bg-[#9575f0] transition-colors"
          >
            <Plus className="h-4 w-4" />
            {tc.submitContent}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                type={item.type}
                level={item.level}
                languageCode={item.languageCode}
                authorName={item.author?.name}
                authorImage={item.author?.image}
                upvotes={item.upvotes}
                downvotes={item.downvotes}
                usageCount={item.usageCount}
                userVote={userVotes[item.id] ?? null}
                onVote={handleVote}
                onFlag={handleFlag}
                showFlagButton={!!session?.user?.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 disabled:opacity-30 transition-colors"
              >
                &larr;
              </button>
              <span className="text-sm text-white/40">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 disabled:opacity-30 transition-colors"
              >
                &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {/* Flag success toast */}
      {flagSuccess && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 shadow-lg backdrop-blur-sm">
          {tc.flagSuccess}
        </div>
      )}

      {/* Flag modal */}
      {flagTargetId && (
        <FlagModal
          contentId={flagTargetId}
          contentTitle={flagTargetTitle}
          onClose={() => setFlagTargetId(null)}
          onSuccess={() => {
            setFlagTargetId(null);
            setFlagSuccess(true);
            setTimeout(() => setFlagSuccess(false), 4000);
          }}
        />
      )}
    </div>
  );
}
