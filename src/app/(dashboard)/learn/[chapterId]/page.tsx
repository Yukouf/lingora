import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isPremiumUser } from "@/lib/db/queries";
import Link from "next/link";
import { CheckCircle2, Lock, Play, ArrowLeft, BookOpen, Crown } from "lucide-react";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: {
        include: { language: true },
      },
      lessons: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          exercises: {
            where: { isActive: true },
            select: { id: true },
          },
          userProgress: {
            where: { userId: session.user.id },
          },
        },
      },
    },
  });

  if (!chapter) redirect("/learn");

  // Paywall: check if course is premium and user isn't
  if (chapter.course.isPremium) {
    const premium = await isPremiumUser(session.user.id);
    if (!premium) {
      return (
        <div className="mx-auto max-w-2xl text-center py-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 mx-auto mb-4">
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Contenu Premium</h1>
          <p className="text-[#7e8590] mb-6">
            Ce chapitre fait partie du niveau {chapter.course.level} qui nécessite un abonnement Premium.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-semibold rounded-xl transition-all"
          >
            <Crown className="h-4 w-4" />
            Passer Premium — 10€/mois
          </Link>
          <Link
            href="/learn"
            className="block mt-4 text-sm text-[#7e8590] hover:text-white transition-colors"
          >
            ← Retour au parcours
          </Link>
        </div>
      );
    }
  }

  // Determine lesson statuses
  let previousCompleted = true;
  const lessons = chapter.lessons.map((lesson) => {
    const completed = lesson.userProgress.some((p) => p.completed);
    const score = lesson.userProgress[0]?.score ?? null;
    const exerciseCount = lesson.exercises.length;

    let status: "locked" | "available" | "completed";
    if (completed) {
      status = "completed";
    } else if (previousCompleted) {
      status = "available";
    } else {
      status = "locked";
    }

    previousCompleted = completed;

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      status,
      score,
      exerciseCount,
    };
  });

  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  // Color themes for lesson cards based on order
  const lessonColors = [
    { bg: "from-violet-500/20 to-purple-600/10", border: "border-violet-500/40", dot: "bg-violet-500", text: "text-violet-300" },
    { bg: "from-blue-500/20 to-cyan-600/10", border: "border-blue-500/40", dot: "bg-blue-500", text: "text-blue-300" },
    { bg: "from-emerald-500/20 to-green-600/10", border: "border-emerald-500/40", dot: "bg-emerald-500", text: "text-emerald-300" },
    { bg: "from-amber-500/20 to-yellow-600/10", border: "border-amber-500/40", dot: "bg-amber-500", text: "text-amber-300" },
    { bg: "from-rose-500/20 to-pink-600/10", border: "border-rose-500/40", dot: "bg-rose-500", text: "text-rose-300" },
    { bg: "from-cyan-500/20 to-teal-600/10", border: "border-cyan-500/40", dot: "bg-cyan-500", text: "text-cyan-300" },
    { bg: "from-orange-500/20 to-amber-600/10", border: "border-orange-500/40", dot: "bg-orange-500", text: "text-orange-300" },
    { bg: "from-indigo-500/20 to-blue-600/10", border: "border-indigo-500/40", dot: "bg-indigo-500", text: "text-indigo-300" },
    { bg: "from-pink-500/20 to-fuchsia-600/10", border: "border-pink-500/40", dot: "bg-pink-500", text: "text-pink-300" },
    { bg: "from-teal-500/20 to-emerald-600/10", border: "border-teal-500/40", dot: "bg-teal-500", text: "text-teal-300" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back + Header */}
      <div className="mb-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-[#7e8590] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au parcours
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5353ff]/20 to-[#bd89ff]/10 border border-[#5353ff]/30 text-2xl">
            {chapter.icon || "📚"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{chapter.title}</h1>
            <p className="text-sm text-[#7e8590]">
              {chapter.course.language.flag} {chapter.course.language.name} — {completedCount}/{lessons.length} leçons
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="dash-progress">
            <div className="dash-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Lessons grid */}
      <div className="space-y-3">
        {lessons.map((lesson, i) => {
          const color = lessonColors[i % lessonColors.length];
          const isLocked = lesson.status === "locked";
          const isCompleted = lesson.status === "completed";

          return (
            <div key={lesson.id}>
              {isLocked ? (
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5">
                      <Lock className="h-4 w-4 text-[#4a4f57]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white/40">{lesson.title}</h3>
                      <p className="text-xs text-white/20">{lesson.exerciseCount} exercices</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={`/learn/exercise/${lesson.id}`}>
                  <div
                    className={`p-4 rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${color.border} ${color.bg} ${
                      isCompleted ? "opacity-80" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        isCompleted ? "bg-emerald-500" : color.dot
                      } text-white`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{lesson.title}</h3>
                        <p className="text-xs text-white/50">
                          {lesson.exerciseCount} exercices
                          {lesson.score !== null && ` · Score: ${lesson.score}%`}
                        </p>
                      </div>
                      {!isCompleted && (
                        <div className={`text-xs font-medium ${color.text}`}>
                          Commencer →
                        </div>
                      )}
                      {isCompleted && lesson.score !== null && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                lesson.score! >= star * 33
                                  ? "text-yellow-400"
                                  : "text-white/10"
                              }`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
