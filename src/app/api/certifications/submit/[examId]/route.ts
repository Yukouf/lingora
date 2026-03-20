import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai";

interface ExamQuestion {
  type: "mcq" | "writing";
  question: string;
  options?: string[];
  correctAnswer: string;
  points?: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const { examId } = await params;

  const body = await req.json();
  const { answers, certificationId } = body as {
    answers: Record<string, string>;
    certificationId: string;
  };

  if (!answers || !certificationId) {
    return NextResponse.json(
      { error: "Données manquantes" },
      { status: 400 }
    );
  }

  // Get the certification attempt
  const certification = await db.certification.findUnique({
    where: { id: certificationId },
  });

  if (!certification || certification.userId !== userId || certification.examId !== examId) {
    return NextResponse.json(
      { error: "Tentative introuvable" },
      { status: 404 }
    );
  }

  if (certification.completedAt) {
    return NextResponse.json(
      { error: "Cet examen a déjà été soumis" },
      { status: 400 }
    );
  }

  // Get the exam
  const exam = await db.certificationExam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    return NextResponse.json({ error: "Examen introuvable" }, { status: 404 });
  }

  // Validate time
  const startedAt = new Date(certification.startedAt);
  const now = new Date();
  const timeSpentSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);
  const maxTime = exam.durationMin * 60 + 30; // 30s grace period

  if (timeSpentSeconds > maxTime) {
    // Mark as failed due to timeout
    await db.certification.update({
      where: { id: certificationId },
      data: {
        score: 0,
        passed: false,
        answers: answers,
        timeSpent: timeSpentSeconds,
        completedAt: now,
      },
    });

    return NextResponse.json({
      data: {
        score: 0,
        passed: false,
        passScore: exam.passScore,
        timeExpired: true,
      },
      error: null,
    });
  }

  // Score the answers
  const questions = exam.questions as unknown as ExamQuestion[];
  let totalPoints = 0;
  let earnedPoints = 0;
  const questionResults: Array<{
    questionIndex: number;
    correct: boolean;
    score: number;
    maxPoints: number;
    userAnswer: string;
    correctAnswer: string;
  }> = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const points = q.points ?? 1;
    totalPoints += points;
    const userAnswer = answers[i.toString()] ?? "";

    if (q.type === "mcq") {
      const isCorrect =
        userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      const questionScore = isCorrect ? points : 0;
      earnedPoints += questionScore;
      questionResults.push({
        questionIndex: i,
        correct: isCorrect,
        score: questionScore,
        maxPoints: points,
        userAnswer,
        correctAnswer: q.correctAnswer,
      });
    } else if (q.type === "writing") {
      // Use AI to evaluate writing answers
      try {
        const aiResult = await chat({
          systemPrompt: `You are a language exam grader. Evaluate the student's answer to the following question.
The expected/correct answer is provided. Score the student's answer from 0 to ${points}.
Consider: accuracy, grammar, vocabulary usage, and natural expression.
Respond with ONLY a JSON object: {"score": <number>, "correct": <boolean>}
A score above ${Math.ceil(points * 0.6)} means the answer is considered correct.`,
          messages: [
            {
              role: "user",
              content: `Question: ${q.question}\nExpected answer: ${q.correctAnswer}\nStudent's answer: ${userAnswer}`,
            },
          ],
          maxTokens: 100,
        });

        const parsed = JSON.parse(aiResult.content);
        const questionScore = Math.min(points, Math.max(0, parsed.score ?? 0));
        earnedPoints += questionScore;
        questionResults.push({
          questionIndex: i,
          correct: parsed.correct ?? questionScore > points * 0.6,
          score: questionScore,
          maxPoints: points,
          userAnswer,
          correctAnswer: q.correctAnswer,
        });
      } catch {
        // Fallback: simple string comparison
        const isCorrect =
          userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        const questionScore = isCorrect ? points : 0;
        earnedPoints += questionScore;
        questionResults.push({
          questionIndex: i,
          correct: isCorrect,
          score: questionScore,
          maxPoints: points,
          userAnswer,
          correctAnswer: q.correctAnswer,
        });
      }
    }
  }

  const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = finalScore >= exam.passScore;

  // Update the certification record
  await db.certification.update({
    where: { id: certificationId },
    data: {
      score: finalScore,
      passed,
      answers: answers,
      timeSpent: timeSpentSeconds,
      completedAt: now,
    },
  });

  return NextResponse.json({
    data: {
      certificationId,
      score: finalScore,
      passed,
      passScore: exam.passScore,
      timeSpent: timeSpentSeconds,
      questionResults,
      timeExpired: false,
    },
    error: null,
  });
}
