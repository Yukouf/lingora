import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLessonExercises, isPremiumUser } from "@/lib/db/queries";
import { db } from "@/lib/db";
import ExerciseSession from "./ExerciseSession";
import Link from "next/link";
import { Crown } from "lucide-react";
import { PremiumContentLabel, ChapterLevelLabel, PremiumLabel, BackLabel } from "@/components/learn/LearnLabels";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { lessonId } = await params;

  // Check if lesson's course is premium
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: { select: { isPremium: true, level: true } } } } },
  });

  if (!lesson) redirect("/learn");

  if (lesson.chapter.course.isPremium) {
    const premium = await isPremiumUser(session.user.id);
    if (!premium) {
      return (
        <div className="mx-auto max-w-2xl text-center py-20">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] mx-auto mb-4">
            <Crown className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2"><PremiumContentLabel /></h1>
          <p className="text-white/40 text-sm mb-6">
            <ChapterLevelLabel level={lesson.chapter.course.level} />
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

  const data = await getLessonExercises(lessonId, session.user.id);
  if (!data) redirect("/learn");

  return (
    <ExerciseSession
      lesson={data.lesson}
      chapter={data.chapter}
      language={data.language}
      exercises={data.exercises}
      lessonId={lessonId}
    />
  );
}
