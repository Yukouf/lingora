import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPremiumUser, levelRequiresPremium } from "@/lib/db/queries";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const userId = session.user.id;

  // Get user's active language
  const userLang = await db.userLanguage.findFirst({
    where: { userId },
    orderBy: { startedAt: "asc" },
  });

  if (!userLang) {
    return NextResponse.redirect(new URL("/settings", process.env.NEXTAUTH_URL));
  }

  const currentIdx = LEVELS.indexOf(userLang.level as typeof LEVELS[number]);
  if (currentIdx >= LEVELS.length - 1) {
    // Already at max level
    return NextResponse.redirect(new URL("/learn", process.env.NEXTAUTH_URL));
  }

  // Verify all chapters/lessons in current level are completed
  const currentLevel = userLang.level;
  const coursesAtLevel = await db.course.findMany({
    where: {
      languageId: userLang.languageId,
      level: currentLevel,
    },
    include: {
      chapters: {
        include: {
          lessons: {
            include: {
              exercises: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  // Check that every exercise has been completed by this user
  const allExerciseIds = coursesAtLevel.flatMap((c) =>
    c.chapters.flatMap((ch) =>
      ch.lessons.flatMap((l) => l.exercises.map((e) => e.id))
    )
  );

  if (allExerciseIds.length > 0) {
    const completedCount = await db.userProgress.count({
      where: {
        userId,
        exerciseId: { in: allExerciseIds },
        completed: true,
      },
    });

    if (completedCount < allExerciseIds.length) {
      // Not all exercises completed — cannot level up
      return NextResponse.redirect(new URL("/learn", process.env.NEXTAUTH_URL));
    }
  }

  const nextLevel = LEVELS[currentIdx + 1];

  // Check premium requirement
  if (levelRequiresPremium(nextLevel)) {
    const premium = await isPremiumUser(userId);
    if (!premium) {
      return NextResponse.redirect(new URL("/settings", process.env.NEXTAUTH_URL));
    }
  }

  // Update user level
  await db.userLanguage.update({
    where: { id: userLang.id },
    data: { level: nextLevel },
  });

  return NextResponse.redirect(new URL("/learn", process.env.NEXTAUTH_URL));
}
