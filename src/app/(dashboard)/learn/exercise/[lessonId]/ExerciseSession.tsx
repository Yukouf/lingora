"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Star, Zap, Home, RotateCcw, Layers } from "lucide-react";
import Link from "next/link";
import ExerciseRenderer from "@/components/learn/ExerciseRenderer";
import { useI18n } from "@/lib/i18n/context";
import { playLevelUpSound } from "@/lib/sounds";

interface ExerciseData {
  id: string;
  type: string;
  question: Record<string, unknown>;
  order: number;
  completed: boolean;
  score: number | null;
}

interface ExerciseSessionProps {
  lesson: { id: string; title: string; description: string | null };
  chapter: { id: string; title: string; icon: string | null };
  language: { code: string; name: string; flag: string };
  exercises: ExerciseData[];
  lessonId: string;
}

// Map exercise type keys to short French labels for the overview
const exerciseTypeShortLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Choix multiple",
  FILL_IN_BLANK: "Compléter",
  TRANSLATION: "Traduction",
  LISTENING: "Écoute",
  MATCHING: "Associer",
  DIALOGUE_COMPLETE: "Dialogue",
  CONTEXT_GUESS: "Deviner",
  SPOT_ERROR: "Corriger",
  REORDER: "Remettre en ordre",
  WRITING: "Écriture",
  FREE_PRODUCTION: "Production libre",
  PRONUNCIATION: "Prononciation",
};

export default function ExerciseSession({
  lesson,
  chapter,
  language,
  exercises,
  lessonId,
}: ExerciseSessionProps) {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [showOverview, setShowOverview] = useState(true);

  // Auto-dismiss overview after 2 seconds
  useEffect(() => {
    if (showOverview) {
      const timer = setTimeout(() => setShowOverview(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showOverview]);

  // Compute exercise type counts for overview
  const exerciseTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ex of exercises) {
      counts[ex.type] = (counts[ex.type] || 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      label: exerciseTypeShortLabels[type] || type,
    }));
  }, [exercises]);

  const totalExercises = exercises.length;
  const progress = totalExercises > 0 ? ((currentIndex) / totalExercises) * 100 : 0;
  const currentExercise = exercises[currentIndex];

  const handleAnswer = useCallback(
    async (correct: boolean, score: number) => {
      setScores((prev) => [...prev, score]);

      // Save progress to server
      try {
        await fetch("/api/learn/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: currentExercise.id,
            lessonId,
            score,
            timeSpent: Math.floor((Date.now() - startTime) / 1000),
          }),
        });
      } catch (e) {
        console.error("Failed to save progress:", e);
      }
    },
    [currentExercise, lessonId, startTime]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalExercises) {
      setIsFinished(true);
      // Auto-generate flashcards from lesson vocabulary
      fetch("/api/flashcards/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      }).catch(() => {});
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalExercises, lessonId]);

  // Calculate final results
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const correctCount = scores.filter((s) => s >= 60).length;
  const stars = avgScore >= 90 ? 3 : avgScore >= 70 ? 2 : avgScore >= 50 ? 1 : 0;

  // Play level-up sound when lesson is completed
  const levelUpPlayed = useRef(false);
  useEffect(() => {
    if (isFinished && !levelUpPlayed.current) {
      levelUpPlayed.current = true;
      playLevelUpSound();
    }
  }, [isFinished]);

  // Dynamic progress bar color: blue -> green -> gold
  const progressColor = progress < 40
    ? "from-blue-500 to-cyan-400"
    : progress < 75
    ? "from-cyan-400 to-emerald-400"
    : "from-emerald-400 to-amber-400";

  if (isFinished) {
    return (
      <div className="mx-auto max-w-lg">
        <style>{`
          @keyframes completion-confetti {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) rotate(var(--dr)); opacity: 0; }
          }
          @keyframes trophy-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.2); }
            50% { box-shadow: 0 0 40px rgba(251,191,36,0.4); }
          }
          @keyframes star-sparkle {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.4); }
          }
          @keyframes score-pop {
            0% { transform: scale(0.3); opacity: 0; }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Completion confetti */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${
                ["bg-amber-400", "bg-emerald-400", "bg-pink-400", "bg-blue-400", "bg-violet-400", "bg-cyan-400"][i % 6]
              } ${i % 3 === 0 ? "rounded-full" : "rounded-sm"}`}
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: "-5%",
                "--dx": `${Math.random() * 100 - 50}px`,
                "--dy": `${800 + Math.random() * 400}px`,
                "--dr": `${Math.random() * 1080}deg`,
                animation: `completion-confetti ${2 + Math.random() * 2}s linear ${Math.random() * 1}s forwards`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center"
            style={{ animation: "trophy-glow 2s ease-in-out infinite" }}
          >
            <Trophy className="h-12 w-12 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-2"
          >
            {t.dashboard.exercise.lessonComplete}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 mb-6"
          >
            {chapter.icon} {lesson.title}
          </motion.p>

          {/* Big animated score */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 150 }}
            className="mb-6"
          >
            <div
              className="text-6xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
              style={{ animation: "score-pop 0.6s ease-out 0.55s both" }}
            >
              {avgScore}%
            </div>
          </motion.div>

          {/* Stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -30 }}
                animate={{
                  scale: star <= stars ? 1 : 0.6,
                  opacity: star <= stars ? 1 : 0.2,
                  rotate: 0,
                }}
                transition={{ delay: 0.7 + star * 0.2, type: "spring", stiffness: 200, damping: 12 }}
              >
                <Star
                  className={`h-12 w-12 ${
                    star <= stars
                      ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                      : "text-white/20"
                  }`}
                  style={star <= stars ? { animation: "star-sparkle 2s ease-in-out infinite", animationDelay: `${star * 0.3}s` } : undefined}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-3 gap-2 sm:gap-4 mb-8"
          >
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
              <div className="text-xs text-white/40">{t.dashboard.exercise.correctAnswers}</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{totalExercises}</div>
              <div className="text-xs text-white/40">{t.dashboard.exercise.exercises}</div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{avgScore}%</div>
              <div className="text-xs text-white/40">{t.dashboard.exercise.avgScore}</div>
            </div>
          </motion.div>

          {/* Flashcard notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-6 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-3"
          >
            <Layers className="h-5 w-5 text-pink-400 shrink-0" />
            <p className="text-sm text-white/60">
              {t.dashboard.exercise.vocabAdded} <Link href="/practice/flashcards" className="text-pink-400 hover:text-pink-300 underline">{t.dashboard.exercise.flashcardsLink}</Link> {t.dashboard.exercise.forReview}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex gap-3"
          >
            <Link
              href={`/learn/${chapter.id}`}
              className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              {t.dashboard.exercise.home}
            </Link>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScores([]);
                setIsFinished(false);
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              {t.dashboard.exercise.restart}
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <style>{`
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Top bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/learn/${chapter.id}`}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {chapter.icon} {chapter.title}
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-white font-bold">{currentIndex + 1}</span>
            <span className="text-white/40">/ {totalExercises}</span>
          </div>
        </div>

        {/* Animated gradient progress bar */}
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              animation: "progress-pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Lesson overview flash */}
      <AnimatePresence>
        {showOverview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
            <p className="text-white/40 text-sm mb-6">{exercises.length} exercices</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exerciseTypeCounts.map(({ type, count, label }) => (
                <span
                  key={type}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/10 text-white/70"
                >
                  {count}x {label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        {!showOverview && currentExercise && (
          <ExerciseRenderer
            key={currentExercise.id}
            exercise={currentExercise as any}
            onAnswer={handleAnswer}
            onNext={handleNext}
            languageCode={language.code}
            chapterTitle={chapter.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
