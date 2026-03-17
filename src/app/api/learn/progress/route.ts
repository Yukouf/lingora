import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { saveExerciseProgress, isPremiumUser } from "@/lib/db/queries";
import { db } from "@/lib/db";

const progressSchema = z.object({
  exerciseId: z.string().min(1),
  lessonId: z.string().min(1),
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { exerciseId, lessonId, score, timeSpent } = parsed.data;

    // Verify exercise exists and belongs to the specified lesson
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
      include: { lesson: { include: { chapter: { include: { course: { select: { isPremium: true } } } } } } },
    });

    if (!exercise || exercise.lessonId !== lessonId) {
      return NextResponse.json(
        { error: "Exercice introuvable" },
        { status: 404 }
      );
    }

    if (exercise.lesson.chapter.course.isPremium) {
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
