import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveExerciseProgress, isPremiumUser } from "@/lib/db/queries";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { exerciseId, lessonId, score, timeSpent } = await req.json();

    if (!exerciseId || !lessonId || score === undefined) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Check if exercise belongs to premium course
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
      include: { lesson: { include: { chapter: { include: { course: { select: { isPremium: true } } } } } } },
    });

    if (exercise?.lesson.chapter.course.isPremium) {
      const premium = await isPremiumUser(session.user.id);
      if (!premium) {
        return NextResponse.json(
          { error: "Contenu premium — abonnement requis" },
          { status: 403 }
        );
      }
    }

    await saveExerciseProgress(
      session.user.id,
      exerciseId,
      lessonId,
      score,
      timeSpent ?? 0
    );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
