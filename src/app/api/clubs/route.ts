import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createClubSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(""),
  languageCode: z.string().min(1).max(10),
  isPublic: z.boolean().optional().default(true),
  maxMembers: z.number().int().min(2).max(500).optional().default(50),
});

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createClubSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides" },
      { status: 400 }
    );
  }

  const { name, description, languageCode, isPublic, maxMembers } = parsed.data;

  const club = await db.club.create({
    data: {
      name,
      description,
      languageCode,
      ownerId: session.user.id,
      isPublic,
      maxMembers,
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
