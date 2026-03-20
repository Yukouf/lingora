"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  ArrowLeft,
  RotateCcw,
  Loader2,
  UtensilsCrossed,
  Building2,
  ShoppingCart,
  MapPin,
  Stethoscope,
  Briefcase,
  MessageCircle,
  Handshake,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const scenarioIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  restaurant: { icon: UtensilsCrossed, color: "#f97316" },
  "hotel-checkin": { icon: Building2, color: "#fbbf24" },
  shopping: { icon: ShoppingCart, color: "#22d3ee" },
  directions: { icon: MapPin, color: "#ef4444" },
  doctor: { icon: Stethoscope, color: "#10b981" },
  "job-interview": { icon: Briefcase, color: "#8b5cf6" },
  debate: { icon: MessageCircle, color: "#06b6d4" },
  negotiation: { icon: Handshake, color: "#f43f5e" },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  scenarioId: string;
  scenarioTitle: string;
  scenarioIcon: string;
  scenarioDescription: string;
  languageName: string;
  level: string;
  existingConversationId?: string;
  existingMessages?: Message[];
}

export function ChatInterface({
  scenarioId,
  scenarioTitle,
  scenarioIcon,
  scenarioDescription,
  languageName,
  level,
  existingConversationId,
  existingMessages,
}: ChatInterfaceProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>(existingMessages ?? []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    existingConversationId ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Add empty assistant message for streaming
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          conversationId,
          message: trimmed,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.dashboard.chat.serverError);
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Pas de stream");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const data = JSON.parse(jsonStr);

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.text }
                    : m
                )
              );
            }

            if (data.done && data.conversationId) {
              setConversationId(data.conversationId);
            }
          } catch (parseErr) {
            // Skip malformed JSON lines
            if (parseErr instanceof Error && parseErr.message !== "Erreur lors de la génération") {
              // Silently skip parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : t.dashboard.chat.connectionError;
      setError(errorMsg);
      // Remove empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3">
        <Link
          href="/practice"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {(() => {
            const config = scenarioIconMap[scenarioId];
            if (config) {
              const Icon = config.icon;
              return (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: config.color }} strokeWidth={1.8} />
                </div>
              );
            }
            return <span className="text-2xl shrink-0">{scenarioIcon}</span>;
          })()}
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-white/90">
              {scenarioTitle}
            </h1>
            <p className="truncate text-[11px] text-white/40">
              {languageName} · {level}
            </p>
          </div>
        </div>

        <button
          onClick={resetConversation}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
          title={t.dashboard.chat.newConversation}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            {(() => {
              const config = scenarioIconMap[scenarioId];
              if (config) {
                const Icon = config.icon;
                return (
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: config.color }} strokeWidth={1.5} />
                  </div>
                );
              }
              return <span className="text-5xl">{scenarioIcon}</span>;
            })()}
            <div>
              <h2 className="text-lg font-semibold text-white/80">
                {scenarioTitle}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-white/40">
                {t.dashboard.chat.startConversation.replace("{language}", languageName)}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {getSuggestions(scenarioId).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/70"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#5353ff]/80 text-white"
                      : "bg-white/[0.06] text-white/85 border border-white/5"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5 text-white/30">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">{t.dashboard.chat.writing}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.04] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t.dashboard.chat.writeIn.replace("{language}", languageName)}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 focus:border-[#5353ff]/50 focus:outline-none focus:ring-1 focus:ring-[#5353ff]/30"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5353ff] text-white transition-all hover:bg-[#4343ef] disabled:opacity-30 disabled:hover:bg-[#5353ff]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mx-auto mt-1.5 max-w-2xl text-[10px] text-white/20">
          {t.dashboard.chat.shiftEnter}
        </p>
      </div>
    </div>
  );
}

// Starter suggestions based on scenario
function getSuggestions(scenarioId: string): string[] {
  const map: Record<string, string[]> = {
    restaurant: [
      "Hello, table for two please",
      "Do you have a menu?",
      "What do you recommend?",
    ],
    "hotel-checkin": [
      "Hi, I have a reservation",
      "I'd like to check in",
      "Do you have any rooms available?",
    ],
    shopping: [
      "Excuse me, where can I find...?",
      "How much does this cost?",
      "Do you have this in another size?",
    ],
    directions: [
      "Excuse me, how do I get to...?",
      "Is there a station nearby?",
      "Can you show me on a map?",
    ],
    doctor: [
      "I don't feel well",
      "I have a headache",
      "I'd like to make an appointment",
    ],
    "job-interview": [
      "Good morning, I'm here for the interview",
      "Thank you for having me",
      "I'd like to tell you about my experience",
    ],
    debate: [
      "What do you think about...?",
      "I'd like to discuss...",
      "In my opinion...",
    ],
    negotiation: [
      "Let's discuss the terms",
      "What's your best price?",
      "I have a proposal",
    ],
  };
  return map[scenarioId] ?? ["Hello!", "Hi, how are you?", "Let's start!"];
}
