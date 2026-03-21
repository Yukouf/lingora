"use client";

import { useState, useCallback, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  lang?: string; // BCP47 language tag: "en-US", "es-ES", "fr-FR", etc.
  rate?: number; // Speed: 0.5 - 2, default 0.9
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Map language codes to BCP47 tags (for Web Speech API fallback)
const langMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  zh: "zh-CN",
  ko: "ko-KR",
  ru: "ru-RU",
  it: "it-IT",
  pt: "pt-BR",
  ar: "ar-SA",
};

// In-memory audio cache: keyed by "lang:text"
const audioCache = new Map<string, ArrayBuffer>();

export function SpeakButton({
  text,
  lang = "en",
  rate = 0.9,
  size = "md",
  className = "",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Fallback: use browser Web Speech API */
  const speakWithWebSpeech = useCallback(() => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] ?? lang;
    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const targetLang = langMap[lang] ?? lang;
    const voice = voices.find((v) =>
      v.lang.startsWith(targetLang.split("-")[0])
    );
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }, [text, lang, rate]);

  /** Primary: use OpenAI TTS via /api/tts */
  const speak = useCallback(async () => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const cacheKey = `${lang}:${text}`;

    // Check cache first
    const cached = audioCache.get(cacheKey);
    if (cached) {
      const blob = new Blob([cached], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.play().catch(() => {
        setSpeaking(false);
        speakWithWebSpeech();
      });
      return;
    }

    // Fetch from API
    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });

      if (!res.ok) {
        throw new Error(`TTS API error: ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      audioCache.set(cacheKey, arrayBuffer);

      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => {
        setLoading(false);
        setSpeaking(true);
      };
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
        speakWithWebSpeech();
      };
      await audio.play();
    } catch {
      setLoading(false);
      // Fallback to Web Speech API
      speakWithWebSpeech();
    }
  }, [text, lang, speakWithWebSpeech]);

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      onClick={speak}
      type="button"
      disabled={loading}
      aria-label={
        loading
          ? "Chargement audio"
          : speaking
            ? "En cours de lecture"
            : "Ecouter la prononciation"
      }
      className={`flex items-center justify-center rounded-full transition-all ${
        loading
          ? "bg-[#5353ff]/20 text-[#818cf8] animate-pulse"
          : speaking
            ? "bg-[#5353ff]/30 text-[#818cf8] scale-110"
            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
      } ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : speaking ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
}
