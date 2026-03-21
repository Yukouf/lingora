"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { SpeakButton } from "@/components/ui/speak-button";
import { useI18n } from "@/lib/i18n/context";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  audioUrl: string | null;
  mastery: string;
}

const masteryColors: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  LEARNING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ACQUIRED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  MASTERED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function FlashcardsPage() {
  const { t } = useI18n();

  const masteryLabels: Record<string, string> = {
    NEW: t.dashboard.flashcardLabels.new,
    LEARNING: t.dashboard.flashcardLabels.learning,
    ACQUIRED: t.dashboard.flashcardLabels.acquired,
    MASTERED: t.dashboard.flashcardLabels.mastered,
  };
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sessionDone, setSessionDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [totalCards, setTotalCards] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [addError, setAddError] = useState("");
  const [languageCode, setLanguageCode] = useState("en");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards");
      const json = await res.json();
      if (json.data) {
        setCards(json.data.cards);
        setStats(json.data.stats || {});
        setTotalCards(json.data.total);
        if (json.data.languageCode) setLanguageCode(json.data.languageCode);
      }
    } catch {
      console.error("Failed to fetch flashcards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (Object.keys(results).length / cards.length) * 100 : 0;

  async function handleAnswer(knew: boolean) {
    if (!currentCard || saving) return;
    setSaving(true);

    // quality: knew = 4 (correct with hesitation), !knew = 1 (incorrect but recognized)
    const quality = knew ? 4 : 1;

    try {
      await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: currentCard.id, quality }),
      });
    } catch {
      console.error("Failed to save review");
    }

    setResults((prev) => ({ ...prev, [currentCard.id]: knew }));
    setFlipped(false);
    setSaving(false);

    if (currentIndex + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function resetSession() {
    setCurrentIndex(0);
    setFlipped(false);
    setResults({});
    setSessionDone(false);
    fetchCards();
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    if (!newFront.trim() || !newBack.trim()) {
      setAddError(t.dashboard.flashcardLabels.fillBoth);
      return;
    }

    try {
      const res = await fetch("/api/flashcards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: newFront.trim(), back: newBack.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || t.dashboard.common.error);
        return;
      }

      setNewFront("");
      setNewBack("");
      setShowAddForm(false);
      fetchCards();
    } catch {
      setAddError(t.dashboard.chat.connectionError);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  // Empty state — no cards at all
  if (totalCards === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center pt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
          📇
        </div>
        <h1 className="mt-4 text-xl font-bold text-white/90">{t.dashboard.flashcardLabels.noCards}</h1>
        <p className="mt-2 text-sm text-white/40">
          {t.dashboard.flashcardLabels.noCardsDesc}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/practice"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="mr-1.5 inline h-4 w-4" />
            {t.dashboard.common.back}
          </Link>
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-[#5353ff] px-4 py-2 text-sm text-white transition-colors hover:bg-[#4343ef]"
          >
            <Plus className="mr-1.5 inline h-4 w-4" />
            {t.dashboard.flashcardLabels.addWord}
          </button>
        </div>

        {showAddForm && <AddCardForm
          newFront={newFront}
          newBack={newBack}
          setNewFront={setNewFront}
          setNewBack={setNewBack}
          addError={addError}
          onSubmit={handleAddCard}
          onCancel={() => setShowAddForm(false)}
        />}
      </div>
    );
  }

  // No cards due for review
  if (cards.length === 0 && !sessionDone) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center pt-16 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-xl font-bold text-white/90">{t.dashboard.flashcardLabels.allReviewed}</h1>
        <p className="mt-2 text-sm text-white/40">
          {t.dashboard.flashcardLabels.allReviewedDesc}
        </p>

        {/* Stats */}
        <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:gap-3">
          {Object.entries(masteryLabels).map(([key, label]) => (
            <div
              key={key}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <p className="text-lg font-bold text-white/80">{stats[key] || 0}</p>
              <p className="text-[11px] text-white/30">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/practice"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="mr-1.5 inline h-4 w-4" />
            {t.dashboard.common.back}
          </Link>
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-[#5353ff] px-4 py-2 text-sm text-white transition-colors hover:bg-[#4343ef]"
          >
            <Plus className="mr-1.5 inline h-4 w-4" />
            {t.dashboard.flashcardLabels.addWord}
          </button>
        </div>

        {showAddForm && <AddCardForm
          newFront={newFront}
          newBack={newBack}
          setNewFront={setNewFront}
          setNewBack={setNewBack}
          addError={addError}
          onSubmit={handleAddCard}
          onCancel={() => setShowAddForm(false)}
        />}
      </div>
    );
  }

  // Session complete
  if (sessionDone) {
    const correct = Object.values(results).filter(Boolean).length;
    const total = Object.values(results).length;
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="mx-auto flex max-w-md flex-col items-center pt-12 text-center">
        <div className="text-5xl">{percentage >= 80 ? "🎉" : percentage >= 50 ? "💪" : "📚"}</div>
        <h1 className="mt-4 text-2xl font-bold text-white/90">{t.dashboard.flashcardLabels.sessionDone}</h1>
        <p className="mt-2 text-white/50">
          <span className="text-lg font-bold text-white/80">{correct}</span>/{total} {t.dashboard.flashcardLabels.wordsKnown}
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-white/60 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={resetSession}
            className="flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t.dashboard.flashcardLabels.restart}
          </button>
          <Link
            href="/practice"
            className="flex items-center rounded-lg bg-[#5353ff] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4343ef]"
          >
            {t.dashboard.common.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t.dashboard.common.back}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
            title={t.dashboard.flashcardLabels.addCard}
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="font-mono text-sm text-white/40">
            {currentIndex + 1}/{cards.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-white/60 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Add card form (inline) */}
      {showAddForm && (
        <AddCardForm
          newFront={newFront}
          newBack={newBack}
          setNewFront={setNewFront}
          setNewBack={setNewBack}
          addError={addError}
          onSubmit={handleAddCard}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Flashcard */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (flipped ? "-back" : "-front")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label={flipped ? t.dashboard.common.back : t.dashboard.flashcardLabels.clickToFlip}
              className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:border-white/10"
              onClick={() => setFlipped(!flipped)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(!flipped); } }}
            >
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  masteryColors[currentCard.mastery] || masteryColors.NEW
                }`}
              >
                {masteryLabels[currentCard.mastery] || t.dashboard.flashcardLabels.new}
              </span>

              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-center text-2xl font-semibold text-white/90">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
                <SpeakButton
                  text={flipped ? currentCard.back : currentCard.front}
                  lang={flipped ? "fr" : languageCode}
                  size="sm"
                />
              </div>

              {!flipped && (
                <p className="mt-6 text-xs text-white/25">
                  {t.dashboard.flashcardLabels.clickToFlip}
                </p>
              )}

              {flipped && (
                <p className="mt-4 text-sm text-white/30">
                  {currentCard.front}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Answer buttons */}
      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-50"
            onClick={() => handleAnswer(false)}
            disabled={saving}
          >
            <X className="h-4 w-4" />
            {t.dashboard.flashcardLabels.didntKnow}
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5353ff] py-3 text-sm font-medium text-white transition-all hover:bg-[#4343ef] disabled:opacity-50"
            onClick={() => handleAnswer(true)}
            disabled={saving}
          >
            <Check className="h-4 w-4" />
            {t.dashboard.flashcardLabels.knew}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Inline add card form component
function AddCardForm({
  newFront,
  newBack,
  setNewFront,
  setNewBack,
  addError,
  onSubmit,
  onCancel,
}: {
  newFront: string;
  newBack: string;
  setNewFront: (v: string) => void;
  setNewBack: (v: string) => void;
  addError: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={onSubmit}
      className="mt-4 space-y-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
    >
      <input
        type="text"
        placeholder={t.dashboard.flashcardLabels.wordPlaceholder}
        value={newFront}
        onChange={(e) => setNewFront(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:border-[#5353ff]/50 focus:outline-none"
        autoFocus
      />
      <input
        type="text"
        placeholder={t.dashboard.flashcardLabels.translationPlaceholder}
        value={newBack}
        onChange={(e) => setNewBack(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:border-[#5353ff]/50 focus:outline-none"
      />
      {addError && (
        <p className="text-xs text-red-400">{addError}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-white/40 transition-colors hover:bg-white/5"
        >
          {t.dashboard.common.cancel}
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-[#5353ff] py-2 text-xs text-white transition-colors hover:bg-[#4343ef]"
        >
          {t.dashboard.common.add}
        </button>
      </div>
    </motion.form>
  );
}
