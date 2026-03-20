"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { ExamTimer } from "@/components/certifications/ExamTimer";
import { ExamQuestion } from "@/components/certifications/ExamQuestion";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

interface Question {
  id: string;
  type: "mcq" | "writing";
  question: string;
  options?: string[];
}

interface QuestionResult {
  questionIndex: number;
  correct: boolean;
  score: number;
  maxPoints: number;
  userAnswer: string;
  correctAnswer: string;
}

interface ExamResult {
  certificationId: string;
  score: number;
  passed: boolean;
  passScore: number;
  questionResults: QuestionResult[];
  timeExpired: boolean;
}

export default function ExamSessionPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);
  const { t } = useI18n();
  const cert = t.dashboard.certifications;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificationId, setCertificationId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [durationMin, setDurationMin] = useState(0);
  const [startedAt, setStartedAt] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Start or resume exam
  useEffect(() => {
    async function startExam() {
      try {
        const res = await fetch(`/api/certifications/start/${examId}`, {
          method: "POST",
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        setCertificationId(data.data.certificationId);
        setQuestions(data.data.questions);
        setDurationMin(data.data.durationMin);
        setStartedAt(data.data.startedAt);
      } catch {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    startExam();
  }, [examId]);

  const handleSubmit = useCallback(async () => {
    if (!certificationId || submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const res = await fetch(`/api/certifications/submit/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, certificationId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setResult(data.data);
    } catch {
      setError("Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  }, [certificationId, answers, examId, submitting]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentIndex.toString()]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#a78bfa]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push("/certifications")}
          className="text-[#a78bfa] hover:underline text-sm"
        >
          {t.dashboard.common.back}
        </button>
      </div>
    );
  }

  // Results screen
  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          {result.passed ? (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-400">
                {cert.congratulations}
              </h1>
            </>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-red-400">
                {cert.notPassed}
              </h1>
              <p className="text-white/50">{cert.tryAgainLater}</p>
            </>
          )}
        </div>

        {/* Score */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/50 text-sm mb-1">{cert.yourScore}</p>
          <p className={cn(
            "text-4xl font-bold",
            result.passed ? "text-emerald-400" : "text-red-400"
          )}>
            {result.score}%
          </p>
          <p className="text-white/40 text-sm mt-1">
            {cert.passScore}: {result.passScore}%
          </p>
        </div>

        {/* Question results */}
        {result.questionResults && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{cert.results}</h2>
            {result.questionResults.map((qr, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg border p-4",
                  qr.correct
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {qr.correct ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="text-white/70">
                      {cert.question} {i + 1} — {qr.score}/{qr.maxPoints}
                    </p>
                    {!qr.correct && (
                      <p className="text-white/40">
                        {t.dashboard.exercise.correctAnswer} {qr.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push("/certifications")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 hover:bg-white/5"
          >
            {t.dashboard.common.back}
          </button>
          {result.passed && (
            <button
              onClick={() =>
                router.push(`/certifications/certificate/${result.certificationId}`)
              }
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-amber-400"
            >
              {cert.viewCertificate}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Exam session
  const allAnswered = questions.every(
    (_, i) => answers[i.toString()]?.trim()
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/certifications")}
          className="flex items-center gap-1 text-sm text-white/40 hover:text-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.dashboard.common.back}
        </button>
        <ExamTimer
          durationMin={durationMin}
          startedAt={startedAt}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Question navigation dots */}
      <div className="flex items-center gap-2 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-8 w-8 rounded-full text-xs font-medium transition-all",
              i === currentIndex
                ? "bg-[#a78bfa] text-white"
                : answers[i.toString()]?.trim()
                  ? "bg-[#a78bfa]/20 text-[#a78bfa]"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      {questions[currentIndex] && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <ExamQuestion
            index={currentIndex}
            total={questions.length}
            question={questions[currentIndex]}
            answer={answers[currentIndex.toString()] ?? ""}
            onAnswer={setAnswer}
          />
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5 disabled:opacity-30"
        >
          &larr;
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="rounded-lg bg-[#a78bfa]/20 px-5 py-2 text-sm font-medium text-[#a78bfa] hover:bg-[#a78bfa]/30"
          >
            {t.dashboard.exercise.next} &rarr;
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!allAnswered}
            className="rounded-lg bg-[#a78bfa] px-5 py-2 text-sm font-medium text-white hover:bg-[#9171e8] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cert.submitExam}
          </button>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-white/10 bg-[#1a1625] p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {cert.confirmSubmit}
            </h3>
            <p className="text-sm text-white/50">
              {cert.confirmSubmitDesc}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
              >
                {t.dashboard.common.cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-[#a78bfa] px-5 py-2 text-sm font-medium text-white hover:bg-[#9171e8] disabled:opacity-50"
              >
                {submitting ? t.dashboard.common.loading : cert.submitExam}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
