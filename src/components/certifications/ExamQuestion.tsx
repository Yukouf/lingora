"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

interface ExamQuestionProps {
  index: number;
  total: number;
  question: {
    id: string;
    type: "mcq" | "writing";
    question: string;
    options?: string[];
  };
  answer: string;
  onAnswer: (value: string) => void;
}

export function ExamQuestion({
  index,
  total,
  question,
  answer,
  onAnswer,
}: ExamQuestionProps) {
  const { t } = useI18n();
  const cert = t.dashboard.certifications;

  return (
    <div className="space-y-6">
      {/* Question number */}
      <div className="flex items-center gap-2 text-sm text-white/50">
        <span className="rounded-md bg-[#a78bfa]/20 px-2 py-0.5 text-[#a78bfa] font-medium">
          {cert.question} {index + 1}
        </span>
        <span>
          {cert.of} {total}
        </span>
      </div>

      {/* Question text */}
      <p className="text-lg font-medium text-white leading-relaxed">
        {question.question}
      </p>

      {/* MCQ options */}
      {question.type === "mcq" && question.options && (
        <div className="space-y-3">
          {question.options.map((option, optIdx) => (
            <button
              key={optIdx}
              onClick={() => onAnswer(option)}
              className={cn(
                "w-full rounded-xl border px-5 py-4 text-left text-[15px] transition-all",
                answer === option
                  ? "border-[#a78bfa] bg-[#a78bfa]/15 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/8"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    answer === option
                      ? "border-[#a78bfa] bg-[#a78bfa] text-white"
                      : "border-white/20 text-white/50"
                  )}
                >
                  {String.fromCharCode(65 + optIdx)}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Writing input */}
      {question.type === "writing" && (
        <textarea
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="..."
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:border-[#a78bfa]/50 focus:outline-none focus:ring-1 focus:ring-[#a78bfa]/30 resize-none"
        />
      )}
    </div>
  );
}
