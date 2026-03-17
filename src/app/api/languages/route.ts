import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const selectLanguageSchema = z.object({
  languageId: z.string().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
});

// GET: list available languages
export async function GET() {
  const languages = await db.language.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: languages });
}

// POST: select a language (creates UserLanguage)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = selectLanguageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { languageId, level: selectedLevel } = parsed.data;

  // Check if language exists
  const language = await db.language.findUnique({ where: { id: languageId } });
  if (!language) {
    return NextResponse.json({ error: "Langue introuvable" }, { status: 404 });
  }

  // Upsert user language
  const userLang = await db.userLanguage.upsert({
    where: {
      userId_languageId: {
        userId: session.user.id,
        languageId,
      },
    },
    create: {
      userId: session.user.id,
      languageId,
      level: selectedLevel,
    },
    update: {
      level: selectedLevel,
      isActive: true,
    },
  });

  return NextResponse.json({ data: userLang });
}
