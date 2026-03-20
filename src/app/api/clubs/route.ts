import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const language = searchParams.get("language") || "";

  const where: Record<string, unknown> = { isPublic: true };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (language) {
    where.languageCode = language;
  }

  const clubs = await db.club.findMany({
    where,
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: clubs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
