"use client";

import { Trophy, BookOpen, MessageSquare, Layers, Dumbbell } from "lucide-react";
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

const podiumGradients = [
  "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
  "from-gray-400/15 to-gray-400/5 border-gray-400/15",
  "from-amber-700/15 to-amber-700/5 border-amber-700/15",
];

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const { t } = useI18n();

  if (entries.length === 0) return null;

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
        <Trophy className="h-4 w-4 text-yellow-500/70" />
        {t.dashboard.clubs.weeklyLeaderboard}
      </h2>

      {/* Podium — top 3 */}
      {topThree.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {/* Reorder: 2nd, 1st, 3rd for visual podium */}
          {[topThree[1], topThree[0], topThree[2]].map((entry, displayIndex) => {
            if (!entry) return <div key={displayIndex} />;
            const actualRank = displayIndex === 0 ? 1 : displayIndex === 1 ? 0 : 2;
            const isFirst = actualRank === 0;
            const isCurrentUser = entry.userId === currentUserId;
            const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

            return (
              <div
                key={entry.userId}
                className={`flex flex-col items-center rounded-xl border bg-gradient-to-b p-3 transition-colors ${
                  podiumGradients[actualRank]
                } ${isFirst ? "pt-2" : "mt-4"} ${
                  isCurrentUser ? "ring-1 ring-violet-500/30" : ""
                }`}
              >
                <span className="text-lg">{medals[actualRank]}</span>
                <div
                  className={`mt-1 flex items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-white/50 ${
                    isFirst ? "h-12 w-12" : "h-10 w-10"
                  }`}
                >
                  {entry.user.image ? (
                    <img
                      src={entry.user.image}
                      alt=""
                      className={`rounded-full object-cover ${
                        isFirst ? "h-12 w-12" : "h-10 w-10"
                      }`}
                    />
                  ) : (
                    <span className={isFirst ? "text-base" : "text-xs"}>
                      {(entry.user.name?.[0] || "?").toUpperCase()}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1.5 text-xs font-medium truncate max-w-full ${
                    isCurrentUser ? "text-violet-300" : "text-white/70"
                  }`}
                >
                  {entry.user.name || "\u2014"}
                </p>
                <p className="mt-0.5 text-sm font-bold text-white/80">
                  {entry.points}
                </p>
                <p className="text-[9px] text-white/25">{t.dashboard.clubs.points}</p>

                {/* Mini stat icons */}
                <div className="mt-2 flex items-center gap-1.5">
                  {entry.lessonsCompleted > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px] text-emerald-400/50" title="Lessons">
                      <BookOpen className="h-2.5 w-2.5" />
                      {entry.lessonsCompleted}
                    </div>
                  )}
                  {entry.exercisesDone > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px] text-blue-400/50" title="Exercises">
                      <Dumbbell className="h-2.5 w-2.5" />
                      {entry.exercisesDone}
                    </div>
                  )}
                  {entry.conversationsHeld > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px] text-purple-400/50" title="Conversations">
                      <MessageSquare className="h-2.5 w-2.5" />
                      {entry.conversationsHeld}
                    </div>
                  )}
                  {entry.flashcardsReviewed > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px] text-pink-400/50" title="Flashcards">
                      <Layers className="h-2.5 w-2.5" />
                      {entry.flashcardsReviewed}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <div className="mt-4 space-y-1">
          {rest.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const rank = index + 4;
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
                  <span className="text-sm font-mono text-white/25">{rank}</span>
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
                    {entry.user.name || "\u2014"}
                  </p>
                </div>

                {/* Mini stats */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/20">
                  {entry.lessonsCompleted > 0 && (
                    <span className="flex items-center gap-0.5">
                      <BookOpen className="h-3 w-3" />
                      {entry.lessonsCompleted}
                    </span>
                  )}
                  {entry.exercisesDone > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Dumbbell className="h-3 w-3" />
                      {entry.exercisesDone}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-white/80">{entry.points}</p>
                  <p className="text-[10px] text-white/25">{t.dashboard.clubs.points}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
