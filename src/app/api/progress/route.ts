import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user profile
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, createdAt: true },
  });

  // Get user's active language
  const userLang = await db.userLanguage.findFirst({
    where: { userId },
    include: { language: true },
    orderBy: { startedAt: "desc" },
  });

  // Lessons completed
  const lessonsCompleted = await db.userProgress.count({
    where: { userId, lessonId: { not: null }, completed: true },
  });

  // Exercises completed
  const exercisesCompleted = await db.userProgress.count({
    where: { userId, exerciseId: { not: null }, completed: true },
  });

  // Total time spent (in seconds)
  const timeResult = await db.userProgress.aggregate({
    where: { userId },
    _sum: { timeSpent: true },
  });
  const totalSeconds = timeResult._sum.timeSpent ?? 0;
  const practiceHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Conversations held
  const conversationsHeld = await db.conversation.count({
    where: { userId },
  });

  // Flashcard stats
  const flashcardTotal = await db.flashcard.count({
    where: { userId },
  });

  const flashcardMastery = await db.flashcard.groupBy({
    by: ["mastery"],
    where: { userId },
    _count: true,
  });

  const masteryMap = Object.fromEntries(
    flashcardMastery.map((m) => [m.mastery, m._count])
  );

  // Words learned = flashcards acquired or mastered + exercises completed
  const wordsLearned =
    (masteryMap.ACQUIRED ?? 0) +
    (masteryMap.MASTERED ?? 0) +
    exercisesCompleted;

  // Streak: count consecutive days with activity (simplified)
  const recentActivity = await db.userProgress.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
    take: 100,
  });

  let currentStreak = 0;
  if (recentActivity.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set<string>();
    for (const a of recentActivity) {
      if (a.completedAt) {
        const d = new Date(a.completedAt);
        d.setHours(0, 0, 0, 0);
        uniqueDays.add(d.toISOString());
      }
    }

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    const checkDate = new Date(today);

    // Check if user practiced today or yesterday to start counting
    const todayStr = today.toISOString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString();

    if (!sortedDays.includes(todayStr) && !sortedDays.includes(yesterdayStr)) {
      currentStreak = 0;
    } else {
      if (!sortedDays.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      for (let i = 0; i < 365; i++) {
        const dayStr = new Date(checkDate);
        dayStr.setHours(0, 0, 0, 0);
        if (sortedDays.includes(dayStr.toISOString())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  // Level progress estimate (based on lessons in current level)
  let levelProgress = 0;
  let nextLevel = "A2";
  if (userLang) {
    const course = await db.course.findFirst({
      where: {
        languageId: userLang.languageId,
        level: userLang.level,
        isActive: true,
      },
      include: {
        chapters: {
          include: {
            lessons: { where: { isActive: true } },
          },
        },
      },
    });

    if (course) {
      const totalLessons = course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0
      );
      if (totalLessons > 0) {
        levelProgress = Math.min(
          100,
          Math.round((lessonsCompleted / totalLessons) * 100)
        );
      }
    }

    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const currentIdx = levels.indexOf(userLang.level);
    nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : "C2";
  }

  // Average scores by exercise type (simplified skill radar)
  const exerciseScores = await db.userProgress.findMany({
    where: { userId, exerciseId: { not: null }, completed: true },
    include: {
      exercise: { select: { type: true } },
    },
  });

  // Map exercise types to skills
  const skillMapping: Record<string, string> = {
    LISTENING: "listening",
    MULTIPLE_CHOICE: "reading",
    FILL_IN_BLANK: "grammar",
    TRANSLATION: "vocabulary",
    WRITING: "writing",
    FREE_PRODUCTION: "writing",
    REORDER: "grammar",
    MATCHING: "vocabulary",
    CONTEXT_GUESS: "reading",
    SPOT_ERROR: "grammar",
    DIALOGUE_COMPLETE: "speaking",
  };

  const skillScores: Record<string, { total: number; count: number }> = {
    listening: { total: 0, count: 0 },
    reading: { total: 0, count: 0 },
    writing: { total: 0, count: 0 },
    speaking: { total: 0, count: 0 },
    grammar: { total: 0, count: 0 },
    vocabulary: { total: 0, count: 0 },
  };

  for (const ep of exerciseScores) {
    if (ep.exercise && ep.score !== null) {
      const skill = skillMapping[ep.exercise.type] ?? "reading";
      skillScores[skill].total += ep.score;
      skillScores[skill].count += 1;
    }
  }

  // Add conversation count to speaking skill
  if (conversationsHeld > 0) {
    skillScores.speaking.total += conversationsHeld * 70; // estimated average
    skillScores.speaking.count += conversationsHeld;
  }

  // Add flashcard mastered to vocabulary
  if (flashcardTotal > 0) {
    const masteredRatio =
      ((masteryMap.ACQUIRED ?? 0) + (masteryMap.MASTERED ?? 0)) /
      flashcardTotal;
    skillScores.vocabulary.total += Math.round(masteredRatio * 100);
    skillScores.vocabulary.count += 1;
  }

  const skills = Object.fromEntries(
    Object.entries(skillScores).map(([key, { total, count }]) => [
      key,
      count > 0 ? Math.round(total / count) : 0,
    ])
  );

  // Average score across all exercises
  const allScores = exerciseScores
    .filter((ep) => ep.score !== null)
    .map((ep) => ep.score as number);
  const averageScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  // Activity heatmap: last 12 weeks of practice days
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  twelveWeeksAgo.setHours(0, 0, 0, 0);

  const heatmapActivity = await db.userProgress.findMany({
    where: {
      userId,
      completedAt: { not: null, gte: twelveWeeksAgo },
    },
    select: { completedAt: true },
  });

  const activityDays = new Set<string>();
  for (const a of heatmapActivity) {
    if (a.completedAt) {
      const d = new Date(a.completedAt);
      activityDays.add(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }
  }

  // Has the user achieved a 100% score on any exam
  const hasPerfectScore = allScores.some((s) => s === 100);

  // Mastered flashcards count
  const masteredWords = (masteryMap.MASTERED ?? 0) + (masteryMap.ACQUIRED ?? 0);

  return NextResponse.json({
    data: {
      userName: user?.name ?? session.user.name ?? null,
      userImage: user?.image ?? session.user.image ?? null,
      memberSince: user?.createdAt ?? null,
      wordsLearned,
      lessonsCompleted,
      practiceHours,
      conversationsHeld,
      currentStreak,
      averageScore,
      currentLevel: userLang?.level ?? "A1",
      nextLevel,
      levelProgress,
      flashcardTotal,
      masteredWords,
      hasPerfectScore,
      language: userLang?.language ?? null,
      skills,
      activityDays: Array.from(activityDays),
    },
  });
}
