import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

function computeAccuracy(target: string, spoken: string): number {
  const normTarget = normalizeText(target);
  const normSpoken = normalizeText(spoken);

  if (normTarget === normSpoken) return 100;
  if (!normTarget || !normSpoken) return 0;

  const distance = levenshteinDistance(normTarget, normSpoken);
  const maxLen = Math.max(normTarget.length, normSpoken.length);
  const similarity = 1 - distance / maxLen;

  return Math.max(0, Math.round(similarity * 100));
}

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ru: "Russian",
  ko: "Korean",
  it: "Italian",
  pt: "Portuguese",
  ar: "Arabic",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetText, spokenText, languageCode, exerciseId } = body;

    if (!targetText || !spokenText || !languageCode) {
      return NextResponse.json(
        { error: "Missing required fields: targetText, spokenText, languageCode" },
        { status: 400 }
      );
    }

    const score = computeAccuracy(targetText, spokenText);

    let feedback: string | null = null;

    // Only call AI for tips if score is below 85%
    if (score < 85) {
      try {
        const langName = LANG_NAMES[languageCode] ?? languageCode;
        const result = await chat({
          systemPrompt: `You are a ${langName} pronunciation coach. Give a brief, helpful tip (2-3 sentences max) about pronunciation differences. Be encouraging. Reply in the user's language context.`,
          messages: [
            {
              role: "user",
              content: `Target phrase: "${targetText}"\nWhat I said: "${spokenText}"\nAccuracy: ${score}%\nGive me a quick pronunciation tip.`,
            },
          ],
          maxTokens: 150,
        });
        feedback = result.content;
      } catch {
        // AI feedback is optional, continue without it
        feedback = null;
      }
    }

    // Save attempt to database
    const attempt = await db.pronunciationAttempt.create({
      data: {
        userId: session.user.id,
        exerciseId: exerciseId ?? null,
        targetText,
        spokenText,
        languageCode,
        accuracyScore: score,
        aiFeedback: feedback,
      },
    });

    return NextResponse.json({
      data: {
        score,
        feedback,
        attempt: {
          id: attempt.id,
          accuracyScore: attempt.accuracyScore,
          createdAt: attempt.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Pronunciation evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
