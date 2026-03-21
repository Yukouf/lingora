import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; challengeId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id, challengeId } = await params;

  // Verify user is a member of the club
  const membership = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Vous devez etre membre du club" },
      { status: 403 }
    );
  }

  // Verify the challenge exists and belongs to this club
  const challenge = await db.clubChallenge.findFirst({
    where: { id: challengeId, clubId: id },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Defi introuvable" }, { status: 404 });
  }

  // Check if challenge is still active
  const now = new Date();
  if (now > challenge.endsAt) {
    return NextResponse.json({ error: "Ce defi est termine" }, { status: 400 });
  }

  // Check if already participating
  const existing = await db.challengeProgress.findUnique({
    where: {
      challengeId_userId: { challengeId, userId: session.user.id },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Deja inscrit" }, { status: 400 });
  }

  const progress = await db.challengeProgress.create({
    data: {
      challengeId,
      userId: session.user.id,
      progress: 0,
    },
  });

  return NextResponse.json({ data: progress }, { status: 201 });
}
