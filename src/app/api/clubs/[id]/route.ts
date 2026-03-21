import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const club = await db.club.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      challenges: {
        where: { endsAt: { gte: new Date() } },
        include: {
          _count: { select: { participants: true } },
          participants: {
            select: { userId: true, progress: true },
          },
        },
        orderBy: { startsAt: "desc" },
      },
      _count: { select: { members: true } },
    },
  });

  if (!club) {
    return NextResponse.json({ error: "Club introuvable" }, { status: 404 });
  }

  return NextResponse.json({ data: club });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const membership = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, isPublic, maxMembers } = body;

  const club = await db.club.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
      ...(maxMembers !== undefined && { maxMembers }),
    },
  });

  return NextResponse.json({ data: club });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const club = await db.club.findUnique({ where: { id } });
  if (!club || club.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  await db.club.delete({ where: { id } });

  return NextResponse.json({ data: { success: true } });
}
