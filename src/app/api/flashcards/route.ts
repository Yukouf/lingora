import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateNextReview } from "@/lib/srs";

const reviewSchema = z.object({
  cardId: z.string().min(1),
  quality: z.number().int().min(0).max(5),
});

// GET — fetch cards due for review
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's active language
  const userLang = await db.userLanguage.findFirst({
    where: { userId },
    include: { language: true },
    orderBy: { startedAt: "desc" },
  });

  if (!userLang) {
    return NextResponse.json({ data: { cards: [], total: 0, languageCode: null } });
  }

  const now = new Date();

  // Cards due for review
  const dueCards = await db.flashcard.findMany({
    where: {
      userId,
      languageCode: userLang.language.code,
      nextReview: { lte: now },
    },
    orderBy: { nextReview: "asc" },
    take: 30, // Max 30 per session
  });

  // Total cards for this language
  const totalCards = await db.flashcard.count({
    where: {
      userId,
      languageCode: userLang.language.code,
    },
  });

  // Stats by mastery
  const masteryStats = await db.flashcard.groupBy({
    by: ["mastery"],
    where: {
      userId,
      languageCode: userLang.language.code,
    },
    _count: true,
  });

  return NextResponse.json({
    data: {
      cards: dueCards.map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        audioUrl: c.audioUrl,
        mastery: c.mastery,
        source: c.source,
      })),
      total: totalCards,
      due: dueCards.length,
      languageCode: userLang.language.code,
      stats: Object.fromEntries(
        masteryStats.map((s) => [s.mastery, s._count])
      ),
    },
  });
}

// POST — save review result for a card
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides (cardId + quality 0-5 requis)" },
        { status: 400 }
      );
    }

    const { cardId, quality } = parsed.data;

    // Get the card
    const card = await db.flashcard.findUnique({
      where: { id: cardId, userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Carte introuvable" },
        { status: 404 }
      );
    }

    // Calculate next review using SM-2+
    const result = calculateNextReview(
      {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
      },
      quality
    );

    // Update the card
    await db.flashcard.update({
      where: { id: cardId },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReview: result.nextReview,
        lastReview: new Date(),
        mastery: result.mastery,
      },
    });

    return NextResponse.json({
      data: {
        mastery: result.mastery,
        nextReview: result.nextReview,
        interval: result.interval,
      },
    });
  } catch (error) {
    console.error("Flashcard review error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
