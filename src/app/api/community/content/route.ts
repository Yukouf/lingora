import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — list approved community content (filterable, paginated, sortable)
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language");
  const type = searchParams.get("type");
  const level = searchParams.get("level");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "recent"; // recent | popular | used
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "APPROVED" };

  if (language) where.languageCode = language;
  if (type) where.type = type;
  if (level) where.level = level;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build sort order
  type OrderByEntry = Record<string, string>;
  let orderBy: OrderByEntry;
  switch (sort) {
    case "popular":
      orderBy = { upvotes: "desc" };
      break;
    case "used":
      orderBy = { usageCount: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  try {
    const [items, total] = await Promise.all([
      db.communityContent.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.communityContent.count({ where }),
    ]);

    // If user is authenticated, fetch their votes for these items
    let userVotes: Record<string, number> = {};
    if (session?.user?.id && items.length > 0) {
      const contentIds = items.map((item) => item.id);
      const votes = await db.contentVote.findMany({
        where: {
          userId: session.user.id,
          contentId: { in: contentIds },
        },
        select: { contentId: true, vote: true },
      });
      userVotes = Object.fromEntries(
        votes.map((v) => [v.contentId, v.vote])
      );
    }

    return NextResponse.json({
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        userVotes,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — submit new community content (auth required)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, title, description, languageCode, level, content } = body;

    if (!type || !title?.trim() || !languageCode || !level || !content) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const validTypes = [
      "LESSON",
      "DIALOGUE",
      "FLASHCARD_PACK",
      "EXERCISE_SET",
      "VOCABULARY",
      "EXPRESSION",
      "CULTURAL_NOTE",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Niveau invalide" }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Titre trop long (max 200)" }, { status: 400 });
    }

    const item = await db.communityContent.create({
      data: {
        authorId: session.user.id,
        type,
        title: title.trim(),
        description: description?.trim() || null,
        languageCode,
        level,
        content,
        status: "PENDING",
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
