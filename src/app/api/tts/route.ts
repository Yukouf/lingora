import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { checkAiRouteRateLimit, checkIpRateLimit } from "@/lib/rate-limit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ttsSchema = z.object({
  text: z.string().min(1).max(500),
  lang: z.string().min(2).max(10),
});

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // IP rate limit (30 req/min)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = await checkIpRateLimit(ip);
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes — réessaie dans une minute" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Per-user AI rate limit (20 req/min)
  const userCheck = await checkAiRouteRateLimit(userId);
  if (!userCheck.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes TTS — réessaie dans une minute" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Parse & validate body
  const body = await req.json().catch(() => null);
  const parsed = ttsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paramètres invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { text, lang } = parsed.data;

  try {
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      response_format: "mp3",
    });

    // Stream the audio back as mp3
    const arrayBuffer = await mp3Response.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Lang": lang,
      },
    });
  } catch (error) {
    console.error("[TTS] OpenAI error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération audio" },
      { status: 500 }
    );
  }
}
