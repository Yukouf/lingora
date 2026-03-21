import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(500),
  audioUrl: z.string().url().optional(),
});

// POST — create a new flashcard manually
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { front, back, audioUrl } = createSchema.parse(body);

    // Get user's active language
    const userLang = await db.userLanguage.findFirst({
      where: { userId: session.user.id },
      include: { language: true },
      orderBy: { startedAt: "desc" },
    });

    if (!userLang) {
      return NextResponse.json(
        { error: "Aucune langue sélectionnée" },
        { status: 400 }
      );
    }

    const card = await db.flashcard.create({
      data: {
        userId: session.user.id,
        front,
        back,
        audioUrl,
        languageCode: userLang.language.code,
        source: "MANUAL",
      },
    });

    return NextResponse.json(
      { data: { id: card.id, front: card.front, back: card.back } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    console.error("Create flashcard error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
