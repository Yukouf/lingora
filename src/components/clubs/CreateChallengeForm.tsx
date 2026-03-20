"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

interface CreateChallengeFormProps {
  clubId: string;
  onCreated: () => void;
  onCancel: () => void;
}

const challengeTypes = [
  "FLASHCARDS_REVIEWED",
  "LESSONS_COMPLETED",
  "CONVERSATIONS_HELD",
  "EXERCISES_DONE",
  "PRACTICE_MINUTES",
] as const;

const typeLabelsMap: Record<string, Record<string, string>> = {
  FLASHCARDS_REVIEWED: { fr: "Flashcards révisées", en: "Flashcards Reviewed" },
  LESSONS_COMPLETED: { fr: "Leçons terminées", en: "Lessons Completed" },
  CONVERSATIONS_HELD: { fr: "Conversations tenues", en: "Conversations Held" },
  EXERCISES_DONE: { fr: "Exercices faits", en: "Exercises Done" },
  PRACTICE_MINUTES: { fr: "Minutes de pratique", en: "Practice Minutes" },
};

export function CreateChallengeForm({
  clubId,
  onCreated,
  onCancel,
}: CreateChallengeFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("EXERCISES_DONE");
  const [target, setTarget] = useState(10);
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !target) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${clubId}/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, target, startsAt, endsAt }),
      });

      if (res.ok) {
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
        {t.dashboard.clubs.createChallenge}
      </h3>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.dashboard.clubs.clubName}
          className={inputClass}
          required
        />
      </div>

      <div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.dashboard.clubs.clubDesc}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-white/30">{t.dashboard.clubs.challengeType ?? "Type"}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            {challengeTypes.map((ct) => (
              <option key={ct} value={ct} className="bg-[#0f0f14] text-white">
                {typeLabelsMap[ct]?.en || ct}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/30">
            {t.dashboard.clubs.target}
          </label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            min={1}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-white/30">{t.dashboard.clubs.startDate ?? "Start"}</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/30">{t.dashboard.clubs.endDate ?? "End"}</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30 disabled:opacity-50"
        >
          {loading ? t.dashboard.common.loading : t.dashboard.clubs.create}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.08]"
        >
          {t.dashboard.common.cancel}
        </button>
      </div>
    </form>
  );
}
