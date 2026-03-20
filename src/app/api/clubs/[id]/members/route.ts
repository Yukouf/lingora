import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
