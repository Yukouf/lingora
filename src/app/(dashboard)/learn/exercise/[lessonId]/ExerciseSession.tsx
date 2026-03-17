"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Star, Zap, Home, RotateCcw, Layers } from "lucide-react";
import Link from "next/link";
import ExerciseRenderer from "@/components/learn/ExerciseRenderer";

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

export default function ExerciseSession({
  lesson,
  chapter,
  language,
  exercises,
  lessonId,
}: ExerciseSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());

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
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalExercises]);

  // Calculate final results
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const correctCount = scores.filter((s) => s >= 60).length;
  const stars = avgScore >= 90 ? 3 : avgScore >= 70 ? 2 : avgScore >= 50 ? 1 : 0;

  if (isFinished) {
    return (
      <div className="mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.4)]"
          >
            <Trophy className="h-12 w-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Leçon terminée !
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#7e8590] mb-8"
          >
            {chapter.icon} {lesson.title}
          </motion.p>

          {/* Stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: star <= stars ? 1 : 0.6,
                  rotate: 0,
                  opacity: star <= stars ? 1 : 0.2,
                }}
                transition={{ delay: 0.7 + star * 0.15, type: "spring" }}
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= stars
                      ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                      : "text-white/20"
                  }`}
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
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
              <div className="text-xs text-white/40">Bonnes réponses</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-blue-400">{totalExercises}</div>
              <div className="text-xs text-white/40">Exercices</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">{avgScore}%</div>
              <div className="text-xs text-white/40">Score moyen</div>
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
              Le vocabulaire de cette leçon a été ajouté à tes <Link href="/practice/flashcards" className="text-pink-400 hover:text-pink-300 underline">flashcards</Link> pour révision
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
              className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Retour
            </Link>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScores([]);
                setIsFinished(false);
              }}
              className="flex-1 py-3 rounded-2xl bg-[#5353ff] hover:bg-[#6b6bff] text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Recommencer
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/learn/${chapter.id}`}
            className="flex items-center gap-2 text-sm text-[#7e8590] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {chapter.icon} {chapter.title}
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-[#5353ff]" />
            <span className="text-white font-medium">{currentIndex + 1}</span>
            <span className="text-[#7e8590]">/ {totalExercises}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#5353ff] to-[#bd89ff]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        {currentExercise && (
          <ExerciseRenderer
            key={currentExercise.id}
            exercise={currentExercise as any}
            onAnswer={handleAnswer}
            onNext={handleNext}
            languageCode={language.code}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
