import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChaptersWithProgress, levelRequiresPremium } from "@/lib/db/queries";
import Link from "next/link";
import { Lock, CheckCircle2, Play, BookOpen, Sparkles, Crown, ArrowRight } from "lucide-react";

// Color themes for chapters — alternating vibrant colors
const chapterColors = [
  { bg: "from-violet-500/20 to-purple-600/10", border: "border-violet-500/40", glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)]", dot: "bg-violet-500", dotBorder: "border-violet-500", ring: "shadow-[0_0_12px_rgba(139,92,246,0.4)]" },
  { bg: "from-blue-500/20 to-cyan-600/10", border: "border-blue-500/40", glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]", dot: "bg-blue-500", dotBorder: "border-blue-500", ring: "shadow-[0_0_12px_rgba(59,130,246,0.4)]" },
  { bg: "from-emerald-500/20 to-green-600/10", border: "border-emerald-500/40", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]", dot: "bg-emerald-500", dotBorder: "border-emerald-500", ring: "shadow-[0_0_12px_rgba(16,185,129,0.4)]" },
  { bg: "from-amber-500/20 to-yellow-600/10", border: "border-amber-500/40", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]", dot: "bg-amber-500", dotBorder: "border-amber-500", ring: "shadow-[0_0_12px_rgba(245,158,11,0.4)]" },
  { bg: "from-rose-500/20 to-pink-600/10", border: "border-rose-500/40", glow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]", dot: "bg-rose-500", dotBorder: "border-rose-500", ring: "shadow-[0_0_12px_rgba(244,63,94,0.4)]" },
  { bg: "from-cyan-500/20 to-teal-600/10", border: "border-cyan-500/40", glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]", dot: "bg-cyan-500", dotBorder: "border-cyan-500", ring: "shadow-[0_0_12px_rgba(6,182,212,0.4)]" },
  { bg: "from-orange-500/20 to-amber-600/10", border: "border-orange-500/40", glow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]", dot: "bg-orange-500", dotBorder: "border-orange-500", ring: "shadow-[0_0_12px_rgba(249,115,22,0.4)]" },
  { bg: "from-indigo-500/20 to-blue-600/10", border: "border-indigo-500/40", glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]", dot: "bg-indigo-500", dotBorder: "border-indigo-500", ring: "shadow-[0_0_12px_rgba(99,102,241,0.4)]" },
  { bg: "from-pink-500/20 to-fuchsia-600/10", border: "border-pink-500/40", glow: "shadow-[0_0_20px_rgba(236,72,153,0.2)]", dot: "bg-pink-500", dotBorder: "border-pink-500", ring: "shadow-[0_0_12px_rgba(236,72,153,0.4)]" },
  { bg: "from-teal-500/20 to-emerald-600/10", border: "border-teal-500/40", glow: "shadow-[0_0_20px_rgba(20,184,166,0.2)]", dot: "bg-teal-500", dotBorder: "border-teal-500", ring: "shadow-[0_0_12px_rgba(20,184,166,0.4)]" },
];

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { chapters, language, level, isPremium, levelCompleted, nextLevel } = await getChaptersWithProgress(session.user.id);
  const nextLevelNeedsPremium = nextLevel ? levelRequiresPremium(nextLevel) && !isPremium : false;

  // If no course found, redirect to onboarding
  if (!language || chapters.length === 0) {
    redirect("/onboarding");
  }

  const totalLessons = chapters.reduce((sum, c) => sum + c.lessonsTotal, 0);
  const completedLessons = chapters.reduce((sum, c) => sum + c.lessonsCompleted, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{language.name}</h1>
            <p className="text-sm text-[#7e8590]">Niveau {level} — Débutant</p>
          </div>
          <span className="text-3xl">{language.flag}</span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7e8590]">Progression {level}</span>
            <span className="font-medium text-white">{completedLessons}/{totalLessons} leçons</span>
          </div>
          <div className="dash-progress mt-2">
            <div className="dash-progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Parcours vertical */}
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-0 h-full w-px bg-[#42434a]" />

        {chapters.map((chapter, idx) => {
          const progress =
            chapter.lessonsTotal > 0
              ? (chapter.lessonsCompleted / chapter.lessonsTotal) * 100
              : 0;
          const color = chapterColors[idx % chapterColors.length];
          const isLocked = chapter.status === "locked";
          const isCompleted = chapter.status === "completed";
          const isInProgress = chapter.status === "in_progress";

          const cardContent = (
            <div className="relative">
              {/* Status indicator on timeline */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <div
                  className={`flex items-center justify-center rounded-full ${
                    isCompleted
                      ? `h-9 w-9 border ${color.dotBorder} ${color.dot} text-white ${color.ring}`
                      : isInProgress
                      ? `h-9 w-9 border-2 ${color.dotBorder} bg-[#0d1117] text-base ${color.ring}`
                      : "h-9 w-9 border border-[#2d3139] bg-[#161b22]"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-[#4a4f57]" />
                  ) : (
                    <span className="text-sm">{chapter.icon}</span>
                  )}
                </div>
              </div>

              {/* Chapter card */}
              <div
                className={`ml-14 p-4 rounded-2xl border transition-all duration-300 ${
                  isLocked
                    ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                    : `bg-gradient-to-br ${color.bg} ${color.border} ${color.glow} hover:scale-[1.02]`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${isLocked ? "text-white/40" : "text-white"}`}>
                      {chapter.icon} {chapter.title}
                    </h3>
                    <p className={`text-sm ${isLocked ? "text-white/20" : "text-white/50"}`}>
                      {chapter.lessonsCompleted}/{chapter.lessonsTotal} leçons
                    </p>
                  </div>
                  {isInProgress && (
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${color.dot} text-white`}>
                      <Play className="h-4 w-4" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((star) => (
                        <span key={star} className="text-yellow-400 text-sm">⭐</span>
                      ))}
                    </div>
                  )}
                </div>
                {!isLocked && (
                  <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.dot} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );

          return isLocked ? (
            <div key={chapter.id}>{cardContent}</div>
          ) : (
            <Link key={chapter.id} href={`/learn/${chapter.id}`}>
              {cardContent}
            </Link>
          );
        })}

        {/* Level completed + Next level paywall */}
        {levelCompleted && nextLevel && (
          <div className="relative mt-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-yellow-500 bg-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                <Crown className="h-4 w-4 text-yellow-400" />
              </div>
            </div>

            {nextLevelNeedsPremium ? (
              /* Paywall card */
              <div className="ml-14 p-6 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-600/5">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-bold text-white text-lg">Niveau {nextLevel} débloqué !</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Bravo, tu as complété le niveau {level} ! 🎉 Pour continuer vers le niveau {nextLevel} et au-delà, passe en Premium.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/settings"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-semibold rounded-xl transition-all"
                  >
                    <Crown className="h-4 w-4" />
                    Passer Premium — 10€/mois
                  </Link>
                </div>
                <p className="mt-3 text-xs text-white/30">
                  Accès à tous les niveaux (B1→C2), conversations IA illimitées, toutes les langues
                </p>
              </div>
            ) : (
              /* Next level available (premium user or free level) */
              <div className="ml-14 p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-600/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">Niveau {nextLevel} disponible !</h3>
                    <p className="text-sm text-white/50 mt-1">
                      Tu as complété le niveau {level}. Continue ton parcours !
                    </p>
                  </div>
                  <Link
                    href="/api/learn/level-up"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors"
                  >
                    Continuer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
