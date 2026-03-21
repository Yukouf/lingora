"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2, Globe, Users2, Flame } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ClubCard } from "@/components/clubs/ClubCard";

interface ClubMemberAvatar {
  name: string | null;
  image: string | null;
}

interface Club {
  id: string;
  name: string;
  description: string;
  languageCode: string;
  maxMembers: number;
  _count: { members: number; challenges?: number };
  memberAvatars?: ClubMemberAvatar[];
  myRole?: string;
}

const languageOptions = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
];

export default function ClubsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"discover" | "my">("discover");
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [publicClubs, setPublicClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchMyClubs = useCallback(async () => {
    try {
      const res = await fetch("/api/clubs/my-clubs");
      const json = await res.json();
      if (json.data) {
        setMyClubs(json.data);
        setMyClubIds(new Set(json.data.map((c: Club) => c.id)));
      }
    } catch {
      // network error — leave state as-is
    }
  }, []);

  const fetchPublicClubs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (language) params.set("language", language);
      const res = await fetch(`/api/clubs?${params.toString()}`);
      const json = await res.json();
      if (json.data) setPublicClubs(json.data);
    } catch {
      // network error — leave state as-is
    }
  }, [search, language]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPublicClubs(), fetchMyClubs()]).finally(() =>
      setLoading(false)
    );
  }, [fetchPublicClubs, fetchMyClubs]);

  async function handleJoin(clubId: string) {
    setJoiningId(clubId);
    try {
      const res = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
      if (res.ok) {
        await Promise.all([fetchPublicClubs(), fetchMyClubs()]);
      }
    } finally {
      setJoiningId(null);
    }
  }

  const displayedClubs = tab === "discover" ? publicClubs : myClubs;
  const totalMembers = displayedClubs.reduce(
    (sum, c) => sum + c._count.members,
    0
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">
            {t.dashboard.clubs.title}
          </h1>
          <p className="mt-1 text-sm text-white/30">
            {t.dashboard.clubs.subtitle}
          </p>
        </div>
        <Link
          href="/clubs/create"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/30 hover:shadow-md hover:shadow-violet-500/10 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {t.dashboard.clubs.createClub}
        </Link>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-white/40">
            <Globe className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-lg font-bold text-white/80">{publicClubs.length}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-wider">
            {t.dashboard.clubs.title}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-white/40">
            <Users2 className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-lg font-bold text-white/80">{totalMembers}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-wider">
            {t.dashboard.clubs.members}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-white/40">
            <Flame className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-lg font-bold text-white/80">{myClubs.length}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-wider">
            {t.dashboard.clubs.myClubs}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 border border-white/5">
        <button
          onClick={() => setTab("discover")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            tab === "discover"
              ? "bg-white/[0.08] text-white/90 shadow-sm"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          {t.dashboard.clubs.discover}
        </button>
        <button
          onClick={() => setTab("my")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            tab === "my"
              ? "bg-white/[0.08] text-white/90 shadow-sm"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          {t.dashboard.clubs.myClubs}
          {myClubs.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
              {myClubs.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters — discover tab */}
      {tab === "discover" && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.dashboard.clubs.search}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-colors"
            />
          </div>

          {/* Language filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {[{ code: "", label: t.dashboard.clubs.allLanguages }, ...languageOptions].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  language === lang.code
                    ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                    : "bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/50"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/30" />
        </div>
      ) : displayedClubs.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5">
            <Users2 className="h-8 w-8 text-white/10" />
          </div>
          <p className="mt-4 text-white/30">
            {tab === "my"
              ? t.dashboard.clubs.noMyClubs
              : t.dashboard.clubs.noClubs}
          </p>
          {tab === "my" && (
            <button
              onClick={() => setTab("discover")}
              className="mt-3 rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
            >
              {t.dashboard.clubs.discover}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {displayedClubs.map((club) => (
            <ClubCard
              key={club.id}
              id={club.id}
              name={club.name}
              description={club.description}
              languageCode={club.languageCode}
              memberCount={club._count.members}
              maxMembers={club.maxMembers}
              isMember={myClubIds.has(club.id)}
              memberAvatars={club.memberAvatars}
              activeChallenges={club._count.challenges ?? 0}
              onJoin={() => handleJoin(club.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
