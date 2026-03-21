"use client";

import { Users2, Flame, Globe } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface ClubCardProps {
  id: string;
  name: string;
  description: string;
  languageCode: string;
  memberCount: number;
  maxMembers: number;
  isMember: boolean;
  memberAvatars?: { name: string | null; image: string | null }[];
  weeklyXp?: number;
  activeChallenges?: number;
  onJoin?: () => void;
}

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

export function ClubCard({
  id,
  name,
  description,
  languageCode,
  memberCount,
  maxMembers,
  isMember,
  memberAvatars = [],
  weeklyXp = 0,
  activeChallenges = 0,
  onJoin,
}: ClubCardProps) {
  const { t } = useI18n();
  const capacityPercent = Math.round((memberCount / maxMembers) * 100);
  const displayAvatars = memberAvatars.slice(0, 4);
  const extraCount = memberCount - displayAvatars.length;

  return (
    <div className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-lg hover:shadow-violet-500/5">
      <Link href={`/clubs/${id}`} className="block">
        {/* Top row: flag + name + language badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-lg ring-1 ring-violet-500/20">
              {languageFlags[languageCode] || <Globe className="h-5 w-5 text-violet-400" />}
            </div>
            <div>
              <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                {name}
              </h3>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <Users2 className="h-3 w-3" />
                  {memberCount}/{maxMembers}
                </span>
                {activeChallenges > 0 && (
                  <span className="flex items-center gap-1 text-amber-400/60">
                    <Flame className="h-3 w-3" />
                    {activeChallenges} {t.dashboard.clubs.challenges.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {languageCode}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-3 text-sm text-white/40 line-clamp-2">{description}</p>
        )}

        {/* Capacity bar */}
        <div className="mt-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPercent >= 90
                  ? "bg-red-500/70"
                  : capacityPercent >= 70
                  ? "bg-amber-500/70"
                  : "bg-violet-500/50"
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom row: member avatars + weekly XP + join */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Stacked avatars */}
            {displayAvatars.length > 0 && (
              <div className="flex -space-x-2">
                {displayAvatars.map((member, i) => (
                  <div
                    key={i}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-medium text-white/50 ring-2 ring-[#0a0a0f]"
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      (member.name?.[0] || "?").toUpperCase()
                    )}
                  </div>
                ))}
                {extraCount > 0 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[9px] font-medium text-white/30 ring-2 ring-[#0a0a0f]">
                    +{extraCount > 99 ? "99" : extraCount}
                  </div>
                )}
              </div>
            )}

            {/* Weekly XP */}
            {weeklyXp > 0 && (
              <span className="text-[10px] text-white/25">
                {weeklyXp} XP {t.dashboard.clubs.thisWeek ?? "cette semaine"}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Join / Member badge */}
      <div className="mt-3">
        {isMember ? (
          <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            {t.dashboard.clubs.joined}
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              onJoin?.();
            }}
            className="rounded-lg bg-violet-500/20 px-4 py-1.5 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/30 hover:shadow-md hover:shadow-violet-500/10 active:scale-95"
          >
            {t.dashboard.clubs.joinClub}
          </button>
        )}
      </div>
    </div>
  );
}
