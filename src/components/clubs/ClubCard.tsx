"use client";

import { Users2 } from "lucide-react";
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
  onJoin?: () => void;
}

const languageFlags: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
  zh: "🇨🇳",
  ru: "🇷🇺",
  ko: "🇰🇷",
  ar: "🇸🇦",
  pt: "🇵🇹",
  it: "🇮🇹",
};

export function ClubCard({
  id,
  name,
  description,
  languageCode,
  memberCount,
  maxMembers,
  isMember,
  onJoin,
}: ClubCardProps) {
  const { t } = useI18n();

  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
      <Link href={`/clubs/${id}`} className="block">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-lg">
              {languageFlags[languageCode] || "🌐"}
            </div>
            <div>
              <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                {name}
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/30">
                <Users2 className="h-3 w-3" />
                <span>
                  {memberCount}/{maxMembers}
                </span>
              </div>
            </div>
          </div>
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
            {languageCode}
          </span>
        </div>
        {description && (
          <p className="mt-3 text-sm text-white/40 line-clamp-2">{description}</p>
        )}
      </Link>
      <div className="mt-4">
        {isMember ? (
          <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            {t.dashboard.clubs.joined}
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              onJoin?.();
            }}
            className="rounded-lg bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
          >
            {t.dashboard.clubs.joinClub}
          </button>
        )}
      </div>
    </div>
  );
}
