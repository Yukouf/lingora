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

  const club = await db.club.findUnique({ where: { id } });
  if (!club) {
    return NextResponse.json({ error: "Club introuvable" }, { status: 404 });
  }

  if (club.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "Le propriétaire ne peut pas quitter le club" },
      { status: 400 }
    );
  }

  const membership = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Pas membre" }, { status: 400 });
  }

  await db.clubMember.delete({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  return NextResponse.json({ data: { success: true } });
}
