import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLessonExercises, isPremiumUser } from "@/lib/db/queries";
import { db } from "@/lib/db";
import ExerciseSession from "./ExerciseSession";
import Link from "next/link";
import { Crown } from "lucide-react";

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
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 mx-auto mb-4">
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Contenu Premium</h1>
          <p className="text-[#7e8590] mb-6">
            Cette leçon fait partie du niveau {lesson.chapter.course.level} qui nécessite un abonnement Premium.
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
