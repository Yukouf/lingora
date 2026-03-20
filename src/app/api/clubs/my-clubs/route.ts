import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const memberships = await db.clubMember.findMany({
    where: { userId: session.user.id },
    include: {
      club: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const clubs = memberships.map((m) => ({
    ...m.club,
    myRole: m.role,
  }));

  return NextResponse.json({ data: clubs });
}
