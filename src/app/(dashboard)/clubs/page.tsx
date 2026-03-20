"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ClubCard } from "@/components/clubs/ClubCard";

interface Club {
  id: string;
  name: string;
  description: string;
  languageCode: string;
  maxMembers: number;
  _count: { members: number };
  owner: { id: string; name: string | null };
  myRole?: string;
}

export default function ClubsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"discover" | "my">("discover");
  const [search, setSearch] = useState("");
  const [publicClubs, setPublicClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());

  const fetchMyClubs = useCallback(async () => {
    const res = await fetch("/api/clubs/my-clubs");
    const json = await res.json();
    if (json.data) {
      setMyClubs(json.data);
      setMyClubIds(new Set(json.data.map((c: Club) => c.id)));
    }
  }, []);

  const fetchPublicClubs = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/clubs?${params.toString()}`);
    const json = await res.json();
    if (json.data) setPublicClubs(json.data);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPublicClubs(), fetchMyClubs()]).finally(() =>
      setLoading(false)
    );
  }, [fetchPublicClubs, fetchMyClubs]);

  async function handleJoin(clubId: string) {
    const res = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
    if (res.ok) {
      await Promise.all([fetchPublicClubs(), fetchMyClubs()]);
    }
  }

  const displayedClubs = tab === "discover" ? publicClubs : myClubs;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">
            {t.dashboard.clubs.title}
          </h1>
        </div>
        <Link
          href="/clubs/create"
          className="flex items-center gap-2 rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
        >
          <Plus className="h-4 w-4" />
          {t.dashboard.clubs.createClub}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 border border-white/5">
        <button
          onClick={() => setTab("discover")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "discover"
              ? "bg-white/[0.08] text-white/90"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          {t.dashboard.clubs.discover}
        </button>
        <button
          onClick={() => setTab("my")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "my"
              ? "bg-white/[0.08] text-white/90"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          {t.dashboard.clubs.myClubs}
        </button>
      </div>

      {/* Search */}
      {tab === "discover" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.dashboard.clubs.search}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/30" />
        </div>
      ) : displayedClubs.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-white/30">{t.dashboard.clubs.noClubs}</p>
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
              onJoin={() => handleJoin(club.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
