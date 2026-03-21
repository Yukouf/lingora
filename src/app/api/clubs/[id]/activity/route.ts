import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ActivityItem {
  id: string;
  type: "lesson" | "exercise" | "conversation" | "flashcard" | "join" | "challenge_complete";
  userName: string;
  userImage: string | null;
  detail: string;
  timestamp: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get club members
  const members = await db.clubMember.findMany({
    where: { clubId: id },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const memberUserIds = members.map((m) => m.userId);
  const memberMap = new Map(
    members.map((m) => [m.userId, { name: m.user.name, image: m.user.image }])
  );

  // Only look back 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const activities: ActivityItem[] = [];

  // Recent lesson completions
  const lessonProgress = await db.userProgress.findMany({
    where: {
      userId: { in: memberUserIds },
      completed: true,
      lessonId: { not: null },
      completedAt: { gte: since },
    },
    include: {
      lesson: { select: { title: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 10,
  });

  for (const p of lessonProgress) {
    const user = memberMap.get(p.userId);
    activities.push({
      id: `lesson-${p.id}`,
      type: "lesson",
      userName: user?.name || "Utilisateur",
      userImage: user?.image || null,
      detail: `a termine la lecon "${p.lesson?.title || "?"}"`,
      timestamp: p.completedAt?.toISOString() || p.createdAt.toISOString(),
    });
  }

  // Recent exercise completions
  const exerciseProgress = await db.userProgress.findMany({
    where: {
      userId: { in: memberUserIds },
      completed: true,
      exerciseId: { not: null },
      completedAt: { gte: since },
    },
    orderBy: { completedAt: "desc" },
    take: 10,
  });

  for (const p of exerciseProgress) {
    const user = memberMap.get(p.userId);
    activities.push({
      id: `exercise-${p.id}`,
      type: "exercise",
      userName: user?.name || "Utilisateur",
      userImage: user?.image || null,
      detail: `a complete un exercice`,
      timestamp: p.completedAt?.toISOString() || p.createdAt.toISOString(),
    });
  }

  // Recent conversations
  const conversations = await db.conversation.findMany({
    where: {
      userId: { in: memberUserIds },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const c of conversations) {
    const user = memberMap.get(c.userId);
    activities.push({
      id: `convo-${c.id}`,
      type: "conversation",
      userName: user?.name || "Utilisateur",
      userImage: user?.image || null,
      detail: `a tenu une conversation`,
      timestamp: c.createdAt.toISOString(),
    });
  }

  // Recent member joins
  const recentJoins = await db.clubMember.findMany({
    where: {
      clubId: id,
      joinedAt: { gte: since },
    },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { joinedAt: "desc" },
    take: 5,
  });

  for (const j of recentJoins) {
    activities.push({
      id: `join-${j.id}`,
      type: "join",
      userName: j.user.name || "Utilisateur",
      userImage: j.user.image || null,
      detail: `a rejoint le club`,
      timestamp: j.joinedAt.toISOString(),
    });
  }

  // Sort by timestamp descending, limit to 20
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({ data: activities.slice(0, 20) });
}
