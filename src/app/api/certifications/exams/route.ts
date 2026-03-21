import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPremiumUser, levelRequiresPremium } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's active language
  const userLang = await db.userLanguage.findFirst({
    where: { userId },
    include: { language: true },
    orderBy: { startedAt: "desc" },
  });

  if (!userLang) {
    return NextResponse.json({ data: [], error: null });
  }

  const languageCode = userLang.language.code;
  const premium = await isPremiumUser(userId);

  // Get all active exams for this language
  const exams = await db.certificationExam.findMany({
    where: {
      languageCode,
      isActive: true,
    },
    orderBy: { level: "asc" },
    include: {
      attempts: {
        where: { userId },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  const data = exams.map((exam) => {
    const requiresPremium = levelRequiresPremium(exam.level);
    const locked = requiresPremium && !premium;
    const attempts = exam.attempts.length;
    const bestScore = exam.attempts.reduce(
      (max, a) => Math.max(max, a.score),
      0
    );
    const passed = exam.attempts.some((a) => a.passed);

    return {
      id: exam.id,
      languageCode: exam.languageCode,
      level: exam.level,
      title: exam.title,
      description: exam.description,
      durationMin: exam.durationMin,
      passScore: exam.passScore,
      locked,
      attempts,
      bestScore,
      passed,
    };
  });

  return NextResponse.json({ data, error: null });
}
