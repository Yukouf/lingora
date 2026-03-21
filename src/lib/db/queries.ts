import { db } from "@/lib/db";

// Check if user has premium subscription (ACTIVE status)
export async function isPremiumUser(userId: string): Promise<boolean> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { status: true, currentPeriodEnd: true },
  });

  if (!sub) return false;
  if (sub.status !== "ACTIVE") return false;

  // Check if not expired
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;

  return true;
}

// Levels that require premium
const PREMIUM_LEVELS = ["B1", "B2", "C1", "C2"];

export function levelRequiresPremium(level: string): boolean {
  return PREMIUM_LEVELS.includes(level);
}

// Get user's active language (first one) and its course
export async function getUserActiveCourse(userId: string) {
  const userLang = await db.userLanguage.findFirst({
    where: { userId },
    include: {
      language: true,
    },
    orderBy: { startedAt: "desc" },
  });

  if (!userLang) return null;

  const course = await db.course.findFirst({
    where: {
      languageId: userLang.languageId,
      level: userLang.level,
      isActive: true,
    },
    include: {
      chapters: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              userProgress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  return { userLang, course };
}

// Get chapters with progress for the learn page
export async function getChaptersWithProgress(userId: string) {
  const result = await getUserActiveCourse(userId);
  if (!result?.course) return { chapters: [], language: null, level: null, isPremium: false, levelCompleted: false };

  const { course, userLang } = result;
  const premium = await isPremiumUser(userId);

  let previousCompleted = true; // First chapter is always unlocked

  const chapters = course.chapters.map((chapter) => {
    const lessonsTotal = chapter.lessons.length;
    const lessonsCompleted = chapter.lessons.filter((l) =>
      l.userProgress.some((p) => p.completed)
    ).length;

    let status: "locked" | "in_progress" | "completed";
    if (lessonsCompleted === lessonsTotal && lessonsTotal > 0) {
      status = "completed";
    } else if (previousCompleted && lessonsCompleted < lessonsTotal) {
      status = "in_progress";
    } else if (previousCompleted) {
      status = "in_progress";
    } else {
      status = "locked";
    }

    previousCompleted = status === "completed";

    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      icon: chapter.icon,
      order: chapter.order,
      status,
      lessonsTotal,
      lessonsCompleted,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        completed: lesson.userProgress.some((p) => p.completed),
        score: lesson.userProgress[0]?.score ?? null,
      })),
    };
  });

  // Check if all chapters are completed (level done)
  const levelCompleted =
    chapters.length > 0 &&
    chapters.every((c) => c.status === "completed");

  // Determine next level
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentIdx = levels.indexOf(userLang.level);
  const nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;

  return {
    chapters,
    language: userLang.language,
    level: userLang.level,
    isPremium: premium,
    levelCompleted,
    nextLevel,
  };
}

// Get exercises for a specific lesson
export async function getLessonExercises(lessonId: string, userId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: {
            include: { language: true },
          },
        },
      },
      exercises: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          userProgress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!lesson) return null;

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
    },
    chapter: {
      id: lesson.chapter.id,
      title: lesson.chapter.title,
      icon: lesson.chapter.icon,
    },
    language: lesson.chapter.course.language,
    exercises: lesson.exercises.map((ex) => ({
      id: ex.id,
      type: ex.type,
      question: ex.question as Record<string, unknown>,
      order: ex.order,
      completed: ex.userProgress.some((p) => p.completed),
      score: ex.userProgress[0]?.score ?? null,
    })),
  };
}

// Save exercise progress
export async function saveExerciseProgress(
  userId: string,
  exerciseId: string,
  lessonId: string,
  score: number,
  timeSpent: number
) {
  // Read existing score to keep the best one on retry
  const existing = await db.userProgress.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
    select: { score: true },
  });
  const bestScore = existing ? Math.max(existing.score ?? 0, score) : score;

  // Upsert exercise progress
  await db.userProgress.upsert({
    where: {
      userId_exerciseId: { userId, exerciseId },
    },
    create: {
      userId,
      exerciseId,
      lessonId,
      score: bestScore,
      completed: bestScore >= 60,
      attempts: 1,
      timeSpent,
      completedAt: bestScore >= 60 ? new Date() : null,
    },
    update: {
      score: { set: bestScore },
      completed: bestScore >= 60,
      attempts: { increment: 1 },
      timeSpent: { increment: timeSpent },
      completedAt: bestScore >= 60 ? new Date() : null,
    },
  });

  // Check if all exercises in the lesson are completed
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: {
        where: { isActive: true },
        include: {
          userProgress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (lesson) {
    const allCompleted = lesson.exercises.every((ex) =>
      ex.userProgress.some((p) => p.completed)
    );

    if (allCompleted) {
      const avgScore = Math.round(
        lesson.exercises.reduce(
          (sum, ex) => sum + (ex.userProgress[0]?.score ?? 0),
          0
        ) / lesson.exercises.length
      );

      await db.userProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId },
        },
        create: {
          userId,
          lessonId,
          score: avgScore,
          completed: true,
          completedAt: new Date(),
        },
        update: {
          score: avgScore,
          completed: true,
          completedAt: new Date(),
        },
      });

      // Auto-generate flashcards from lesson vocabulary
      await generateFlashcardsFromLesson(userId, lessonId);
    }
  }
}

// Generate flashcards from lesson content (vocabulary)
async function generateFlashcardsFromLesson(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: {
            include: { language: true },
          },
        },
      },
    },
  });

  if (!lesson?.content) return;

  const content = lesson.content as Record<string, unknown>;
  const vocabulary = content.vocabulary as Array<{ word: string; translation: string; example?: string }> | undefined;

  if (!vocabulary || vocabulary.length === 0) return;

  const languageCode = lesson.chapter.course.language.code;

  // Get existing flashcards to avoid duplicates
  const existing = await db.flashcard.findMany({
    where: { userId, languageCode },
    select: { front: true },
  });
  const existingWords = new Set(existing.map((f) => f.front.toLowerCase()));

  const newCards = vocabulary
    .filter((v) => !existingWords.has(v.word.toLowerCase()))
    .map((v) => ({
      userId,
      front: v.word,
      back: v.example ? `${v.translation}\n\n📝 ${v.example}` : v.translation,
      languageCode,
      source: "LESSON" as const,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: new Date(),
    }));

  if (newCards.length > 0) {
    await db.flashcard.createMany({ data: newCards });
  }
}
