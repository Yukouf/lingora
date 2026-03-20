import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const club = await db.club.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });

  if (!club) {
    return NextResponse.json({ error: "Club introuvable" }, { status: 404 });
  }

  if (club._count.members >= club.maxMembers) {
    return NextResponse.json({ error: "Club complet" }, { status: 400 });
  }

  const existing = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Déjà membre" }, { status: 400 });
  }

  const member = await db.clubMember.create({
    data: {
      clubId: id,
      userId: session.user.id,
      role: "MEMBER",
    },
  });

  return NextResponse.json({ data: member }, { status: 201 });
}
