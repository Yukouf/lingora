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

  const challenges = await db.clubChallenge.findMany({
    where: { clubId: id },
    include: {
      participants: true,
      _count: { select: { participants: true } },
    },
    orderBy: { startsAt: "desc" },
  });

  return NextResponse.json({ data: challenges });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const membership = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, type, target, startsAt, endsAt } = body;

  if (!title || !type || !target || !startsAt || !endsAt) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 }
    );
  }

  const challenge = await db.clubChallenge.create({
    data: {
      clubId: id,
      title,
      description: description || "",
      type,
      target: Number(target),
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
    },
    include: {
      _count: { select: { participants: true } },
    },
  });

  return NextResponse.json({ data: challenge }, { status: 201 });
}
