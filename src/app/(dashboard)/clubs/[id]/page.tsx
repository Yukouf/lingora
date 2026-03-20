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
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { Leaderboard } from "@/components/clubs/Leaderboard";
import { ChallengeCard } from "@/components/clubs/ChallengeCard";
import { CreateChallengeForm } from "@/components/clubs/CreateChallengeForm";

interface ClubMember {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; image: string | null };
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
  participants: { userId: string; progress: number }[];
}

interface ClubDetail {
  id: string;
  name: string;
  description: string;
  languageCode: string;
  ownerId: string;
  maxMembers: number;
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

export default function ClubDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const clubId = params.id as string;

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchClub(), fetchLeaderboard()]).finally(() =>
      setLoading(false)
    );
  }, [fetchClub, fetchLeaderboard]);

  async function handleJoin() {
    const res = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
    if (res.ok) {
      await fetchClub();
      await fetchLeaderboard();
    }
  }

  async function handleLeave() {
    const res = await fetch(`/api/clubs/${clubId}/leave`, { method: "POST" });
    if (res.ok) {
      router.push("/clubs");
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
        <p className="text-white/40">{t.dashboard.clubs.noClubs}</p>
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back button */}
      <Link
        href="/clubs"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.dashboard.common.back}
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white/90">{club.name}</h1>
            {club.description && (
              <p className="mt-1 text-sm text-white/40">{club.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <Users2 className="h-3 w-3" />
                {club._count.members}/{club.maxMembers} {t.dashboard.clubs.members.toLowerCase()}
              </span>
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                {club.languageCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMember ? (
              <button
                onClick={handleJoin}
                className="rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
              >
                {t.dashboard.clubs.joinClub}
              </button>
            ) : myMembership?.role !== "OWNER" ? (
              <button
                onClick={handleLeave}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t.dashboard.clubs.leaveClub}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard entries={leaderboard} currentUserId={currentUserId} />

      {/* Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
            {t.dashboard.clubs.challenges}
          </h2>
          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowChallengeForm(!showChallengeForm)}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.08]"
            >
              <Plus className="h-3 w-3" />
              {t.dashboard.clubs.createChallenge}
            </button>
          )}
        </div>

        {showChallengeForm && (
          <div className="mb-4">
            <CreateChallengeForm
              clubId={clubId}
              onCreated={() => {
                setShowChallengeForm(false);
                fetchClub();
              }}
              onCancel={() => setShowChallengeForm(false)}
            />
          </div>
        )}

        {club.challenges.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-white/25">{t.dashboard.clubs.noChallenges}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {club.challenges.map((challenge) => {
              const myProgress =
                challenge.participants.find(
                  (p) => p.userId === currentUserId
                )?.progress || 0;

              return (
                <ChallengeCard
                  key={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  type={challenge.type}
                  target={challenge.target}
                  progress={myProgress}
                  participantsCount={challenge._count.participants}
                  startsAt={challenge.startsAt}
                  endsAt={challenge.endsAt}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
          {t.dashboard.clubs.members} ({club._count.members})
        </h2>
        <div className="space-y-1">
          {club.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-white/50">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  (member.user.name?.[0] || "?").toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/70 truncate">
                  {member.user.name || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                {roleIcon(member.role)}
                <span>{roleLabel(member.role)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
