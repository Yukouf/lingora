import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  // Verify user is a member of the club
  const membership = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  // Get current week boundaries (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Get all members
  const members = await db.clubMember.findMany({
    where: { clubId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Aggregate weekly progress for each member
  const leaderboard = await Promise.all(
    members.map(async (member) => {
      const [lessonsCompleted, exercisesDone, conversationsHeld, flashcardsReviewed] =
        await Promise.all([
          db.userProgress.count({
            where: {
              userId: member.userId,
              completed: true,
              lessonId: { not: null },
              completedAt: { gte: monday, lte: sunday },
            },
          }),
          db.userProgress.count({
            where: {
              userId: member.userId,
              completed: true,
              exerciseId: { not: null },
              completedAt: { gte: monday, lte: sunday },
            },
          }),
          db.conversation.count({
            where: {
              userId: member.userId,
              createdAt: { gte: monday, lte: sunday },
            },
          }),
          db.flashcard.count({
            where: {
              userId: member.userId,
              lastReview: { gte: monday, lte: sunday },
            },
          }),
        ]);

      const points =
        lessonsCompleted * 10 +
        exercisesDone * 5 +
        conversationsHeld * 8 +
        flashcardsReviewed * 2;

      return {
        userId: member.userId,
        user: member.user,
        role: member.role,
        points,
        lessonsCompleted,
        exercisesDone,
        conversationsHeld,
        flashcardsReviewed,
      };
    })
  );

  leaderboard.sort((a, b) => b.points - a.points);

  return NextResponse.json({ data: leaderboard });
}
