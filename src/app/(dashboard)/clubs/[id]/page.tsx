"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users2,
  Crown,
  Shield,
  Loader2,
  Plus,
  LogOut,
  Trophy,
  Flame,
  Settings,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { Leaderboard } from "@/components/clubs/Leaderboard";
import { ChallengeCard } from "@/components/clubs/ChallengeCard";
import { CreateChallengeForm } from "@/components/clubs/CreateChallengeForm";
import { ClubActivity } from "@/components/clubs/ClubActivity";
import { ClubStats } from "@/components/clubs/ClubStats";

interface ClubMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface ChallengeParticipant {
  userId: string;
  progress: number;
}

interface ClubChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  startsAt: string;
  endsAt: string;
  _count: { participants: number };
  participants: ChallengeParticipant[];
}

interface ClubDetail {
  id: string;
  name: string;
  description: string;
  languageCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  members: ClubMember[];
  challenges: ClubChallenge[];
  _count: { members: number };
}

interface LeaderboardEntry {
  userId: string;
  user: { id: string; name: string | null; image: string | null };
  points: number;
  lessonsCompleted: number;
  exercisesDone: number;
  conversationsHeld: number;
  flashcardsReviewed: number;
}

interface ActivityItem {
  id: string;
  type: "lesson" | "exercise" | "conversation" | "flashcard" | "join" | "challenge_complete";
  userName: string;
  userImage: string | null;
  detail: string;
  timestamp: string;
}

type TabId = "overview" | "leaderboard" | "challenges" | "members";

const languageFlags: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7",
  es: "\uD83C\uDDEA\uD83C\uDDF8",
  fr: "\uD83C\uDDEB\uD83C\uDDF7",
  de: "\uD83C\uDDE9\uD83C\uDDEA",
  ja: "\uD83C\uDDEF\uD83C\uDDF5",
  zh: "\uD83C\uDDE8\uD83C\uDDF3",
  ru: "\uD83C\uDDF7\uD83C\uDDFA",
  ko: "\uD83C\uDDF0\uD83C\uDDF7",
  ar: "\uD83C\uDDF8\uD83C\uDDE6",
  pt: "\uD83C\uDDF5\uD83C\uDDF9",
  it: "\uD83C\uDDEE\uD83C\uDDF9",
};

export default function ClubDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const clubId = params.id as string;

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  const currentUserId = session?.user?.id;
  const myMembership = club?.members.find((m) => m.userId === currentUserId);
  const isOwnerOrAdmin =
    myMembership?.role === "OWNER" || myMembership?.role === "ADMIN";
  const isMember = !!myMembership;

  const fetchClub = useCallback(async () => {
    const res = await fetch(`/api/clubs/${clubId}`);
    const json = await res.json();
    if (json.data) setClub(json.data);
  }, [clubId]);

  const fetchLeaderboard = useCallback(async () => {
    const res = await fetch(`/api/clubs/${clubId}/leaderboard`);
    const json = await res.json();
    if (json.data) setLeaderboard(json.data);
  }, [clubId]);

  const fetchActivity = useCallback(async () => {
    const res = await fetch(`/api/clubs/${clubId}/activity`);
    const json = await res.json();
    if (json.data) setActivities(json.data);
  }, [clubId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchClub(), fetchLeaderboard(), fetchActivity()]).finally(
      () => setLoading(false)
    );
  }, [fetchClub, fetchLeaderboard, fetchActivity]);

  async function handleJoin() {
    const res = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
    if (res.ok) {
      await Promise.all([fetchClub(), fetchLeaderboard()]);
    }
  }

  async function handleLeave() {
    const res = await fetch(`/api/clubs/${clubId}/leave`, { method: "POST" });
    if (res.ok) {
      router.push("/clubs");
    }
  }

  async function handleJoinChallenge(challengeId: string) {
    const res = await fetch(
      `/api/clubs/${clubId}/challenges/${challengeId}/join`,
      { method: "POST" }
    );
    if (res.ok) {
      await fetchClub();
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5">
          <Users2 className="h-8 w-8 text-white/10" />
        </div>
        <p className="mt-4 text-white/40">{t.dashboard.clubs.noClubs}</p>
        <Link
          href="/clubs"
          className="mt-3 rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
        >
          {t.dashboard.common.back}
        </Link>
      </div>
    );
  }

  const totalWeeklyXp = leaderboard.reduce((sum, e) => sum + e.points, 0);
  const totalLessonsThisWeek = leaderboard.reduce(
    (sum, e) => sum + e.lessonsCompleted,
    0
  );

  const roleIcon = (role: string) => {
    if (role === "OWNER") return <Crown className="h-3 w-3 text-yellow-400" />;
    if (role === "ADMIN") return <Shield className="h-3 w-3 text-blue-400" />;
    return null;
  };

  const roleLabel = (role: string) => {
    if (role === "OWNER") return t.dashboard.clubs.owner;
    if (role === "ADMIN") return t.dashboard.clubs.admin;
    return t.dashboard.clubs.member;
  };

  const tabs: { id: TabId; label: string; icon: typeof Trophy }[] = [
    { id: "overview", label: t.dashboard.clubs.overviewTab ?? "Apercu", icon: Globe },
    {
      id: "leaderboard",
      label: t.dashboard.clubs.leaderboard,
      icon: Trophy,
    },
    { id: "challenges", label: t.dashboard.clubs.challenges, icon: Flame },
    { id: "members", label: t.dashboard.clubs.members, icon: Users2 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back button */}
      <Link
        href="/clubs"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.dashboard.common.back}
      </Link>

      {/* Club header card */}
      <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Club avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl ring-1 ring-violet-500/20 shrink-0">
              {languageFlags[club.languageCode] || (
                <Globe className="h-6 w-6 text-violet-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white/90">{club.name}</h1>
              {club.description && (
                <p className="mt-1 text-sm text-white/40 max-w-lg">
                  {club.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <Users2 className="h-3 w-3" />
                  {club._count.members}/{club.maxMembers}{" "}
                  {t.dashboard.clubs.members.toLowerCase()}
                </span>
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  {club.languageCode}
                </span>
                {!club.isPublic && (
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    {t.dashboard.clubs.private}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isMember ? (
              <button
                onClick={handleJoin}
                className="rounded-xl bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/30 hover:shadow-md hover:shadow-violet-500/10 active:scale-95"
              >
                {t.dashboard.clubs.joinClub}
              </button>
            ) : (
              <>
                {isOwnerOrAdmin && (
                  <button className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.08]">
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                )}
                {myMembership?.role !== "OWNER" && (
                  <button
                    onClick={handleLeave}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t.dashboard.clubs.leaveClub}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-5">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-violet-500/40 transition-all duration-700"
              style={{
                width: `${Math.round(
                  (club._count.members / club.maxMembers) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <ClubStats
        memberCount={club._count.members}
        maxMembers={club.maxMembers}
        totalWeeklyXp={totalWeeklyXp}
        activeChallenges={club.challenges.length}
        totalLessonsThisWeek={totalLessonsThisWeek}
      />

      {/* Tab navigation */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-white/[0.03] p-1 border border-white/5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white/[0.08] text-white/90 shadow-sm"
                  : "text-white/35 hover:text-white/55"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top 3 leaderboard preview + activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Leaderboard preview */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                  <Trophy className="h-4 w-4 text-yellow-500/70" />
                  {t.dashboard.clubs.weeklyLeaderboard}
                </h2>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className="text-[10px] text-violet-400/60 hover:text-violet-300 transition-colors"
                >
                  {t.dashboard.clubs.viewAll ?? "Voir tout"}
                </button>
              </div>
              {leaderboard.length > 0 ? (
                <div className="space-y-1">
                  {leaderboard.slice(0, 5).map((entry, index) => {
                    const isCurrentUser = entry.userId === currentUserId;
                    const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                          isCurrentUser
                            ? "bg-violet-500/10 border border-violet-500/20"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <span className="w-5 text-center">
                          {index < 3 ? (
                            <span className="text-sm">{medals[index]}</span>
                          ) : (
                            <span className="text-xs font-mono text-white/20">
                              {index + 1}
                            </span>
                          )}
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-medium text-white/50">
                          {entry.user.image ? (
                            <img
                              src={entry.user.image}
                              alt=""
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            (entry.user.name?.[0] || "?").toUpperCase()
                          )}
                        </div>
                        <span
                          className={`flex-1 text-xs font-medium truncate ${
                            isCurrentUser ? "text-violet-300" : "text-white/60"
                          }`}
                        >
                          {entry.user.name || "\u2014"}
                        </span>
                        <span className="text-xs font-bold text-white/70">
                          {entry.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-white/20 text-center py-6">
                  {t.dashboard.clubs.noActivity ?? "Aucune activite cette semaine"}
                </p>
              )}
            </div>

            {/* Activity feed */}
            <ClubActivity activities={activities.slice(0, 8)} />
          </div>

          {/* Active challenges preview */}
          {club.challenges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                  <Flame className="h-4 w-4 text-amber-500/60" />
                  {t.dashboard.clubs.activeChallenges ?? "Defis actifs"}
                </h2>
                <button
                  onClick={() => setActiveTab("challenges")}
                  className="text-[10px] text-violet-400/60 hover:text-violet-300 transition-colors"
                >
                  {t.dashboard.clubs.viewAll ?? "Voir tout"}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {club.challenges.slice(0, 2).map((challenge) => {
                  const myProgress =
                    challenge.participants.find(
                      (p) => p.userId === currentUserId
                    )?.progress || 0;
                  const isParticipating = challenge.participants.some(
                    (p) => p.userId === currentUserId
                  );

                  return (
                    <ChallengeCard
                      key={challenge.id}
                      id={challenge.id}
                      clubId={clubId}
                      title={challenge.title}
                      description={challenge.description}
                      type={challenge.type}
                      target={challenge.target}
                      progress={myProgress}
                      participantsCount={challenge._count.participants}
                      startsAt={challenge.startsAt}
                      endsAt={challenge.endsAt}
                      isParticipating={isParticipating}
                      isMember={isMember}
                      onJoinChallenge={() => handleJoinChallenge(challenge.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <Leaderboard entries={leaderboard} currentUserId={currentUserId} />
      )}

      {activeTab === "challenges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              {t.dashboard.clubs.challenges}
            </h2>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setShowChallengeForm(!showChallengeForm)}
                className="flex items-center gap-1.5 rounded-lg bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/30 active:scale-95"
              >
                <Plus className="h-3 w-3" />
                {t.dashboard.clubs.createChallenge}
              </button>
            )}
          </div>

          {showChallengeForm && (
            <CreateChallengeForm
              clubId={clubId}
              onCreated={() => {
                setShowChallengeForm(false);
                fetchClub();
              }}
              onCancel={() => setShowChallengeForm(false)}
            />
          )}

          {club.challenges.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-10 text-center">
              <Flame className="mx-auto h-10 w-10 text-white/10" />
              <p className="mt-3 text-sm text-white/25">
                {t.dashboard.clubs.noChallenges}
              </p>
              {isOwnerOrAdmin && (
                <button
                  onClick={() => setShowChallengeForm(true)}
                  className="mt-4 rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
                >
                  {t.dashboard.clubs.createChallenge}
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {club.challenges.map((challenge) => {
                const myProgress =
                  challenge.participants.find(
                    (p) => p.userId === currentUserId
                  )?.progress || 0;
                const isParticipating = challenge.participants.some(
                  (p) => p.userId === currentUserId
                );

                return (
                  <ChallengeCard
                    key={challenge.id}
                    id={challenge.id}
                    clubId={clubId}
                    title={challenge.title}
                    description={challenge.description}
                    type={challenge.type}
                    target={challenge.target}
                    progress={myProgress}
                    participantsCount={challenge._count.participants}
                    startsAt={challenge.startsAt}
                    endsAt={challenge.endsAt}
                    isParticipating={isParticipating}
                    isMember={isMember}
                    onJoinChallenge={() => handleJoinChallenge(challenge.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
            {t.dashboard.clubs.members} ({club._count.members})
          </h2>
          <div className="space-y-0.5">
            {club.members.map((member) => {
              const leaderboardEntry = leaderboard.find(
                (e) => e.userId === member.userId
              );
              const isCurrentUser = member.userId === currentUserId;

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    isCurrentUser
                      ? "bg-violet-500/5 border border-violet-500/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-white/50 shrink-0">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      (member.user.name?.[0] || "?").toUpperCase()
                    )}
                  </div>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrentUser ? "text-violet-300" : "text-white/70"
                      }`}
                    >
                      {member.user.name || "\u2014"}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-[10px] text-white/20">(toi)</span>
                      )}
                    </p>
                    <p className="text-[10px] text-white/20">
                      {t.dashboard.clubs.joinedOn ?? "Rejoint le"}{" "}
                      {new Date(member.joinedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Weekly XP */}
                  {leaderboardEntry && leaderboardEntry.points > 0 && (
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-white/60">
                        {leaderboardEntry.points}
                      </p>
                      <p className="text-[9px] text-white/20">
                        XP {t.dashboard.clubs.thisWeek ?? "cette semaine"}
                      </p>
                    </div>
                  )}

                  {/* Role badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        member.role === "OWNER"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : member.role === "ADMIN"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-white/[0.04] text-white/30"
                      }`}
                    >
                      {roleIcon(member.role)}
                      {roleLabel(member.role)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
