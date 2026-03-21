"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  CheckCircle2,
  Globe,
  GraduationCap,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string;
}

interface PlacementQuestion {
  id: number;
  level: string;
  type: string;
  question: string;
  options?: string[];
  hint?: string;
}

type Step = "language" | "choice" | "test" | "result";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("language");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{
    recommendedLevel: string;
    totalCorrect: number;
    totalQuestions: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load languages
  useEffect(() => {
    fetch("/api/languages")
      .then((r) => r.json())
      .then((j) => setLanguages(j.data ?? []))
      .catch(console.error);
  }, []);

  // Select language
  function handleSelectLanguage(lang: Language) {
    setSelectedLang(lang);
    setStep("choice");
  }

  // Start as beginner (A1)
  async function handleBeginner() {
    if (!selectedLang) return;
    setSaving(true);
    try {
      await fetch("/api/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId: selectedLang.id, level: "A1" }),
      });
      router.push("/learn");
    } catch {
      console.error("Error saving language");
    } finally {
      setSaving(false);
    }
  }

  // Start placement test
  async function handleStartTest() {
    if (!selectedLang) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/placement-test?lang=${selectedLang.code}`);
      const json = await res.json();
      setQuestions(json.data ?? []);
      setCurrentQ(0);
      setAnswers({});
      setStep("test");
    } catch {
      console.error("Error loading test");
    } finally {
      setLoading(false);
    }
  }

  // Answer question
  function handleAnswer(questionId: number, answer: string) {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((prev) => prev + 1);
      } else {
        // Submit test
        submitTest(newAnswers);
      }
    }, 600);
  }

  // Submit test
  async function submitTest(finalAnswers: Record<number, string>) {
    if (!selectedLang) return;
    setLoading(true);
    try {
      const res = await fetch("/api/placement-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: selectedLang.code, answers: finalAnswers }),
      });
      const json = await res.json();
      setResult(json.data);
      setStep("result");
    } catch {
      console.error("Error submitting test");
    } finally {
      setLoading(false);
    }
  }

  // Save result and go to learn
  async function handleAcceptLevel(level: string) {
    if (!selectedLang) return;
    setSaving(true);
    try {
      await fetch("/api/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId: selectedLang.id, level }),
      });
      router.push("/learn");
    } catch {
      console.error("Error saving language");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-0 py-8">
      <AnimatePresence mode="wait">
        {/* Step 1: Choose language */}
        {step === "language" && (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5353ff]/20 mx-auto mb-4">
                <Globe className="h-8 w-8 text-[#818cf8]" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t.dashboard.onboarding.chooseLanguage}</h1>
              <p className="text-white/40 mt-2">{t.dashboard.onboarding.chooseLanguageDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang)}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#5353ff]/40 transition-all group flex flex-col items-center text-center"
                >
                  <span className="text-4xl mb-2" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <span className="font-medium text-white group-hover:text-white/80 transition-colors text-sm">
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Beginner or test? */}
        {step === "choice" && selectedLang && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <button
              onClick={() => setStep("language")}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.dashboard.onboarding.changeLanguage}
            </button>

            <div className="text-center mb-8">
              <span className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/50 inline-block mb-3">
                {selectedLang.code}
              </span>
              <h1 className="text-2xl font-bold text-white">{selectedLang.name}</h1>
              <p className="text-white/40 mt-2">{t.dashboard.onboarding.whatLevel}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBeginner}
                disabled={saving}
                className="w-full p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20">
                      <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{t.dashboard.onboarding.beginner}</h3>
                      <p className="text-sm text-white/50">{t.dashboard.onboarding.beginnerDesc}</p>
                    </div>
                  </div>
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  )}
                </div>
              </button>

              <button
                onClick={handleStartTest}
                disabled={loading}
                className="w-full p-5 rounded-2xl border border-[#5353ff]/30 bg-[#5353ff]/10 hover:bg-[#5353ff]/15 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5353ff]/20">
                      <GraduationCap className="h-6 w-6 text-[#818cf8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{t.dashboard.onboarding.hasBasics}</h3>
                      <p className="text-sm text-white/50">{t.dashboard.onboarding.hasBasicsDesc}</p>
                    </div>
                  </div>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Placement test */}
        {step === "test" && questions.length > 0 && (
          <motion.div
            key="test"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/40">{t.dashboard.onboarding.placementTest}</span>
                <span className="text-white/60 font-medium">
                  {currentQ + 1}/{questions.length}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white/60"
                  animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-[#818cf8] bg-[#5353ff]/20 px-2 py-0.5 rounded-full">
                        {questions[currentQ].level}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-white mt-3">
                      {questions[currentQ].question}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {questions[currentQ].options?.map((option) => {
                      const isSelected = answers[questions[currentQ].id] === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswer(questions[currentQ].id, option)}
                          disabled={!!answers[questions[currentQ].id]}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-[#5353ff] bg-[#5353ff]/20 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:border-white/20"
                          } disabled:cursor-default`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-[#5353ff] bg-[#5353ff]"
                                  : "border-white/20"
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* Step 4: Result */}
        {step === "result" && result && selectedLang && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
                className="mx-auto mb-6 w-24 h-24 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center"
              >
                <span className="text-3xl font-bold text-white">{result.recommendedLevel}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2">
                  {t.dashboard.onboarding.yourLevel} {result.recommendedLevel}
                </h1>
                <p className="text-white/40">
                  {result.totalCorrect}/{result.totalQuestions} {t.dashboard.onboarding.correctAnswers}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 space-y-3"
              >
                <button
                  onClick={() => handleAcceptLevel(result.recommendedLevel)}
                  disabled={saving}
                  className="w-full py-3 rounded-2xl bg-[#5353ff] hover:bg-[#6b6bff] text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {t.dashboard.onboarding.startAtLevel} {result.recommendedLevel}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleAcceptLevel("A1")}
                  disabled={saving}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-medium transition-all"
                >
                  {t.dashboard.onboarding.restartA1}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
