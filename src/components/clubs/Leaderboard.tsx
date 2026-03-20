"use client";

import { Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface LeaderboardEntry {
  userId: string;
  user: { id: string; name: string | null; image: string | null };
  points: number;
  lessonsCompleted: number;
  exercisesDone: number;
  conversationsHeld: number;
  flashcardsReviewed: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const { t } = useI18n();

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
        <Trophy className="h-4 w-4" />
        {t.dashboard.clubs.weeklyLeaderboard}
      </h2>

      <div className="mt-4 space-y-1">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isCurrentUser
                  ? "bg-violet-500/10 border border-violet-500/20"
                  : "hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center">
                {index < 3 ? (
                  <span className={`text-lg font-bold ${medalColors[index]}`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className="text-sm font-mono text-white/25">
                    {index + 1}
                  </span>
                )}
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-white/50">
                {entry.user.image ? (
                  <img
                    src={entry.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  (entry.user.name?.[0] || "?").toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isCurrentUser ? "text-violet-300" : "text-white/70"
                  }`}
                >
                  {entry.user.name || "—"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-white/80">
                  {entry.points}
                </p>
                <p className="text-[10px] text-white/25">{t.dashboard.clubs.points}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
