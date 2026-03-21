"use client";

import {
  BookOpen,
  MessageSquare,
  Layers,
  Dumbbell,
  UserPlus,
  Trophy,
  Flame,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ActivityItem {
  id: string;
  type: "lesson" | "exercise" | "conversation" | "flashcard" | "join" | "challenge_complete";
  userName: string;
  userImage: string | null;
  detail: string;
  timestamp: string;
}

interface ClubActivityProps {
  activities: ActivityItem[];
}

const activityIcons = {
  lesson: BookOpen,
  exercise: Dumbbell,
  conversation: MessageSquare,
  flashcard: Layers,
  join: UserPlus,
  challenge_complete: Trophy,
};

const activityColors = {
  lesson: "text-emerald-400 bg-emerald-500/10",
  exercise: "text-blue-400 bg-blue-500/10",
  conversation: "text-purple-400 bg-purple-500/10",
  flashcard: "text-pink-400 bg-pink-500/10",
  join: "text-violet-400 bg-violet-500/10",
  challenge_complete: "text-yellow-400 bg-yellow-500/10",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "maintenant";
  if (minutes < 60) return `il y a ${minutes}min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function ClubActivity({ activities }: ClubActivityProps) {
  const { t } = useI18n();

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center">
        <Flame className="mx-auto h-8 w-8 text-white/10" />
        <p className="mt-2 text-sm text-white/25">
          {t.dashboard.clubs.noActivity ?? "Aucune activite recente"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
        <Flame className="h-4 w-4 text-amber-500/60" />
        {t.dashboard.clubs.recentActivity ?? "Activite recente"}
      </h2>

      <div className="mt-4 space-y-0.5">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
            >
              {/* User avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-medium text-white/50 shrink-0">
                {activity.userImage ? (
                  <img
                    src={activity.userImage}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  (activity.userName?.[0] || "?").toUpperCase()
                )}
              </div>

              {/* Activity icon */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md ${colorClass} shrink-0`}
              >
                <Icon className="h-3 w-3" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50">
                  <span className="font-medium text-white/70">{activity.userName}</span>
                  {" "}
                  {activity.detail}
                </p>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-white/20 shrink-0">
                {timeAgo(activity.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
