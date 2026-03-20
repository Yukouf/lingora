import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  lessonId: z.string().min(1),
});

interface VocabItem {
  word: string;
  translation: string;
  example?: string;
}

// POST — auto-generate flashcards from lesson vocabulary
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lessonId } = schema.parse(body);

    // Get lesson with content and language
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              include: { language: true },
            },
          },
        },
      },
    });

    if (!lesson?.content) {
      return NextResponse.json({ data: { created: 0 } });
    }

    const content = lesson.content as { vocabulary?: VocabItem[] };
    const vocabulary = content.vocabulary ?? [];
    if (vocabulary.length === 0) {
      return NextResponse.json({ data: { created: 0 } });
    }

    const languageCode = lesson.chapter.course.language.code;
    const userId = session.user.id;

    // Check which flashcards already exist to avoid duplicates
    const existingCards = await db.flashcard.findMany({
      where: {
        userId,
        languageCode,
        front: { in: vocabulary.map((v) => v.word) },
      },
      select: { front: true },
    });
    const existingFronts = new Set(existingCards.map((c) => c.front));

    // Create new flashcards for vocabulary not yet added
    const newCards = vocabulary
      .filter((v) => v.word && v.translation && !existingFronts.has(v.word))
      .map((v) => ({
        userId,
        front: v.word,
        back: v.translation,
        languageCode,
        source: "LESSON" as const,
      }));

    if (newCards.length > 0) {
      await db.flashcard.createMany({ data: newCards });
    }

    return NextResponse.json({ data: { created: newCards.length } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    console.error("Auto-generate flashcards error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
