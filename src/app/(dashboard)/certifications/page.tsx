"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { ExamCard } from "@/components/certifications/ExamCard";
import { Award, CheckCircle, XCircle } from "lucide-react";

interface Exam {
  id: string;
  languageCode: string;
  level: string;
  title: string;
  description: string | null;
  durationMin: number;
  passScore: number;
  locked: boolean;
  attempts: number;
  bestScore: number;
  passed: boolean;
}

interface HistoryItem {
  id: string;
  examId: string;
  score: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
  exam: {
    languageCode: string;
    level: string;
    title: string;
    passScore: number;
  };
}

export default function CertificationsPage() {
  const { t } = useI18n();
  const cert = t.dashboard.certifications;
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [examsRes, historyRes] = await Promise.all([
          fetch("/api/certifications/exams"),
          fetch("/api/certifications/history"),
        ]);
        const examsData = await examsRes.json();
        const historyData = await historyRes.json();
        setExams(examsData.data ?? []);
        setHistory(historyData.data ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleStart(examId: string) {
    router.push(`/certifications/exam/${examId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#a78bfa]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-7 w-7 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">{cert.title}</h1>
        </div>
        <p className="text-white/50">{cert.subtitle}</p>
      </div>

      {/* Available exams */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          {cert.availableExams}
        </h2>
        {exams.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
            {cert.noExams}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} onStart={handleStart} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          {cert.history}
        </h2>
        {history.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
            {cert.noHistory}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40">
                  <th className="px-4 py-3 font-medium">{cert.date}</th>
                  <th className="px-4 py-3 font-medium">{t.dashboard.common.level}</th>
                  <th className="px-4 py-3 font-medium">{cert.score}</th>
                  <th className="px-4 py-3 font-medium">{cert.status}</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-4 py-3 text-white/60">
                      {new Date(item.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/70">
                        {item.exam.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70 font-medium">
                      {item.score}%
                    </td>
                    <td className="px-4 py-3">
                      {item.passed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          {cert.passed}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                          <XCircle className="h-3 w-3" />
                          {cert.failed}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.passed && (
                        <button
                          onClick={() =>
                            router.push(`/certifications/certificate/${item.id}`)
                          }
                          className="text-xs text-[#a78bfa] hover:underline"
                        >
                          {cert.viewCertificate}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
