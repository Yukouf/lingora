"use client";

import { useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  lang?: string; // BCP47 language tag: "en-US", "es-ES", "fr-FR", etc.
  rate?: number; // Speed: 0.5 - 2, default 0.9
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Map language codes to BCP47 tags
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

export function SpeakButton({
  text,
  lang = "en",
  rate = 0.9,
  size = "md",
  className = "",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] ?? lang;
    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    // Try to find a voice for this language
    const voices = window.speechSynthesis.getVoices();
    const targetLang = langMap[lang] ?? lang;
    const voice = voices.find((v) => v.lang.startsWith(targetLang.split("-")[0]));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }, [text, lang, rate]);

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
      aria-label={speaking ? "En cours de lecture" : "Ecouter la prononciation"}
      className={`flex items-center justify-center rounded-full transition-all ${
        speaking
          ? "bg-[#5353ff]/30 text-[#818cf8] scale-110"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
      } ${sizeClasses[size]} ${className}`}
    >
      {speaking ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
}
