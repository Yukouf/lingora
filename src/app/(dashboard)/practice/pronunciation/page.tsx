"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  Volume2,
  BarChart3,
  Loader2,
  Trophy,
  Target,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { SpeakButton } from "@/components/ui/speak-button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useI18n } from "@/lib/i18n/context";

// ===== Types =====

interface Phrase {
  text: string;
  translation: string;
  difficulty: string;
  tip: string;
}

interface WordDiff {
  word: string;
  status: "correct" | "mispronounced" | "missing" | "extra";
  expected?: string;
}

interface EvalResult {
  score: number;
  feedback: string | null;
  wordDiff: WordDiff[];
}

interface HistoryStats {
  totalAttempts: number;
  avgScore: number;
  perfectCount: number;
}

interface HistoryAttempt {
  id: string;
  targetText: string;
  spokenText: string;
  languageCode: string;
  accuracyScore: number;
  aiFeedback: string | null;
  createdAt: string;
}

// ===== Category config =====

const categories = [
  { id: "general", label: "Quotidien", icon: "💬" },
  { id: "travel", label: "Voyage", icon: "✈️" },
  { id: "work", label: "Travail", icon: "💼" },
  { id: "social", label: "Social", icon: "🤝" },
];

// ===== Component =====

export default function PronunciationPracticePage() {
  const { t } = useI18n();

  // State: language info
  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [languageName, setLanguageName] = useState<string>("");
  const [userLevel, setUserLevel] = useState<string>("A1");
  const [loadingLang, setLoadingLang] = useState(true);

  // State: phrases
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [loadingPhrases, setLoadingPhrases] = useState(false);
  const [category, setCategory] = useState("general");

  // State: evaluation
  const [result, setResult] = useState<EvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State: history
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [history, setHistory] = useState<HistoryAttempt[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // State: session stats
  const [sessionScore, setSessionScore] = useState<number[]>([]);

  // Speech recognition
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error: speechError,
  } = useSpeechRecognition(languageCode ?? "en");

  const currentPhrase = phrases[currentPhraseIndex] ?? null;

  // Fetch user language
  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.language) {
          setLanguageCode(json.data.language.code);
          setLanguageName(json.data.language.name);
          setUserLevel(json.data.currentLevel ?? "A1");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLang(false));
  }, []);

  // Fetch pronunciation history stats
  useEffect(() => {
    if (!languageCode) return;
    fetch(`/api/pronunciation/history?languageCode=${languageCode}&limit=10`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setStats(json.data.stats);
          setHistory(json.data.attempts);
        }
      })
      .catch(() => {});
  }, [languageCode]);

  // Fetch phrases
  const fetchPhrases = useCallback(
    (cat: string) => {
      if (!languageCode) return;
      setLoadingPhrases(true);
      setCurrentPhraseIndex(0);
      setResult(null);
      setSessionScore([]);

      fetch(
        `/api/pronunciation/phrases?languageCode=${languageCode}&level=${userLevel}&category=${cat}`
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.data?.phrases) {
            setPhrases(json.data.phrases);
          }
        })
        .catch(() => setError("Impossible de charger les phrases."))
        .finally(() => setLoadingPhrases(false));
    },
    [languageCode, userLevel]
  );

  useEffect(() => {
    if (languageCode) {
      fetchPhrases(category);
    }
  }, [languageCode, fetchPhrases, category]);

  // Handlers
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setResult(null);
      setError(null);
      startListening();
    }
  };

  const handleEvaluate = async () => {
    if (!transcript.trim() || !currentPhrase) return;

    setIsEvaluating(true);
    setError(null);

    try {
      const res = await fetch("/api/pronunciation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetText: currentPhrase.text,
          spokenText: transcript.trim(),
          languageCode,
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();
      const evalResult: EvalResult = {
        score: data.data.score,
        feedback: data.data.feedback,
        wordDiff: data.data.wordDiff ?? [],
      };
      setResult(evalResult);
      setSessionScore((prev) => [...prev, evalResult.score]);
    } catch {
      setError("Impossible d'évaluer la prononciation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex((i) => i + 1);
      setResult(null);
      setError(null);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    fetchPhrases(cat);
  };

  // Score helpers
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 60) return "text-green-400";
    if (score >= 30) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-emerald-500/20 border-emerald-500/40";
    if (score >= 60) return "bg-green-500/20 border-green-500/40";
    if (score >= 30) return "bg-amber-500/20 border-amber-500/40";
    return "bg-red-500/20 border-red-500/40";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return t.dashboard.exercise.excellent;
    if (score >= 60) return t.dashboard.exercise.keepGoing;
    return t.dashboard.exercise.tryAgain;
  };

  const getWordDiffColor = (status: WordDiff["status"]) => {
    switch (status) {
      case "correct":
        return "text-emerald-400";
      case "mispronounced":
        return "text-red-400 underline decoration-red-400/50 decoration-wavy";
      case "missing":
        return "text-white/20 line-through";
      case "extra":
        return "text-amber-400 italic";
    }
  };

  const avgSessionScore =
    sessionScore.length > 0
      ? Math.round(
          sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length
        )
      : 0;

  // Loading state
  if (loadingLang) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!languageCode) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-white/50">
          Choisis une langue dans l&apos;onboarding pour commencer.
        </p>
        <Link
          href="/onboarding"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.1]"
        >
          Onboarding <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <MicOff className="mx-auto mb-4 h-12 w-12 text-white/30" />
        <p className="text-white/60 text-sm">{t.dashboard.exercise.notSupported}</p>
      </div>
    );
  }

  // Session complete
  const isSessionComplete =
    phrases.length > 0 &&
    currentPhraseIndex === phrases.length - 1 &&
    result !== null;

  return (
    <div className="mx-auto max-w-2xl pb-12">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/practice"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.dashboard.common.back}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t.dashboard.exercise.pronunciation}
            </h1>
            <p className="mt-0.5 text-sm text-white/40">
              {languageName} &middot; {userLevel}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition-all hover:bg-white/[0.06] hover:text-white/80"
          >
            <BarChart3 className="h-4 w-4" />
            Historique
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <p className="text-lg font-bold text-white">{stats.totalAttempts}</p>
            <p className="text-[11px] text-white/30">Essais totaux</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <p className={`text-lg font-bold ${getScoreColor(stats.avgScore)}`}>
              {stats.avgScore}%
            </p>
            <p className="text-[11px] text-white/30">Score moyen</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.perfectCount}</p>
            <p className="text-[11px] text-white/30">Parfaits (90%+)</p>
          </div>
        </div>
      )}

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-sm font-medium text-white/60">
                Derniers essais
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-white/30">Aucun essai pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white/70">
                          {attempt.targetText}
                        </p>
                        <p className="text-[11px] text-white/30">
                          {new Date(attempt.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`ml-3 shrink-0 text-sm font-bold ${getScoreColor(
                          attempt.accuracyScore
                        )}`}
                      >
                        {Math.round(attempt.accuracyScore)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category selector */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm transition-all ${
              category === cat.id
                ? "bg-[#5353ff]/20 border border-[#5353ff]/40 text-[#818cf8]"
                : "border border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.05]"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading phrases */}
      {loadingPhrases && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white/30" />
        </div>
      )}

      {/* Session progress */}
      {!loadingPhrases && phrases.length > 0 && (
        <>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-white/30">
                {currentPhraseIndex + 1} / {phrases.length}
              </span>
              {sessionScore.length > 0 && (
                <span className="text-xs text-white/40">
                  Moyenne : {avgSessionScore}%
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-[#5353ff]/60"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentPhraseIndex + (result ? 1 : 0)) / phrases.length) * 100}%`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Phrase card */}
          {currentPhrase && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhraseIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Target text */}
                <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        currentPhrase.difficulty === "easy"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : currentPhrase.difficulty === "medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {currentPhrase.difficulty === "easy"
                        ? "Facile"
                        : currentPhrase.difficulty === "medium"
                          ? "Moyen"
                          : "Difficile"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-3">
                    <p className="text-2xl font-semibold text-white">
                      {currentPhrase.text}
                    </p>
                    <SpeakButton
                      text={currentPhrase.text}
                      lang={languageCode}
                      size="md"
                    />
                  </div>

                  <p className="mt-2 text-sm text-white/40">
                    {currentPhrase.translation}
                  </p>

                  {currentPhrase.tip && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5353ff]/10 px-3 py-1.5">
                      <Volume2 className="h-3 w-3 text-[#818cf8]" />
                      <p className="text-xs text-[#818cf8]">{currentPhrase.tip}</p>
                    </div>
                  )}
                </div>

                {/* Microphone area */}
                {!result && (
                  <div className="flex flex-col items-center gap-4">
                    <motion.button
                      onClick={handleToggleMic}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
                        isListening
                          ? "border-2 border-rose-400/60 bg-rose-500/30 text-rose-300"
                          : "border-2 border-white/10 bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/80"
                      }`}
                    >
                      {isListening && (
                        <>
                          <motion.span
                            className="absolute inset-0 rounded-full border-2 border-rose-400/40"
                            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                          <motion.span
                            className="absolute inset-0 rounded-full border-2 border-rose-400/30"
                            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeOut",
                              delay: 0.3,
                            }}
                          />
                        </>
                      )}
                      <Mic className="relative z-10 h-8 w-8" />
                    </motion.button>

                    <p className="text-sm text-white/40">
                      {isListening
                        ? t.dashboard.exercise.listening
                        : t.dashboard.exercise.tapToSpeak}
                    </p>
                  </div>
                )}

                {/* Live transcript */}
                <AnimatePresence>
                  {transcript && !result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4"
                    >
                      <p className="mb-1 text-sm text-white/40">
                        {t.dashboard.exercise.speakNow}
                      </p>
                      <p className="text-white/90">{transcript}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Evaluate button */}
                {transcript && !isListening && !result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex justify-center"
                  >
                    <button
                      onClick={handleEvaluate}
                      disabled={isEvaluating}
                      className="rounded-xl border border-[#5353ff]/40 bg-[#5353ff]/20 px-6 py-3 font-medium text-[#818cf8] transition-all hover:bg-[#5353ff]/30 disabled:opacity-50"
                    >
                      {isEvaluating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        t.dashboard.exercise.validate
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Error */}
                {(error || speechError) && (
                  <p className="mt-4 text-center text-sm text-red-400">
                    {error || speechError}
                  </p>
                )}

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 space-y-4"
                    >
                      {/* Score */}
                      <div
                        className={`rounded-2xl border p-5 text-center ${getScoreBg(
                          result.score
                        )}`}
                      >
                        <p
                          className={`text-4xl font-bold ${getScoreColor(
                            result.score
                          )}`}
                        >
                          {Math.round(result.score)}%
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          {t.dashboard.exercise.score}
                        </p>
                        <p
                          className={`mt-2 text-sm font-medium ${getScoreColor(
                            result.score
                          )}`}
                        >
                          {getScoreLabel(result.score)}
                        </p>
                      </div>

                      {/* Word-level diff */}
                      {result.wordDiff.length > 0 && (
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                          <p className="mb-2 text-xs font-medium text-white/40">
                            Analyse mot par mot
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.wordDiff.map((wd, i) => (
                              <span
                                key={i}
                                className={`rounded-md px-2 py-1 text-sm ${getWordDiffColor(
                                  wd.status
                                )} ${
                                  wd.status === "correct"
                                    ? "bg-emerald-500/10"
                                    : wd.status === "mispronounced"
                                      ? "bg-red-500/10"
                                      : wd.status === "missing"
                                        ? "bg-white/[0.03]"
                                        : "bg-amber-500/10"
                                }`}
                                title={
                                  wd.status === "mispronounced"
                                    ? `Attendu : ${wd.expected}`
                                    : wd.status === "missing"
                                      ? "Mot manquant"
                                      : wd.status === "extra"
                                        ? "Mot en trop"
                                        : "Correct"
                                }
                              >
                                {wd.word}
                                {wd.status === "mispronounced" && wd.expected && (
                                  <span className="ml-1 text-[10px] text-white/30">
                                    ({wd.expected})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-4 text-[10px] text-white/30">
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                              Correct
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                              Mal prononcé
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-white/20" />
                              Manquant
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                              En trop
                            </span>
                          </div>
                        </div>
                      )}

                      {/* AI Feedback */}
                      {result.feedback && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="rounded-2xl border border-[#5353ff]/20 bg-[#5353ff]/10 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-[#818cf8]" />
                            <p className="text-sm font-medium text-[#818cf8]">
                              {t.dashboard.exercise.aiFeedback}
                            </p>
                          </div>
                          <p className="whitespace-pre-wrap text-sm text-white/70">
                            {result.feedback}
                          </p>
                        </motion.div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={handleRetry}
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-white/60 transition-all hover:bg-white/[0.1] hover:text-white/80"
                        >
                          <RotateCcw className="h-4 w-4" />
                          {t.dashboard.exercise.tryAgainPronunciation}
                        </button>

                        {currentPhraseIndex < phrases.length - 1 && (
                          <button
                            onClick={handleNext}
                            className="flex items-center gap-2 rounded-xl border border-[#5353ff]/40 bg-[#5353ff]/20 px-5 py-2.5 font-medium text-[#818cf8] transition-all hover:bg-[#5353ff]/30"
                          >
                            {t.dashboard.exercise.next}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Session complete summary */}
          {isSessionComplete && currentPhraseIndex === phrases.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center"
            >
              <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Session terminée !
              </h3>
              <p className="mt-1 text-sm text-white/40">
                {sessionScore.length} phrases pratiquées
              </p>
              <div className="mt-4 flex justify-center gap-6">
                <div>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(
                      avgSessionScore
                    )}`}
                  >
                    {avgSessionScore}%
                  </p>
                  <p className="text-xs text-white/30">Score moyen</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {sessionScore.filter((s) => s >= 85).length}
                  </p>
                  <p className="text-xs text-white/30">Excellents</p>
                </div>
              </div>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => fetchPhrases(category)}
                  className="flex items-center gap-2 rounded-xl border border-[#5353ff]/40 bg-[#5353ff]/20 px-5 py-2.5 font-medium text-[#818cf8] transition-all hover:bg-[#5353ff]/30"
                >
                  <Target className="h-4 w-4" />
                  Nouvelle session
                </button>
                <Link
                  href="/practice"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-white/60 transition-all hover:bg-white/[0.1] hover:text-white/80"
                >
                  {t.dashboard.exercise.home}
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* No phrases loaded */}
      {!loadingPhrases && phrases.length === 0 && !error && (
        <div className="py-20 text-center">
          <Mic className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">
            Aucune phrase disponible. Essaie une autre catégorie.
          </p>
        </div>
      )}
    </div>
  );
}
