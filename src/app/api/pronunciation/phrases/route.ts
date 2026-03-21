import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chat } from "@/lib/ai";
import { checkAiRouteRateLimit } from "@/lib/rate-limit";

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

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "complete beginner (very simple words and short phrases)",
  A2: "elementary (basic sentences, everyday topics)",
  B1: "intermediate (opinions, experiences, common situations)",
  B2: "upper-intermediate (complex ideas, professional language)",
  C1: "advanced (nuanced expression, idiomatic usage)",
  C2: "near-native (complex academic and professional language)",
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AI route rate limit
    const aiCheck = await checkAiRouteRateLimit(session.user.id);
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests — please wait" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get("languageCode") ?? "en";
    const level = searchParams.get("level") ?? "A1";
    const category = searchParams.get("category") ?? "general";

    const langName = LANG_NAMES[languageCode] ?? languageCode;
    const levelDesc = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS["A1"];

    const categoryPrompt =
      category === "general"
        ? "everyday situations"
        : category === "travel"
          ? "travel and tourism situations"
          : category === "work"
            ? "professional and work situations"
            : category === "social"
              ? "social and casual conversations"
              : "everyday situations";

    try {
      const result = await chat({
        systemPrompt: `You are a ${langName} language teacher. Generate exactly 6 pronunciation practice phrases in ${langName} for a ${levelDesc} learner. The phrases should relate to ${categoryPrompt}.

Return ONLY a JSON array of objects with these fields:
- "text": the phrase in ${langName}
- "translation": the French translation
- "difficulty": "easy", "medium", or "hard"
- "tip": a brief pronunciation tip in French (1 sentence max)

No markdown, no explanation, just the JSON array.`,
        messages: [
          {
            role: "user",
            content: `Generate 6 ${langName} pronunciation phrases for level ${level}, category: ${categoryPrompt}.`,
          },
        ],
        maxTokens: 600,
      });

      // Parse the AI response
      const content = result.content.trim();
      // Try to extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const phrases = JSON.parse(jsonMatch[0]) as Array<{
        text: string;
        translation: string;
        difficulty: string;
        tip: string;
      }>;

      return NextResponse.json({ data: { phrases } });
    } catch {
      // Fallback: return static phrases if AI fails
      const fallbackPhrases = getFallbackPhrases(languageCode);
      return NextResponse.json({ data: { phrases: fallbackPhrases } });
    }
  } catch (error) {
    console.error("Pronunciation phrases error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getFallbackPhrases(languageCode: string) {
  const phrases: Record<
    string,
    Array<{ text: string; translation: string; difficulty: string; tip: string }>
  > = {
    en: [
      { text: "Hello, how are you?", translation: "Bonjour, comment vas-tu ?", difficulty: "easy", tip: "Le 'h' est aspiré en anglais." },
      { text: "I would like a cup of coffee, please.", translation: "Je voudrais une tasse de café, s'il vous plaît.", difficulty: "medium", tip: "Le 'would' se prononce /wʊd/." },
      { text: "Could you tell me where the train station is?", translation: "Pourriez-vous me dire où est la gare ?", difficulty: "medium", tip: "Le 'could' se prononce /kʊd/ avec un son court." },
      { text: "The weather is beautiful today.", translation: "Le temps est magnifique aujourd'hui.", difficulty: "easy", tip: "Le 'th' de 'the' est un son dental doux." },
      { text: "I have been working here for three years.", translation: "Je travaille ici depuis trois ans.", difficulty: "hard", tip: "Attention au 'been' /biːn/ et pas /bɛn/." },
      { text: "What time does the restaurant open?", translation: "À quelle heure ouvre le restaurant ?", difficulty: "easy", tip: "Le 'wh' de 'what' se prononce /w/." },
    ],
    es: [
      { text: "Buenos días, ¿cómo estás?", translation: "Bonjour, comment vas-tu ?", difficulty: "easy", tip: "Le 'r' espagnol est roulé avec la langue." },
      { text: "Me gustaría un café con leche.", translation: "Je voudrais un café au lait.", difficulty: "easy", tip: "Attention au 'g' doux devant 'u'." },
      { text: "¿Dónde está la estación de tren?", translation: "Où est la gare ?", difficulty: "medium", tip: "Le 'ó' porte un accent tonique." },
      { text: "El tiempo está muy bonito hoy.", translation: "Le temps est très beau aujourd'hui.", difficulty: "easy", tip: "Le 'b' et le 'v' se prononcent presque pareil." },
      { text: "He estado trabajando aquí tres años.", translation: "Je travaille ici depuis trois ans.", difficulty: "hard", tip: "Le 'j' espagnol se prononce comme un 'r' guttural." },
      { text: "¿A qué hora abre el restaurante?", translation: "À quelle heure ouvre le restaurant ?", difficulty: "medium", tip: "Le 'rr' est un roulement prolongé." },
    ],
    de: [
      { text: "Guten Tag, wie geht es Ihnen?", translation: "Bonjour, comment allez-vous ?", difficulty: "easy", tip: "Le 'ch' allemand a deux prononciations selon la voyelle." },
      { text: "Ich hätte gerne einen Kaffee.", translation: "Je voudrais un café.", difficulty: "medium", tip: "Le 'ä' se prononce comme un 'è' français." },
      { text: "Wo ist der Bahnhof?", translation: "Où est la gare ?", difficulty: "easy", tip: "Le 'w' allemand se prononce /v/." },
      { text: "Das Wetter ist heute sehr schön.", translation: "Le temps est très beau aujourd'hui.", difficulty: "medium", tip: "Le 'sch' se prononce /ʃ/ comme 'ch' français." },
      { text: "Ich arbeite seit drei Jahren hier.", translation: "Je travaille ici depuis trois ans.", difficulty: "hard", tip: "Le 'r' allemand est guttural, pas roulé." },
      { text: "Wann öffnet das Restaurant?", translation: "Quand le restaurant ouvre-t-il ?", difficulty: "medium", tip: "Le 'ö' se prononce comme le 'eu' français." },
    ],
  };

  return phrases[languageCode] ?? phrases["en"];
}
