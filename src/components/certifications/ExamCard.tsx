"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Clock, Lock, CheckCircle, Trophy } from "lucide-react";

interface ExamCardProps {
  exam: {
    id: string;
    languageCode: string;
    level: string;
    title: string;
    description: string | null;
    durationMin: number;
    passScore: number;
    locked: boolean;
    attempts: number;
    bestScore: number;
    passed: boolean;
  };
  onStart: (examId: string) => void;
}

export function ExamCard({ exam, onStart }: ExamCardProps) {
  const { t } = useI18n();
  const cert = t.dashboard.certifications;

  const levelColors: Record<string, string> = {
    A1: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    A2: "bg-green-500/20 text-green-400 border-green-500/30",
    B1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    B2: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    C1: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    C2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-5 transition-all",
        exam.locked
          ? "border-white/5 bg-white/[0.02] opacity-60"
          : exam.passed
            ? "border-amber-500/20 bg-amber-500/5"
            : "border-white/10 bg-white/5 hover:border-[#a78bfa]/30 hover:bg-white/8"
      )}
    >
      {/* Level badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "rounded-md border px-2.5 py-1 text-sm font-bold",
            levelColors[exam.level] ?? "bg-white/10 text-white/60"
          )}
        >
          {exam.level}
        </span>
        {exam.passed && (
          <Trophy className="h-5 w-5 text-amber-400" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-white mb-1">
        {exam.title}
      </h3>
      {exam.description && (
        <p className="text-sm text-white/50 mb-4 line-clamp-2">
          {exam.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {exam.durationMin} {cert.minutes}
        </span>
        <span>
          {cert.passScore}: {exam.passScore}%
        </span>
      </div>

      {/* Attempts info */}
      {exam.attempts > 0 && (
        <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
          {exam.passed ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              {cert.passed} — {exam.bestScore}%
            </span>
          ) : (
            <span>
              {exam.attempts}x — {cert.score}: {exam.bestScore}%
            </span>
          )}
        </div>
      )}

      {/* Action button */}
      {exam.locked ? (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white/40 cursor-not-allowed"
        >
          <Lock className="h-4 w-4" />
          {cert.premiumRequired}
        </button>
      ) : (
        <button
          onClick={() => onStart(exam.id)}
          className="w-full rounded-lg bg-[#a78bfa] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9171e8]"
        >
          {cert.startExam}
        </button>
      )}
    </div>
  );
}
