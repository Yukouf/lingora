import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai";
import { checkAiRouteRateLimit } from "@/lib/rate-limit";

interface McqQuestion {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: number; // index into options array
  points?: number;
}

interface WritingQuestion {
  type: "writing";
  question: string;
  expectedKeywords?: string[];
  correctAnswer?: string;
  maxScore?: number;
  points?: number;
}

type ExamQuestion = McqQuestion | WritingQuestion;

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

  // AI route rate limit (per user)
  const aiCheck = await checkAiRouteRateLimit(userId);
  if (!aiCheck.allowed) {
    return NextResponse.json(
      { error: "Trop de requetes — reessaie dans une minute" },
      { status: 429, headers: { "Retry-After": "60" } }
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
        certificationId,
        score: 0,
        passed: false,
        passScore: exam.passScore,
        questionResults: [],
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
    const userAnswer = answers[i.toString()] ?? "";

    if (q.type === "mcq") {
      const points = q.points ?? 1;
      totalPoints += points;
      // correctAnswer is a numeric index into the options array
      const correctAnswerText = q.options[q.correctAnswer] ?? "";
      const isCorrect =
        userAnswer.trim().toLowerCase() === correctAnswerText.trim().toLowerCase();
      const questionScore = isCorrect ? points : 0;
      earnedPoints += questionScore;
      questionResults.push({
        questionIndex: i,
        correct: isCorrect,
        score: questionScore,
        maxPoints: points,
        userAnswer,
        correctAnswer: correctAnswerText,
      });
    } else if (q.type === "writing") {
      const points = q.maxScore ?? q.points ?? 10;
      totalPoints += points;
      const expectedKeywords = q.expectedKeywords ?? [];
      const expectedAnswer = q.correctAnswer ?? expectedKeywords.join(", ");

      // Use AI to evaluate writing answers
      try {
        const aiResult = await chat({
          systemPrompt: `You are a language exam grader. Evaluate the student's answer to the following question.
The expected keywords/answer are provided. Score the student's answer from 0 to ${points}.
Consider: accuracy, grammar, vocabulary usage, natural expression, and whether the expected keywords are used.
Respond with ONLY a JSON object: {"score": <number>, "correct": <boolean>}
A score above ${Math.ceil(points * 0.6)} means the answer is considered correct.`,
          messages: [
            {
              role: "user",
              content: `Question: ${q.question}\nExpected keywords: ${expectedKeywords.join(", ")}\nExpected answer guideline: ${expectedAnswer}\nStudent's answer: ${userAnswer}`,
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
          correctAnswer: expectedAnswer,
        });
      } catch {
        // Fallback: keyword-based scoring
        const lowerAnswer = userAnswer.trim().toLowerCase();
        let matchedKeywords = 0;
        for (const kw of expectedKeywords) {
          if (lowerAnswer.includes(kw.toLowerCase())) {
            matchedKeywords++;
          }
        }
        const ratio = expectedKeywords.length > 0 ? matchedKeywords / expectedKeywords.length : 0;
        const questionScore = Math.round(ratio * points);
        const isCorrect = questionScore > points * 0.6;
        earnedPoints += questionScore;
        questionResults.push({
          questionIndex: i,
          correct: isCorrect,
          score: questionScore,
          maxPoints: points,
          userAnswer,
          correctAnswer: expectedAnswer,
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
