import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isPremiumUser } from "@/lib/db/queries";
import Link from "next/link";
import { CheckCircle2, Lock, Play, ArrowLeft, Crown } from "lucide-react";
import { ChapterIcon } from "@/components/learn/ChapterIcon";
import { PremiumContentLabel, ChapterLevelLabel, PremiumLabel, BackLabel, BackToCourseLabel, LessonsCount, ExercisesCount, StartLessonLabel } from "@/components/learn/LearnLabels";

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

  if (chapter.course.isPremium) {
    const premium = await isPremiumUser(session.user.id);
    if (!premium) {
      return (
        <div className="mx-auto max-w-2xl text-center py-20">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] mx-auto mb-4">
            <Crown className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2"><PremiumContentLabel /></h1>
          <p className="text-white/40 text-sm mb-6">
            <ChapterLevelLabel level={chapter.course.level} />
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-xl text-sm hover:bg-white/90 transition-colors"
          >
            <PremiumLabel />
          </Link>
          <Link
            href="/learn"
            className="block mt-4 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            ← <BackLabel />
          </Link>
        </div>
      );
    }
  }

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

    return { id: lesson.id, title: lesson.title, description: lesson.description, order: lesson.order, status, score, exerciseCount };
  });

  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl pb-12">
      {/* Back */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <BackToCourseLabel />
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <ChapterIcon title={chapter.title} />
        <div>
          <h1 className="text-xl font-bold text-white">{chapter.title}</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {chapter.course.language.name} — <LessonsCount completed={completedCount} total={lessons.length} />
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-white/60 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Lessons */}
      <div className="space-y-2">
        {lessons.map((lesson) => {
          const isLocked = lesson.status === "locked";
          const isCompleted = lesson.status === "completed";
          const isAvailable = lesson.status === "available";

          if (isLocked) {
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3.5 opacity-40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                  <Lock className="h-3.5 w-3.5 text-white/20" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/30">{lesson.title}</p>
                  <p className="text-[11px] text-white/15"><ExercisesCount count={lesson.exerciseCount} /></p>
                </div>
              </div>
            );
          }

          return (
            <Link key={lesson.id} href={`/learn/exercise/${lesson.id}`}>
              <div className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.04] ${
                isCompleted
                  ? "border-emerald-500/10 bg-emerald-500/[0.03]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
              }`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isCompleted
                    ? "bg-emerald-500/15"
                    : isAvailable
                    ? "bg-white/10"
                    : "bg-white/[0.04]"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Play className="h-3.5 w-3.5 text-white/70" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "text-white/60" : "text-white"}`}>
                    {lesson.title}
                  </p>
                  <p className="text-[11px] text-white/30">
                    <ExercisesCount count={lesson.exerciseCount} />
                    {lesson.score !== null && ` · ${lesson.score}%`}
                  </p>
                </div>
                {isAvailable && (
                  <span className="text-[11px] font-medium text-white/40">
                    <StartLessonLabel />
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
