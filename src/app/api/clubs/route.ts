import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const language = searchParams.get("language") || "";

  const where: Record<string, unknown> = { isPublic: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (language) {
    where.languageCode = language;
  }

  const clubs = await db.club.findMany({
    where,
    include: {
      _count: {
        select: {
          members: true,
          challenges: { where: { endsAt: { gte: new Date() } } },
        },
      },
      members: {
        take: 5,
        orderBy: { joinedAt: "asc" },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: [{ members: { _count: "desc" } }, { createdAt: "desc" }],
    take: 50,
  });

  // Transform response to include avatar data
  const data = clubs.map((club) => ({
    id: club.id,
    name: club.name,
    description: club.description,
    languageCode: club.languageCode,
    maxMembers: club.maxMembers,
    _count: club._count,
    memberAvatars: club.members.map((m) => ({
      name: m.user.name,
      image: m.user.image,
    })),
  }));

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, languageCode, isPublic, maxMembers } = body;

  if (!name || !languageCode) {
    return NextResponse.json(
      { error: "Nom et langue requis" },
      { status: 400 }
    );
  }

  const club = await db.club.create({
    data: {
      name,
      description: description || "",
      languageCode,
      ownerId: session.user.id,
      isPublic: isPublic ?? true,
      maxMembers: maxMembers || 50,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json({ data: club }, { status: 201 });
}
