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

  const members = await db.clubMember.findMany({
    where: { clubId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          _count: {
            select: {
              flashcards: true,
              conversations: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({ data: members });
}
