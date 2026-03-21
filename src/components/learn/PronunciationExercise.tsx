"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, MessageSquare } from "lucide-react";
import { SpeakButton } from "@/components/ui/speak-button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useI18n } from "@/lib/i18n/context";

interface PronunciationExerciseProps {
  targetText: string;
  hint?: string;
  languageCode: string;
  exerciseId?: string;
  onAnswer: (correct: boolean, score: number) => void;
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

export default function PronunciationExercise({
  targetText,
  hint,
  languageCode,
  exerciseId,
  onAnswer,
}: PronunciationExerciseProps) {
  const { t } = useI18n();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error: speechError,
  } = useSpeechRecognition(languageCode);

  const [result, setResult] = useState<EvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!transcript.trim()) return;

    setIsEvaluating(true);
    setError(null);

    try {
      const res = await fetch("/api/pronunciation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetText,
          spokenText: transcript.trim(),
          languageCode,
          exerciseId,
        }),
      });

      if (!res.ok) {
        throw new Error("Evaluation failed");
      }

      const data = await res.json();
      const evalResult: EvalResult = {
        score: data.data.score,
        feedback: data.data.feedback,
        wordDiff: data.data.wordDiff ?? [],
      };
      setResult(evalResult);
      onAnswer(evalResult.score >= 60, Math.round(evalResult.score));
    } catch {
      setError("Failed to evaluate pronunciation");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

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

  if (!isSupported) {
    return (
      <div className="text-center py-8">
        <MicOff className="h-12 w-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60 text-sm">{t.dashboard.exercise.notSupported}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-white/50 uppercase tracking-wider font-medium">
          {t.dashboard.exercise.pronunciation}
        </p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-semibold text-white">{targetText}</p>
          <SpeakButton text={targetText} lang={languageCode} size="md" />
        </div>
        {hint && (
          <p className="text-sm text-white/40 italic">{hint}</p>
        )}
      </div>

      {/* Microphone button */}
      {!result && (
        <div className="flex flex-col items-center gap-4">
          <motion.button
            onClick={handleToggleMic}
            whileTap={{ scale: 0.95 }}
            className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? "bg-rose-500/30 border-2 border-rose-400/60 text-rose-300"
                : "bg-white/[0.06] border-2 border-white/10 text-white/60 hover:bg-white/[0.1] hover:text-white/80"
            }`}
          >
            {isListening && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-rose-400/40"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-rose-400/30"
                  animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
              </>
            )}
            <Mic className="h-8 w-8 relative z-10" />
          </motion.button>

          <p className="text-sm text-white/40">
            {isListening ? t.dashboard.exercise.listening : t.dashboard.exercise.tapToSpeak}
          </p>
        </div>
      )}

      {/* Real-time transcript */}
      <AnimatePresence>
        {transcript && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
          >
            <p className="text-sm text-white/40 mb-1">{t.dashboard.exercise.speakNow}</p>
            <p className="text-white/90">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluate button */}
      {transcript && !isListening && !result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="px-6 py-3 rounded-xl bg-[#5353ff]/20 border border-[#5353ff]/40 text-[#818cf8] font-medium hover:bg-[#5353ff]/30 transition-all disabled:opacity-50"
          >
            {isEvaluating ? "..." : t.dashboard.exercise.validate}
          </button>
        </motion.div>
      )}

      {/* Error */}
      {(error || speechError) && (
        <p className="text-sm text-red-400 text-center">{error || speechError}</p>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score display */}
            <div className={`p-5 rounded-2xl border text-center ${getScoreBg(result.score)}`}>
              <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {Math.round(result.score)}%
              </p>
              <p className="text-sm text-white/60 mt-1">{t.dashboard.exercise.score}</p>
              <p className={`text-sm font-medium mt-2 ${getScoreColor(result.score)}`}>
                {getScoreLabel(result.score)}
              </p>
            </div>

            {/* Word-level diff */}
            {result.wordDiff.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-xs font-medium text-white/40 mb-2">
                  Analyse mot par mot
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.wordDiff.map((wd, i) => (
                    <span
                      key={i}
                      className={`rounded-md px-2 py-1 text-sm ${getWordDiffColor(wd.status)} ${
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
              </div>
            )}

            {/* AI Feedback */}
            {result.feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl bg-[#5353ff]/10 border border-[#5353ff]/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-[#818cf8]" />
                  <p className="text-sm font-medium text-[#818cf8]">
                    {t.dashboard.exercise.aiFeedback}
                  </p>
                </div>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{result.feedback}</p>
              </motion.div>
            )}

            {/* Retry */}
            <div className="flex justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 hover:text-white/80 hover:bg-white/[0.1] transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                {t.dashboard.exercise.tryAgainPronunciation}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
