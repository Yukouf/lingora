import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPremiumUser, levelRequiresPremium } from "@/lib/db/queries";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const { examId } = await params;

  // Get the exam
  const exam = await db.certificationExam.findUnique({
    where: { id: examId },
  });

  if (!exam || !exam.isActive) {
    return NextResponse.json({ error: "Examen introuvable" }, { status: 404 });
  }

  // Check premium gating
  if (levelRequiresPremium(exam.level)) {
    const premium = await isPremiumUser(userId);
    if (!premium) {
      return NextResponse.json(
        { error: "Abonnement Premium requis" },
        { status: 403 }
      );
    }
  }

  // Check for active (unfinished) attempts
  const activeAttempt = await db.certification.findFirst({
    where: {
      userId,
      examId,
      completedAt: null,
    },
  });

  if (activeAttempt) {
    // Return the existing active attempt
    const questions = exam.questions as Array<Record<string, unknown>>;
    // Strip correct answers from questions sent to client
    const clientQuestions = questions.map((q, i) => ({
      id: i.toString(),
      type: q.type,
      question: q.question,
      options: q.options,
      // Don't send: q.correctAnswer
    }));

    return NextResponse.json({
      data: {
        certificationId: activeAttempt.id,
        questions: clientQuestions,
        durationMin: exam.durationMin,
        startedAt: activeAttempt.startedAt,
      },
      error: null,
    });
  }

  // Create new attempt
  const certification = await db.certification.create({
    data: {
      userId,
      examId,
      score: 0,
      passed: false,
      answers: {},
      timeSpent: 0,
      startedAt: new Date(),
    },
  });

  const questions = exam.questions as Array<Record<string, unknown>>;
  const clientQuestions = questions.map((q, i) => ({
    id: i.toString(),
    type: q.type,
    question: q.question,
    options: q.options,
  }));

  return NextResponse.json({
    data: {
      certificationId: certification.id,
      questions: clientQuestions,
      durationMin: exam.durationMin,
      startedAt: certification.startedAt,
    },
    error: null,
  });
}
