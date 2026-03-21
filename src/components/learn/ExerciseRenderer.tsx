"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
  ArrowRight,
  Shuffle,
  MessageCircle,
  PenTool,
  Search,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Mic,
} from "lucide-react";
import { SpeakButton } from "@/components/ui/speak-button";
import PronunciationExercise from "@/components/learn/PronunciationExercise";
import { useI18n } from "@/lib/i18n/context";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

/** Fisher-Yates (Knuth) shuffle — returns a new shuffled array */
function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Color themes for each exercise type
const exerciseThemes: Record<string, { bg: string; border: string; accent: string; glow: string; icon: React.ReactNode; label: string }> = {
  MULTIPLE_CHOICE: {
    bg: "from-blue-500/15 to-blue-600/5",
    border: "border-blue-500/30",
    accent: "bg-blue-500",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.2)]",
    icon: <HelpCircle className="h-5 w-5" />,
    label: "Choix multiple",
  },
  FILL_IN_BLANK: {
    bg: "from-cyan-500/15 to-teal-600/5",
    border: "border-cyan-500/30",
    accent: "bg-cyan-500",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.2)]",
    icon: <PenTool className="h-5 w-5" />,
    label: "Compl\u00e9ter",
  },
  TRANSLATION: {
    bg: "from-purple-500/15 to-violet-600/5",
    border: "border-purple-500/30",
    accent: "bg-purple-500",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.2)]",
    icon: <Shuffle className="h-5 w-5" />,
    label: "Traduction",
  },
  LISTENING: {
    bg: "from-amber-500/15 to-orange-600/5",
    border: "border-amber-500/30",
    accent: "bg-amber-500",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.2)]",
    icon: <Volume2 className="h-5 w-5" />,
    label: "\u00c9coute",
  },
  WRITING: {
    bg: "from-violet-500/15 to-purple-600/5",
    border: "border-violet-500/30",
    accent: "bg-violet-500",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.2)]",
    icon: <PenTool className="h-5 w-5" />,
    label: "\u00c9criture",
  },
  REORDER: {
    bg: "from-emerald-500/15 to-green-600/5",
    border: "border-emerald-500/30",
    accent: "bg-emerald-500",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.2)]",
    icon: <Shuffle className="h-5 w-5" />,
    label: "Remettre en ordre",
  },
  MATCHING: {
    bg: "from-pink-500/15 to-rose-600/5",
    border: "border-pink-500/30",
    accent: "bg-pink-500",
    glow: "shadow-[0_0_40px_rgba(236,72,153,0.2)]",
    icon: <Sparkles className="h-5 w-5" />,
    label: "Associer",
  },
  CONTEXT_GUESS: {
    bg: "from-indigo-500/15 to-blue-600/5",
    border: "border-indigo-500/30",
    accent: "bg-indigo-500",
    glow: "shadow-[0_0_40px_rgba(99,102,241,0.2)]",
    icon: <Lightbulb className="h-5 w-5" />,
    label: "Deviner le sens",
  },
  SPOT_ERROR: {
    bg: "from-red-500/15 to-rose-600/5",
    border: "border-red-500/30",
    accent: "bg-red-500",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.2)]",
    icon: <Search className="h-5 w-5" />,
    label: "Trouver l'erreur",
  },
  DIALOGUE_COMPLETE: {
    bg: "from-green-500/15 to-emerald-600/5",
    border: "border-green-500/30",
    accent: "bg-green-500",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.2)]",
    icon: <MessageCircle className="h-5 w-5" />,
    label: "Dialogue",
  },
  FREE_PRODUCTION: {
    bg: "from-pink-500/15 to-fuchsia-600/5",
    border: "border-pink-500/30",
    accent: "bg-pink-500",
    glow: "shadow-[0_0_40px_rgba(236,72,153,0.2)]",
    icon: <Sparkles className="h-5 w-5" />,
    label: "Production libre",
  },
  PRONUNCIATION: {
    bg: "from-rose-500/15 to-pink-600/5",
    border: "border-rose-500/30",
    accent: "bg-rose-500",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.2)]",
    icon: <Mic className="h-5 w-5" />,
    label: "Prononciation",
  },
};

interface ExerciseQuestionRaw {
  text?: string;
  options?: string[];
  correct_answer?: string;
  correctAnswer?: string | number;
  hint?: string;
  hints?: string[];
  audio_url?: string;
  image_url?: string;
  context?: string;
  sentence_with_error?: string;
  correct_sentence?: string;
  correctSentence?: string;
  error_explanation?: string;
  errorExplanation?: string;
  errorWord?: string;
  correctWord?: string;
  correct_word?: string;
  explanation?: string;
  dialogue?: Array<{ speaker: string; text: string }>;
  blank_position?: string;
  blankPosition?: string;
  prompt?: string;
  instruction?: string;
  criteria?: string[];
  evaluationCriteria?: string[];
  words_to_order?: string[];
  wordsToOrder?: string[];
  pairs?: Array<{ left: string; right: string }>;
  word_to_guess?: string;
  targetWord?: string;
  sentence_with_word?: string;
  sentenceWithWord?: string;
  direction?: string;
}

// ---- Fuzzy matching utilities ----

/** Remove all punctuation from a string (periods, commas, apostrophes, quotes, etc.) */
function removePunctuation(s: string): string {
  return s.replace(/[.,!?;:'"''""«»\-—–…()[\]{}/\\@#$%^&*_+=<>~`|]/g, "");
}

/** Remove diacritics/accents from a string */
function removeAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Compute Levenshtein distance between two strings */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Normalize a string for comparison: lowercase, trim, remove punctuation, remove diacritics, collapse spaces */
function normalizeForComparison(s: string): string {
  return removeAccents(removePunctuation(s.toLowerCase().trim())).replace(/\s+/g, " ").trim();
}

/**
 * Fuzzy match for translation exercises.
 * Returns a score: 100 (exact), 80 (minor typo, levenshtein <= 2), 70 (keyword match 80%+), 0 (wrong).
 */
function fuzzyMatchTranslation(userAnswer: string, expected: string): { isCorrect: boolean; score: number } {
  const normUser = normalizeForComparison(userAnswer);
  const normExpected = normalizeForComparison(expected);

  // Exact match after normalization
  if (normUser === normExpected) return { isCorrect: true, score: 100 };

  // Minor typo: Levenshtein distance <= 2
  const dist = levenshteinDistance(normUser, normExpected);
  if (dist <= 2) return { isCorrect: true, score: 80 };

  // Keyword match: check word overlap ratio
  const expectedWords = normExpected.split(/\s+/).filter(Boolean);
  if (expectedWords.length > 0) {
    const userWords = new Set(normUser.split(/\s+/).filter(Boolean));
    const matchCount = expectedWords.filter((w) => userWords.has(w)).length;
    const matchRatio = matchCount / expectedWords.length;
    if (matchRatio >= 0.8) return { isCorrect: true, score: 70 };
    if (matchRatio >= 0.7) return { isCorrect: true, score: 60 };
  }

  return { isCorrect: false, score: 0 };
}

/**
 * Fuzzy match for fill-in-blank exercises.
 * Returns a score: 100 (exact), 90 (1 char typo), 75 (2 char typo), 0 (wrong).
 * Strips accents and punctuation for comparison.
 */
function fuzzyMatchFillInBlank(userAnswer: string, expected: string): { isCorrect: boolean; score: number } {
  const normUser = normalizeForComparison(userAnswer);
  const normExpected = normalizeForComparison(expected);

  if (normUser === normExpected) return { isCorrect: true, score: 100 };

  const dist = levenshteinDistance(normUser, normExpected);
  if (dist <= 1) return { isCorrect: true, score: 90 };
  if (dist <= 2) return { isCorrect: true, score: 75 };

  return { isCorrect: false, score: 0 };
}

// Normalize seed data (camelCase + index) to renderer format (snake_case + string)
function normalizeQuestion(raw: ExerciseQuestionRaw): ExerciseQuestion {
  const options = raw.options ?? [];
  let correctAnswer = raw.correct_answer ?? "";
  // If correctAnswer is a number (index), resolve it from options
  const rawCA = raw.correctAnswer;
  if (typeof rawCA === "number" && options[rawCA]) {
    correctAnswer = options[rawCA];
  } else if (typeof rawCA === "string" && !correctAnswer) {
    correctAnswer = rawCA;
  }
  // For SPOT_ERROR, fall back to correctWord / correct_word if correct_answer is empty
  if (!correctAnswer) {
    const cw = raw.correctWord ?? raw.correct_word;
    if (cw) correctAnswer = cw;
  }

  return {
    text: raw.text ?? raw.instruction ?? "",
    options,
    correct_answer: correctAnswer,
    hints: raw.hints ?? (raw.hint ? [raw.hint] : []),
    audio_url: raw.audio_url,
    image_url: raw.image_url,
    context: raw.context,
    sentence_with_error: raw.sentence_with_error,
    correct_sentence: raw.correct_sentence ?? raw.correctSentence,
    error_explanation: raw.error_explanation ?? raw.errorExplanation ?? raw.explanation,
    errorWord: raw.errorWord,
    dialogue: raw.dialogue,
    blank_position: raw.blank_position ?? raw.blankPosition,
    prompt: raw.prompt,
    instruction: raw.instruction,
    criteria: raw.criteria ?? raw.evaluationCriteria,
    words_to_order: raw.words_to_order ?? raw.wordsToOrder,
    pairs: raw.pairs,
    word_to_guess: raw.word_to_guess ?? raw.targetWord,
    sentence_with_word: raw.sentence_with_word ?? raw.sentenceWithWord ?? raw.context,
    direction: raw.direction,
  };
}

interface ExerciseQuestion {
  text: string;
  options: string[];
  correct_answer: string;
  hints: string[];
  audio_url?: string;
  image_url?: string;
  context?: string;
  sentence_with_error?: string;
  correct_sentence?: string;
  error_explanation?: string;
  errorWord?: string;
  dialogue?: Array<{ speaker: string; text: string }>;
  blank_position?: string;
  prompt?: string;
  instruction?: string;
  criteria?: string[];
  words_to_order?: string[];
  pairs?: Array<{ left: string; right: string }>;
  word_to_guess?: string;
  sentence_with_word?: string;
  direction?: string;
}

interface ExerciseData {
  id: string;
  type: string;
  question: ExerciseQuestionRaw;
  order: number;
}

// BCP-47 language code mapping for TTS
const ttsLangMap: Record<string, string> = {
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

// Module-level audio cache for TTS (persists across renders)
const ttsAudioCache = new Map<string, ArrayBuffer>();

/** Fallback: speak using browser Web Speech API */
function speakWithWebSpeech(text: string, langCode: string): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const bcp47 = ttsLangMap[langCode] ?? langCode;
  utterance.lang = bcp47;
  utterance.rate = 0.85;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const langPrefix = bcp47.split("-")[0];
  const voice = voices.find((v) => v.lang.startsWith(langPrefix));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text aloud using OpenAI TTS API, with Web Speech API fallback.
 * Used for auto-speaking correct answers after exercise completion.
 */
function speakText(text: string, langCode: string, delay = 300): void {
  if (typeof window === "undefined" || !text) return;

  setTimeout(async () => {
    // Stop any ongoing speech
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const cacheKey = `${langCode}:${text}`;

    try {
      let audioBuffer = ttsAudioCache.get(cacheKey);

      if (!audioBuffer) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, lang: langCode }),
        });

        if (!res.ok) throw new Error(`TTS error: ${res.status}`);

        audioBuffer = await res.arrayBuffer();
        ttsAudioCache.set(cacheKey, audioBuffer);
      }

      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        speakWithWebSpeech(text, langCode);
      };
      await audio.play();
    } catch {
      // Fallback to Web Speech API
      speakWithWebSpeech(text, langCode);
    }
  }, delay);
}

interface ExerciseRendererProps {
  exercise: ExerciseData;
  onAnswer: (correct: boolean, score: number) => void;
  onNext: () => void;
  languageCode?: string;
}

// CSS-only confetti burst component
function ConfettiBurst() {
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: -(Math.random() * 180 + 60),
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.4,
      delay: Math.random() * 0.3,
      duration: Math.random() * 0.6 + 0.8,
      color: [
        "bg-emerald-400", "bg-green-400", "bg-teal-400",
        "bg-yellow-400", "bg-amber-400", "bg-sky-400",
        "bg-pink-400", "bg-violet-400", "bg-cyan-400",
        "bg-lime-400", "bg-rose-400", "bg-blue-400",
      ][i % 12],
      shape: i % 3,
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      <style>{`
        @keyframes confetti-burst {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(var(--cx), var(--cy)) rotate(var(--cr)) scale(var(--cs)); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute left-1/2 top-1/2 ${p.color} ${
            p.shape === 0 ? "rounded-full w-2 h-2" : p.shape === 1 ? "rounded-sm w-2.5 h-2.5" : "rounded-sm w-3 h-1.5"
          }`}
          style={{
            "--cx": `${p.x}px`,
            "--cy": `${p.y}px`,
            "--cr": `${p.rotation}deg`,
            "--cs": p.scale,
            animation: `confetti-burst ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function ExerciseRenderer({ exercise, onAnswer, onNext, languageCode = "en" }: ExerciseRendererProps) {
  const { t } = useI18n();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  // Trigger confetti on correct, shake on wrong
  useEffect(() => {
    if (showResult && isCorrect) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
    if (showResult && !isCorrect) {
      setShakeCard(true);
      const timer = setTimeout(() => setShakeCard(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showResult, isCorrect]);

  const baseTheme = exerciseThemes[exercise.type] || exerciseThemes.MULTIPLE_CHOICE;
  const exerciseTypeLabels: Record<string, string> = {
    MULTIPLE_CHOICE: t.dashboard.exerciseTypes.multipleChoice,
    FILL_IN_BLANK: t.dashboard.exerciseTypes.fillInBlank,
    TRANSLATION: t.dashboard.exerciseTypes.translation,
    LISTENING: t.dashboard.exerciseTypes.listening,
    WRITING: t.dashboard.exerciseTypes.freeProduction,
    REORDER: t.dashboard.exerciseTypes.reorder,
    MATCHING: t.dashboard.exerciseTypes.matching,
    CONTEXT_GUESS: t.dashboard.exerciseTypes.contextGuess,
    SPOT_ERROR: t.dashboard.exerciseTypes.spotError,
    DIALOGUE_COMPLETE: t.dashboard.exerciseTypes.dialogueComplete,
    FREE_PRODUCTION: t.dashboard.exerciseTypes.freeProduction,
    PRONUNCIATION: t.dashboard.exerciseTypes.pronunciation,
  };
  const exerciseInstructions: Record<string, string> = {
    MULTIPLE_CHOICE: "Sélectionne la bonne réponse",
    FILL_IN_BLANK: "Complète avec le mot manquant",
    TRANSLATION: "Traduis cette expression",
    LISTENING: "Écoute et choisis la bonne réponse",
    MATCHING: "Relie chaque mot à sa traduction",
    DIALOGUE_COMPLETE: "Complète le dialogue",
    CONTEXT_GUESS: "Devine le sens du mot en contexte",
    SPOT_ERROR: "Trouve et corrige l'erreur",
    REORDER: "Remets les mots dans le bon ordre",
    WRITING: "Écris ta réponse en quelques phrases",
    FREE_PRODUCTION: "Écris ta réponse en quelques phrases",
    PRONUNCIATION: "Prononce la phrase à voix haute",
  };
  const theme = { ...baseTheme, label: exerciseTypeLabels[exercise.type] || baseTheme.label };
  const q = normalizeQuestion(exercise.question);

  // Shuffle options once per exercise (Fisher-Yates) for types that display options
  const shuffledOptions = useMemo(
    () => fisherYatesShuffle(q.options?.filter(Boolean) ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise.id],
  );

  // Shuffle right column for matching exercises once per exercise
  const shuffledMatchingIndices = useMemo(
    () => fisherYatesShuffle((q.pairs || []).map((_, i) => i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise.id],
  );

  const resetState = () => {
    setSelectedAnswer(null);
    setTextInput("");
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setReorderedWords([]);
    setAvailableWords([]);
    setShowConfetti(false);
    setShakeCard(false);
  };

  const checkAnswer = (answer: string, mode: "translation" | "fill_in_blank" | "spot_error" | "exact" = "exact") => {
    let textToSpeak = "";
    let answeredCorrectly = false;

    if (mode === "spot_error") {
      // For SPOT_ERROR: check if the user's answer contains the correct word (normalized)
      const normalizedAnswer = normalizeForComparison(answer ?? "");
      const correctWord = normalizeForComparison(q.correct_answer ?? "");
      const correct = correctWord !== "" && normalizedAnswer.includes(correctWord);
      answeredCorrectly = correct;
      setIsCorrect(correct);
      setShowResult(true);
      onAnswer(correct, correct ? 100 : 0);
      // Speak the correct sentence
      textToSpeak = q.correct_sentence || q.correct_answer || "";
    } else if (mode === "translation") {
      const result = fuzzyMatchTranslation(answer, q.correct_answer ?? "");
      answeredCorrectly = result.isCorrect;
      setIsCorrect(result.isCorrect);
      setShowResult(true);
      onAnswer(result.isCorrect, result.score);
      // For translation: speak the original text (target language)
      textToSpeak = q.text || "";
    } else if (mode === "fill_in_blank") {
      const result = fuzzyMatchFillInBlank(answer, q.correct_answer ?? "");
      answeredCorrectly = result.isCorrect;
      setIsCorrect(result.isCorrect);
      setShowResult(true);
      onAnswer(result.isCorrect, result.score);
      // Speak the correct answer word/phrase
      textToSpeak = q.correct_answer || "";
    } else {
      const normAnswer = normalizeForComparison(answer ?? "");
      const normExpected = normalizeForComparison(q.correct_answer ?? "");
      const correct = normAnswer === normExpected;
      answeredCorrectly = correct;
      setIsCorrect(correct);
      setShowResult(true);
      onAnswer(correct, correct ? 100 : 0);

      // Determine what to speak based on exercise type
      if (exercise.type === "DIALOGUE_COMPLETE") {
        textToSpeak = q.correct_answer || "";
      } else if (exercise.type === "CONTEXT_GUESS") {
        textToSpeak = q.word_to_guess || q.correct_answer || "";
      } else if (exercise.type === "REORDER") {
        textToSpeak = q.correct_answer || answer;
      } else {
        // MULTIPLE_CHOICE, LISTENING, etc. — speak the correct answer
        textToSpeak = q.correct_answer || "";
      }
    }

    // Play sound effect immediately (ding for correct, buzz for wrong)
    if (answeredCorrectly) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // Auto-speak the correct answer after 150ms delay (sound effect first, then TTS)
    if (textToSpeak) {
      speakText(textToSpeak, languageCode, 150);
    }
  };

  const handleNext = () => {
    resetState();
    onNext();
  };

  // ====== MULTIPLE CHOICE ======
  const renderMultipleChoice = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-2 mb-6">
        <p className="text-lg font-medium text-white">{q.text}</p>
        <SpeakButton text={q.text} lang={languageCode} size="sm" className="mt-0.5 shrink-0" />
      </div>
      <div className="grid gap-3">
        {shuffledOptions.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const showCorrectness = showResult;
          const optionIsCorrect = (option ?? "").toLowerCase().trim() === (q.correct_answer ?? "").toLowerCase().trim();

          return (
            <motion.button
              key={i}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => {
                if (showResult) return;
                setSelectedAnswer(option);
                checkAnswer(option);
              }}
              className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                showCorrectness && optionIsCorrect
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                  : showCorrectness && isSelected && !optionIsCorrect
                  ? "border-red-400 bg-red-500/20 text-red-300"
                  : isSelected
                  ? `${theme.border} bg-white/10`
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  showCorrectness && optionIsCorrect
                    ? "bg-emerald-500 text-white"
                    : showCorrectness && isSelected && !optionIsCorrect
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-base">{option}</span>
                {showCorrectness && optionIsCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </motion.div>
                )}
                {showCorrectness && isSelected && !optionIsCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ====== FILL IN BLANK ======
  const renderFillInBlank = () => {
    const parts = q.text.split("___");
    return (
      <div className="space-y-6">
        <div className="text-lg font-medium text-white">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className="inline-block mx-1 px-3 py-1 rounded-lg bg-blue-500/20 border-2 border-blue-400/40 border-dashed min-w-[60px] sm:min-w-[100px] text-center">
                  {showResult ? (
                    <span className={isCorrect ? "text-emerald-400" : "text-red-400"}>
                      {textInput || q.correct_answer}
                    </span>
                  ) : textInput ? (
                    <span className="text-blue-300">{textInput}</span>
                  ) : (
                    <span className="text-blue-300/40">???</span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        {!showResult && (
          <div className="flex gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && textInput && checkAnswer(textInput, "fill_in_blank")}
              placeholder="Tape ta réponse..."
              className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/60 transition-colors"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => textInput && checkAnswer(textInput, "fill_in_blank")}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium transition-colors"
            >
              Valider
            </motion.button>
          </div>
        )}

        {showResult && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <p className="text-sm text-emerald-300">
              <span className="font-medium">Bonne réponse :</span> {q.correct_answer}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  // ====== TRANSLATION ======
  const renderTranslation = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
        <p className="text-xs text-emerald-400 mb-1 uppercase tracking-wide font-medium">Traduire</p>
        <div className="flex items-start gap-2">
          <p className="text-lg font-medium text-white">{q.text}</p>
          <SpeakButton text={q.text} lang={languageCode} size="sm" className="mt-0.5 shrink-0" />
        </div>
      </div>

      {!showResult ? (
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Écris ta traduction..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60 transition-colors min-h-[80px] resize-none"
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => textInput && checkAnswer(textInput, "translation")}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors"
          >
            Vérifier ma traduction
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          <p className="text-xs text-white/40 mb-1 uppercase tracking-wide">Réponse attendue</p>
          <p className="text-base text-emerald-300">{q.correct_answer}</p>
        </motion.div>
      )}
    </div>
  );

  // ====== LISTENING ======
  const renderListening = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        {q.audio_url ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)]"
            onClick={() => {
              const audio = new Audio(q.audio_url!);
              audio.play();
            }}
          >
            <Volume2 className="h-8 w-8 text-white" />
          </motion.button>
        ) : (
          <SpeakButton text={q.text} lang={languageCode} size="lg" className="w-20 h-20 !rounded-full bg-gradient-to-br from-amber-400 to-orange-500 !text-white shadow-[0_0_40px_rgba(245,158,11,0.4)]" />
        )}
        <p className="text-sm text-amber-300/60">Clique pour écouter</p>
      </div>

      {showResult ? (
        <p className="text-lg font-medium text-white text-center">{q.text}</p>
      ) : (
        <p className="text-sm text-amber-300/80 text-center italic">Écoute attentivement et choisis la bonne réponse</p>
      )}

      <div className="grid gap-3">
        {shuffledOptions.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const showCorrectness = showResult;
          const optionIsCorrect = (option ?? "").toLowerCase().trim() === (q.correct_answer ?? "").toLowerCase().trim();

          return (
            <motion.button
              key={i}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => {
                if (showResult) return;
                setSelectedAnswer(option);
                checkAnswer(option);
              }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                showCorrectness && optionIsCorrect
                  ? "border-emerald-400 bg-emerald-500/20"
                  : showCorrectness && isSelected && !optionIsCorrect
                  ? "border-red-400 bg-red-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30"
              }`}
            >
              <span className="text-base text-white">{option}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ====== REORDER ======
  const renderReorder = () => {
    // Initialize available words on first render
    if (availableWords.length === 0 && reorderedWords.length === 0 && q.words_to_order) {
      const shuffled = fisherYatesShuffle(q.words_to_order);
      setAvailableWords(shuffled);
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-start gap-2">
          <p className="text-lg font-medium text-white">{q.text}</p>
          <SpeakButton text={q.text} lang={languageCode} size="sm" className="mt-0.5 shrink-0" />
        </div>

        {/* Answer area */}
        <div className="min-h-[60px] p-4 rounded-2xl border-2 border-dashed border-cyan-400/30 bg-cyan-500/5 flex flex-wrap gap-2">
          {reorderedWords.length === 0 && (
            <span className="text-cyan-300/30 text-sm">Clique sur les mots pour former la phrase...</span>
          )}
          {reorderedWords.map((word, i) => (
            <motion.button
              key={`answer-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (showResult) return;
                setReorderedWords((prev) => prev.filter((_, idx) => idx !== i));
                setAvailableWords((prev) => [...prev, word]);
              }}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
            >
              {word}
            </motion.button>
          ))}
        </div>

        {/* Available words */}
        <div className="flex flex-wrap gap-2 justify-center">
          {availableWords.map((word, i) => (
            <motion.button
              key={`word-${i}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (showResult) return;
                setAvailableWords((prev) => prev.filter((_, idx) => idx !== i));
                setReorderedWords((prev) => [...prev, word]);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              {word}
            </motion.button>
          ))}
        </div>

        {!showResult && availableWords.length === 0 && reorderedWords.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => checkAnswer(reorderedWords.join(" "))}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors"
          >
            Vérifier
          </motion.button>
        )}
      </div>
    );
  };

  // ====== MATCHING ======
  const renderMatching = () => {
    const pairs = q.pairs || [];
    const shuffledRight = shuffledMatchingIndices;

    return (
      <div className="space-y-6">
        <p className="text-lg font-medium text-white">{q.text}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left column */}
          <div className="space-y-3">
            {pairs.map((pair, i) => (
              <motion.button
                key={`left-${i}`}
                whileHover={!matchedPairs.has(i) ? { scale: 1.03 } : {}}
                onClick={() => {
                  if (matchedPairs.has(i) || showResult) return;
                  setSelectedLeft(selectedLeft === i ? null : i);
                }}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  matchedPairs.has(i)
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 opacity-60"
                    : selectedLeft === i
                    ? "border-orange-400 bg-orange-500/20 text-orange-200"
                    : "border-white/10 bg-white/5 text-white hover:border-orange-400/30"
                }`}
              >
                <span className="text-sm font-medium">{pair.left}</span>
              </motion.button>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {shuffledRight.map((originalIdx) => {
              const pair = pairs[originalIdx];
              return (
                <motion.button
                  key={`right-${originalIdx}`}
                  whileHover={!matchedPairs.has(originalIdx) ? { scale: 1.03 } : {}}
                  onClick={() => {
                    if (matchedPairs.has(originalIdx) || showResult || selectedLeft === null) return;
                    if (selectedLeft === originalIdx) {
                      // Correct match — play ding and speak the matched pair
                      playCorrectSound();
                      const matchedPair = pairs[originalIdx];
                      if (matchedPair) {
                        speakText(matchedPair.left, languageCode, 100);
                      }
                      setMatchedPairs((prev) => new Set([...prev, originalIdx]));
                      setSelectedLeft(null);
                      if (matchedPairs.size + 1 === pairs.length) {
                        setIsCorrect(true);
                        setShowResult(true);
                        onAnswer(true, 100);
                      }
                    } else {
                      // Wrong match - flash red
                      setSelectedLeft(null);
                    }
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    matchedPairs.has(originalIdx)
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 opacity-60"
                      : "border-white/10 bg-white/5 text-white hover:border-orange-400/30"
                  }`}
                >
                  <span className="text-sm font-medium">{pair.right}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ====== CONTEXT GUESS ======
  const renderContextGuess = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-indigo-400 uppercase tracking-wide font-medium">📖 Contexte</p>
          <SpeakButton text={q.sentence_with_word || q.text} lang={languageCode} size="sm" />
        </div>
        <p className="text-base text-white leading-relaxed">
          {q.sentence_with_word?.split(q.word_to_guess || "").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="px-2 py-0.5 mx-1 rounded-lg bg-indigo-500/30 border border-indigo-400/50 font-bold text-indigo-200">
                  {q.word_to_guess}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      <p className="text-center text-white/60 text-sm">Que signifie ce mot selon le contexte ?</p>

      <div className="grid gap-3">
        {shuffledOptions.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const showCorrectness = showResult;
          const optionIsCorrect = (option ?? "").toLowerCase().trim() === (q.correct_answer ?? "").toLowerCase().trim();

          return (
            <motion.button
              key={i}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => {
                if (showResult) return;
                setSelectedAnswer(option);
                checkAnswer(option);
              }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                showCorrectness && optionIsCorrect
                  ? "border-emerald-400 bg-emerald-500/20"
                  : showCorrectness && isSelected && !optionIsCorrect
                  ? "border-red-400 bg-red-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/30"
              }`}
            >
              <span className="text-base text-white">{option}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ====== SPOT ERROR ======
  const renderSpotError = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-red-400 uppercase tracking-wide font-medium">🔍 Trouve l'erreur</p>
          <SpeakButton text={q.sentence_with_error || q.text} lang={languageCode} size="sm" />
        </div>
        <p className="text-lg text-white font-medium">{q.sentence_with_error || q.text}</p>
      </div>

      {!showResult ? (
        <div className="space-y-3">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && textInput && checkAnswer(textInput, "spot_error")}
            placeholder="Écris la phrase corrigée..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-400/60 transition-colors"
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => textInput && checkAnswer(textInput, "spot_error")}
            className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-medium transition-colors"
          >
            Vérifier ma correction
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-emerald-300">
              <span className="font-medium">Phrase correcte :</span> {q.correct_sentence || q.correct_answer}
            </p>
          </div>
          {q.error_explanation && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70">
                <span className="font-medium text-white">💡 Explication :</span> {q.error_explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ====== DIALOGUE COMPLETE ======
  const renderDialogueComplete = () => (
    <div className="space-y-6">
      <p className="text-sm text-teal-400 uppercase tracking-wide font-medium mb-2">💬 Complète le dialogue</p>

      {/* Dialogue bubbles */}
      <div className="space-y-3">
        {q.dialogue?.map((line, i) => {
          const isBlank = line.text === "___" || line.text.includes("___");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: line.speaker === "A" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex ${line.speaker === "A" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  line.speaker === "A"
                    ? "bg-white/10 rounded-bl-md"
                    : isBlank
                    ? "bg-teal-500/20 border-2 border-dashed border-teal-400/40 rounded-br-md"
                    : "bg-teal-500/20 rounded-br-md"
                }`}
              >
                <p className="text-xs text-white/40 mb-1">{line.speaker === "A" ? "🧑" : "👤"}</p>
                {isBlank && !showResult ? (
                  <span className="text-teal-300/40 text-sm italic">Ta réponse ici...</span>
                ) : isBlank && showResult ? (
                  <span className={isCorrect ? "text-emerald-300" : "text-red-300"}>{textInput || q.correct_answer}</span>
                ) : (
                  <p className="text-sm text-white">{line.text}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!showResult && (
        <div className="flex gap-3">
          {q.options ? (
            <div className="grid gap-2 w-full">
              {shuffledOptions.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedAnswer(opt);
                    setTextInput(opt);
                    checkAnswer(opt);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-teal-500/10 hover:border-teal-400/30 text-white text-sm transition-all"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          ) : (
            <>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && textInput && checkAnswer(textInput)}
                placeholder="Ta réponse..."
                className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 transition-colors"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => textInput && checkAnswer(textInput)}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors"
              >
                Envoyer
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  );

  // ====== WRITING / FREE PRODUCTION ======
  const renderWriting = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl ${
        exercise.type === "FREE_PRODUCTION" ? "bg-pink-500/10 border border-pink-500/30" : "bg-rose-500/10 border border-rose-500/30"
      }`}>
        <p className={`text-xs mb-2 uppercase tracking-wide font-medium ${
          exercise.type === "FREE_PRODUCTION" ? "text-pink-400" : "text-rose-400"
        }`}>
          {exercise.type === "FREE_PRODUCTION" ? "✨ Production libre" : "✍️ Écris dans la langue cible"}
        </p>
        <p className="text-base text-white">{q.prompt || q.text}</p>
      </div>

      {q.criteria && q.criteria.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {q.criteria.map((c, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
              {c}
            </span>
          ))}
        </div>
      )}

      {!showResult ? (
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Écris ta réponse ici..."
            className={`w-full border-2 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors min-h-[120px] resize-none bg-white/5 border-white/10 ${
              exercise.type === "FREE_PRODUCTION" ? "focus:border-pink-400/60" : "focus:border-rose-400/60"
            }`}
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const trimmed = textInput.trim();
              if (trimmed.length >= 3) {
                // Score based on response length
                let writingScore: number;
                if (trimmed.length < 10) {
                  writingScore = 40;
                } else if (trimmed.length < 30) {
                  writingScore = 60;
                } else if (trimmed.length < 80) {
                  writingScore = 80;
                } else {
                  writingScore = 95;
                }
                setIsCorrect(writingScore >= 60);
                setShowResult(true);
                onAnswer(writingScore >= 60, writingScore);
                // Speak the example answer
                if (q.correct_answer) {
                  speakText(q.correct_answer, languageCode);
                }
              }
            }}
            className={`w-full py-3 text-white rounded-xl font-medium transition-colors ${
              exercise.type === "FREE_PRODUCTION"
                ? "bg-pink-500 hover:bg-pink-400"
                : "bg-rose-500 hover:bg-rose-400"
            }`}
          >
            Soumettre
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {textInput.trim().length < 10 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
            >
              <p className="text-sm text-amber-300">Trop court, développe ta réponse</p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <p className="text-xs text-white/40 mb-1 uppercase tracking-wide">Exemple de réponse</p>
            <p className="text-base text-emerald-300">{q.correct_answer}</p>
          </motion.div>
        </div>
      )}
    </div>
  );

  // ====== RENDER EXERCISE BY TYPE ======
  const renderExercise = () => {
    switch (exercise.type) {
      case "MULTIPLE_CHOICE":
        return renderMultipleChoice();
      case "FILL_IN_BLANK":
        return renderFillInBlank();
      case "TRANSLATION":
        return renderTranslation();
      case "LISTENING":
        return renderListening();
      case "WRITING":
      case "FREE_PRODUCTION":
        return renderWriting();
      case "REORDER":
        return renderReorder();
      case "MATCHING":
        return renderMatching();
      case "CONTEXT_GUESS":
        return renderContextGuess();
      case "SPOT_ERROR":
        return renderSpotError();
      case "DIALOGUE_COMPLETE":
        return renderDialogueComplete();
      case "PRONUNCIATION":
        return (
          <PronunciationExercise
            targetText={q.text}
            hint={q.hints?.[0]}
            languageCode={languageCode}
            exerciseId={exercise.id}
            onAnswer={(correct, score) => {
              setIsCorrect(correct);
              setShowResult(true);
              onAnswer(correct, score);
            }}
          />
        );
      default:
        return renderMultipleChoice();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <style>{`
        @keyframes shake-card {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes red-flash {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          30% { box-shadow: 0 0 30px 5px rgba(239,68,68,0.3); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes green-glow-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
          50% { box-shadow: 0 0 40px 8px rgba(16,185,129,0.25); }
          100% { box-shadow: 0 0 20px 4px rgba(16,185,129,0.1); }
        }
        @keyframes scale-bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Exercise type badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide border-l-[3px] bg-white/5 ${theme.border} text-white/80`}>
          {theme.label}
        </div>
        <p className="text-sm text-white/50 mt-2">{exerciseInstructions[exercise.type] || ""}</p>
      </motion.div>

      {/* Exercise content card */}
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`relative p-6 sm:p-8 rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.bg} backdrop-blur-xl ${theme.glow} transition-shadow duration-500`}
        style={{
          animation: shakeCard
            ? "shake-card 0.5s ease-in-out, red-flash 0.6s ease-out"
            : showResult && isCorrect
            ? "green-glow-pulse 1s ease-out forwards"
            : "none",
        }}
      >
        {/* Confetti overlay */}
        {showConfetti && <ConfettiBurst />}

        {renderExercise()}

        {/* Hint button */}
        {q.hints && q.hints.length > 0 && !showResult && (
          <motion.button
            onClick={() => setShowHint(!showHint)}
            className="mt-5 flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? t.dashboard.exercise.hideHint : t.dashboard.exercise.showHint}
          </motion.button>
        )}

        <AnimatePresence>
          {showHint && q.hints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
            >
              <p className="text-sm text-yellow-200">{q.hints[0]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result feedback + Next button */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Feedback banner */}
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 backdrop-blur-sm ${
                isCorrect
                  ? "bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-red-500/15 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
              }`}
              style={{
                animation: isCorrect ? "scale-bounce-in 0.4s ease-out" : "none",
              }}
            >
              {isCorrect ? (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-emerald-300 text-base">{t.dashboard.exercise.excellent}</p>
                    <p className="text-sm text-emerald-300/60">{t.dashboard.exercise.keepGoing}</p>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <XCircle className="h-7 w-7 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-red-300 text-base">{t.dashboard.exercise.wrongAnswer}</p>
                    <p className="text-sm text-red-300/60">{t.dashboard.exercise.tryAgain}</p>
                  </div>
                </>
              )}
            </div>

            {/* Next button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isCorrect
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/10 hover:bg-white/15 border border-white/20 text-white"
              }`}
            >
              {t.dashboard.exercise.next}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}