import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Placement test questions organized by difficulty
// Each question has a CECRL level weight
interface PlacementQuestion {
  id: number;
  level: "A1" | "A2" | "B1" | "B2";
  type: "multiple_choice" | "fill_blank";
  question: string;
  options?: string[];
  answer: string;
  hint?: string;
}

// English placement test questions
const PLACEMENT_TESTS: Record<string, PlacementQuestion[]> = {
  en: [
    // A1 level (3 questions)
    { id: 1, level: "A1", type: "multiple_choice", question: "What ___ your name?", options: ["is", "are", "am", "do"], answer: "is" },
    { id: 2, level: "A1", type: "multiple_choice", question: "She ___ a student.", options: ["is", "are", "am", "be"], answer: "is" },
    { id: 3, level: "A1", type: "multiple_choice", question: "I ___ from France.", options: ["am", "is", "are", "be"], answer: "am" },
    // A2 level (3 questions)
    { id: 4, level: "A2", type: "multiple_choice", question: "I ___ to the cinema yesterday.", options: ["went", "go", "going", "gone"], answer: "went" },
    { id: 5, level: "A2", type: "multiple_choice", question: "There are ___ apples on the table.", options: ["some", "a", "an", "much"], answer: "some" },
    { id: 6, level: "A2", type: "multiple_choice", question: "She is ___ than her sister.", options: ["taller", "more tall", "tallest", "tall"], answer: "taller" },
    // B1 level (3 questions)
    { id: 7, level: "B1", type: "multiple_choice", question: "If I ___ more time, I would travel more.", options: ["had", "have", "has", "having"], answer: "had" },
    { id: 8, level: "B1", type: "multiple_choice", question: "She asked me ___ I had been to London.", options: ["whether", "that", "what", "which"], answer: "whether" },
    { id: 9, level: "B1", type: "multiple_choice", question: "I wish I ___ speak Spanish fluently.", options: ["could", "can", "will", "would"], answer: "could" },
    // B2 level (3 questions)
    { id: 10, level: "B2", type: "multiple_choice", question: "Not until the meeting ___ did we realize the full extent of the problem.", options: ["had ended", "ended", "was ending", "ends"], answer: "had ended" },
    { id: 11, level: "B2", type: "multiple_choice", question: "The project was completed ___ schedule.", options: ["ahead of", "before of", "in front of", "prior"], answer: "ahead of" },
    { id: 12, level: "B2", type: "multiple_choice", question: "He ___ have left already; the lights are off.", options: ["must", "should", "could", "would"], answer: "must" },
  ],
  es: [
    { id: 1, level: "A1", type: "multiple_choice", question: "Yo ___ estudiante.", options: ["soy", "es", "eres", "son"], answer: "soy" },
    { id: 2, level: "A1", type: "multiple_choice", question: "¿Cómo ___ llamas?", options: ["te", "se", "me", "le"], answer: "te" },
    { id: 3, level: "A1", type: "multiple_choice", question: "Ella ___ en Madrid.", options: ["vive", "vivo", "vives", "vivir"], answer: "vive" },
    { id: 4, level: "A2", type: "multiple_choice", question: "Ayer ___ al cine.", options: ["fui", "voy", "ir", "iba"], answer: "fui" },
    { id: 5, level: "A2", type: "multiple_choice", question: "Me gustan ___ libros.", options: ["los", "el", "un", "la"], answer: "los" },
    { id: 6, level: "A2", type: "multiple_choice", question: "Cuando era joven, ___ mucho.", options: ["jugaba", "juego", "jugue", "jugar"], answer: "jugaba" },
    { id: 7, level: "B1", type: "multiple_choice", question: "Si ___ mas tiempo, viajaria mas.", options: ["tuviera", "tengo", "tiene", "tener"], answer: "tuviera" },
    { id: 8, level: "B1", type: "multiple_choice", question: "Es importante que ___ a tiempo.", options: ["llegues", "llegas", "llegar", "llegaras"], answer: "llegues" },
    { id: 9, level: "B1", type: "multiple_choice", question: "Dudo que el ___ la verdad.", options: ["sepa", "sabe", "saber", "sabia"], answer: "sepa" },
    { id: 10, level: "B2", type: "multiple_choice", question: "De haber sabido la verdad, no ___ asi.", options: ["habria actuado", "actuo", "actuaba", "actuare"], answer: "habria actuado" },
    { id: 11, level: "B2", type: "multiple_choice", question: "A pesar de que ___ lloviendo, salimos.", options: ["estuviera", "esta", "estuvo", "estaba"], answer: "estuviera" },
    { id: 12, level: "B2", type: "multiple_choice", question: "No bien ___ la noticia, se puso palido.", options: ["hubo recibido", "recibio", "recibia", "recibe"], answer: "hubo recibido" },
  ],
  // Default fallback (English-style) for other languages
};

// GET: return placement test questions for a language
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const lang = req.nextUrl.searchParams.get("lang") ?? "en";
  const questions = PLACEMENT_TESTS[lang] ?? PLACEMENT_TESTS.en;

  // Return questions without answers
  const safeQuestions = questions.map(({ answer, ...q }) => q);

  return NextResponse.json({ data: safeQuestions });
}

// POST: evaluate placement test answers and return recommended level
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

  const placementSchema = z.object({
    lang: z.string().min(1).max(10),
    answers: z.record(z.string(), z.string().max(200)),
  });

  const parsed = placementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides" },
      { status: 400 }
    );
  }

  const { lang, answers } = parsed.data;

  const questions = PLACEMENT_TESTS[lang] ?? PLACEMENT_TESTS.en;

  // Score by level
  const levelScores: Record<string, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    levelScores[q.level].total++;
    const userAnswer = answers[q.id];
    if (userAnswer && userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
      levelScores[q.level].correct++;
    }
  }

  // Determine level: highest level where user got >= 2/3 correct
  let recommendedLevel = "A1";
  const levels = ["A1", "A2", "B1", "B2"];

  for (const level of levels) {
    const { correct, total } = levelScores[level];
    if (total > 0 && correct / total >= 0.66) {
      // User passed this level, so they should be at least one level above
      const idx = levels.indexOf(level);
      if (idx < levels.length - 1) {
        recommendedLevel = levels[idx + 1];
      } else {
        recommendedLevel = level; // B2 max for test
      }
    }
  }

  // Total score
  const totalCorrect = Object.values(levelScores).reduce((s, l) => s + l.correct, 0);
  const totalQuestions = Object.values(levelScores).reduce((s, l) => s + l.total, 0);

  return NextResponse.json({
    data: {
      recommendedLevel,
      totalCorrect,
      totalQuestions,
      levelScores,
    },
  });
}
