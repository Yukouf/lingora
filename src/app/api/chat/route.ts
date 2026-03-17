import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scenarios, buildSystemPrompt } from "@/lib/ai/scenarios";
import { chatStream, estimateCost } from "@/lib/ai";
import { checkChatRateLimit, checkIpRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;

  // Global IP rate limit (30 req/min)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = await checkIpRateLimit(ip);
  if (!ipCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Trop de requêtes — réessaie dans une minute" }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  try {
    const { scenarioId, conversationId, message } = await req.json();

    if (!scenarioId || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Données manquantes" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message trop long (max 2000 caractères)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      return new Response(
        JSON.stringify({ error: "Scénario introuvable" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
    });
    const isPremium = subscription?.status === "ACTIVE";

    if (scenario.isPremium && !isPremium) {
      return new Response(
        JSON.stringify({ error: "Scénario premium — abonnement requis" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const rateCheck = await checkChatRateLimit(userId, isPremium);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: isPremium
            ? "Limite quotidienne atteinte (200 messages/jour)"
            : "Limite gratuite atteinte (15 messages/jour). Passe en premium pour continuer !",
          remaining: rateCheck.remaining,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "86400",
          },
        }
      );
    }

    const userLang = await db.userLanguage.findFirst({
      where: { userId },
      include: { language: true },
      orderBy: { startedAt: "asc" },
    });

    if (!userLang) {
      return new Response(
        JSON.stringify({ error: "Aucune langue sélectionnée" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(
      scenario,
      userLang.language.name,
      userLang.level
    );

    // Load or create conversation
    let conversation: { id: string; messages: unknown } | null = null;
    let previousMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId, userId },
      });
      if (conversation) {
        previousMessages = (conversation.messages as Array<{ role: "user" | "assistant"; content: string }>) || [];
      }
    }

    const allMessages = [
      ...previousMessages,
      { role: "user" as const, content: message },
    ];

    // Keep last 30 messages for context
    const contextMessages = allMessages.slice(-30);

    // Stream response from OpenAI
    const stream = await chatStream({
      model: "gpt-4o-mini",
      systemPrompt,
      messages: contextMessages,
      maxTokens: 512,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Track usage from final chunk
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens ?? 0;
              outputTokens = chunk.usage.completion_tokens ?? 0;
            }

            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
              );
            }
          }

          // Save conversation to DB
          const updatedMessages = [
            ...allMessages,
            { role: "assistant" as const, content: fullResponse },
          ];

          if (conversation) {
            await db.conversation.update({
              where: { id: conversation.id },
              data: {
                messages: JSON.parse(JSON.stringify(updatedMessages)),
                updatedAt: new Date(),
              },
            });
          } else {
            conversation = await db.conversation.create({
              data: {
                userId,
                scenarioId,
                languageCode: userLang.language.code,
                messages: JSON.parse(JSON.stringify(updatedMessages)),
              },
            });
          }

          // Log API usage
          await db.apiUsageLog.create({
            data: {
              userId,
              endpoint: "/api/chat",
              modelUsed: "gpt-4o-mini",
              inputTokens,
              outputTokens,
              costEstimated: estimateCost(inputTokens, outputTokens, "gpt-4o-mini"),
            },
          });

          // Send done event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Erreur lors de la génération" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
