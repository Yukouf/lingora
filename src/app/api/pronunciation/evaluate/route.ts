import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai";
import { checkAiRouteRateLimit, checkIpRateLimit } from "@/lib/rate-limit";

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

// Word-level status for highlight feedback
type WordStatus = "correct" | "mispronounced" | "missing" | "extra";

interface WordDiff {
  word: string;
  status: WordStatus;
  expected?: string; // the expected word when mispronounced
}

/**
 * Compute word-level diff between target and spoken text using
 * Levenshtein on word arrays to find the optimal alignment.
 */
function computeWordDiff(target: string, spoken: string): WordDiff[] {
  const targetWords = normalizeText(target).split(" ").filter(Boolean);
  const spokenWords = normalizeText(spoken).split(" ").filter(Boolean);

  const m = targetWords.length;
  const n = spokenWords.length;

  // Build cost matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (targetWords[i - 1] === spokenWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion (missing word)
          dp[i][j - 1],     // insertion (extra word)
          dp[i - 1][j - 1], // substitution (mispronounced)
        );
      }
    }
  }

  // Backtrack to build diff
  const result: WordDiff[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && targetWords[i - 1] === spokenWords[j - 1]) {
      result.unshift({ word: spokenWords[j - 1], status: "correct" });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      // Substitution — mispronounced
      result.unshift({
        word: spokenWords[j - 1],
        status: "mispronounced",
        expected: targetWords[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      // Insertion — extra word the user said
      result.unshift({ word: spokenWords[j - 1], status: "extra" });
      j--;
    } else {
      // Deletion — word the user missed
      result.unshift({ word: targetWords[i - 1], status: "missing" });
      i--;
    }
  }

  return result;
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

    // IP rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipCheck = await checkIpRateLimit(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // AI route rate limit (per user)
    const aiCheck = await checkAiRouteRateLimit(session.user.id);
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { error: "Too many AI requests — please wait" },
        { status: 429, headers: { "Retry-After": "60" } }
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

    // Input length validation
    if (typeof targetText !== "string" || targetText.length > 1000) {
      return NextResponse.json({ error: "targetText too long (max 1000)" }, { status: 400 });
    }
    if (typeof spokenText !== "string" || spokenText.length > 1000) {
      return NextResponse.json({ error: "spokenText too long (max 1000)" }, { status: 400 });
    }
    if (typeof languageCode !== "string" || languageCode.length > 10) {
      return NextResponse.json({ error: "Invalid languageCode" }, { status: 400 });
    }

    const score = computeAccuracy(targetText, spokenText);
    const wordDiff = computeWordDiff(targetText, spokenText);

    let feedback: string | null = null;

    // Only call AI for tips if score is below 85%
    if (score < 85) {
      try {
        const langName = LANG_NAMES[languageCode] ?? languageCode;
        const mispronounced = wordDiff
          .filter((w) => w.status === "mispronounced")
          .map((w) => `"${w.word}" (attendu: "${w.expected}")`)
          .join(", ");
        const missing = wordDiff
          .filter((w) => w.status === "missing")
          .map((w) => `"${w.word}"`)
          .join(", ");

        const details = [
          mispronounced ? `Mots mal prononcés : ${mispronounced}` : "",
          missing ? `Mots manquants : ${missing}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        const result = await chat({
          systemPrompt: `You are a ${langName} pronunciation coach. Give a brief, helpful tip (2-3 sentences max) about pronunciation differences. Focus on the specific mispronounced words. Be encouraging. Reply in French.`,
          messages: [
            {
              role: "user",
              content: `Phrase cible : "${targetText}"\nCe que j'ai dit : "${spokenText}"\nPrécision : ${score}%\n${details}\nDonne-moi un conseil rapide de prononciation.`,
            },
          ],
          maxTokens: 200,
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
        wordDiff,
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
