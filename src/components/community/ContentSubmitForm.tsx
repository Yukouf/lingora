"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface FlashcardPair {
  front: string;
  back: string;
}

interface DialogueLine {
  speaker: string;
  text: string;
}

interface ContentSubmitFormProps {
  onSubmit: (data: {
    type: string;
    title: string;
    description: string;
    languageCode: string;
    level: string;
    content: unknown;
  }) => void;
  isLoading?: boolean;
}

export function ContentSubmitForm({ onSubmit, isLoading }: ContentSubmitFormProps) {
  const { t } = useI18n();
  const tc = t.dashboard.community;

  const [type, setType] = useState("LESSON");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [level, setLevel] = useState("A1");

  // LESSON: rich text body
  const [lessonBody, setLessonBody] = useState("");

  // FLASHCARD_PACK: list of pairs
  const [flashcards, setFlashcards] = useState<FlashcardPair[]>([
    { front: "", back: "" },
  ]);

  // DIALOGUE: list of speaker/text
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    { speaker: "", text: "" },
  ]);

  // EXERCISE_SET: JSON textarea
  const [exerciseJson, setExerciseJson] = useState("[]");

  const [showPreview, setShowPreview] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Espanol" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "ru", label: "Russian" },
    { code: "ko", label: "Korean" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "French" },
  ];

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  function buildContent(): unknown {
    switch (type) {
      case "LESSON":
        return { body: lessonBody };
      case "FLASHCARD_PACK":
        return { cards: flashcards.filter((c) => c.front.trim() && c.back.trim()) };
      case "DIALOGUE":
        return { lines: dialogueLines.filter((l) => l.speaker.trim() && l.text.trim()) };
      case "EXERCISE_SET":
        try {
          return JSON.parse(exerciseJson);
        } catch {
          return [];
        }
      default:
        return {};
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      type,
      title,
      description,
      languageCode,
      level,
      content: buildContent(),
    });
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30 transition-colors";

  const selectClass =
    "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[#a78bfa]/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">
          {tc.contentType}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={selectClass}
        >
          <option value="LESSON">{tc.lessons}</option>
          <option value="DIALOGUE">{tc.dialogues}</option>
          <option value="FLASHCARD_PACK">{tc.flashcardPacks}</option>
          <option value="EXERCISE_SET">{tc.exerciseSets}</option>
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">
          {tc.contentTitle}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          required
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">
          {tc.contentDesc}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          rows={3}
        />
      </div>

      {/* Language + Level row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">
            {tc.filterByLanguage}
          </label>
          <select
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className={`${selectClass} w-full`}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">
            {tc.contentLevel}
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={`${selectClass} w-full`}
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content body — varies by type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">
          {tc.contentBody}
        </label>

        {type === "LESSON" && (
          <textarea
            value={lessonBody}
            onChange={(e) => setLessonBody(e.target.value)}
            className={`${inputClass} min-h-[200px] resize-y`}
            rows={8}
          />
        )}

        {type === "FLASHCARD_PACK" && (
          <div className="space-y-3">
            {flashcards.map((card, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Front"
                  value={card.front}
                  onChange={(e) => {
                    const copy = [...flashcards];
                    copy[i] = { ...copy[i], front: e.target.value };
                    setFlashcards(copy);
                  }}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="text"
                  placeholder="Back"
                  value={card.back}
                  onChange={(e) => {
                    const copy = [...flashcards];
                    copy[i] = { ...copy[i], back: e.target.value };
                    setFlashcards(copy);
                  }}
                  className={`${inputClass} flex-1`}
                />
                {flashcards.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFlashcards(flashcards.filter((_, j) => j !== i))
                    }
                    className="rounded-lg p-2 text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFlashcards([...flashcards, { front: "", back: "" }])
              }
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/10 px-4 py-2 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tc.addPair}
            </button>
          </div>
        )}

        {type === "DIALOGUE" && (
          <div className="space-y-3">
            {dialogueLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Speaker"
                  value={line.speaker}
                  onChange={(e) => {
                    const copy = [...dialogueLines];
                    copy[i] = { ...copy[i], speaker: e.target.value };
                    setDialogueLines(copy);
                  }}
                  className={`${inputClass} w-32`}
                />
                <input
                  type="text"
                  placeholder="Text"
                  value={line.text}
                  onChange={(e) => {
                    const copy = [...dialogueLines];
                    copy[i] = { ...copy[i], text: e.target.value };
                    setDialogueLines(copy);
                  }}
                  className={`${inputClass} flex-1`}
                />
                {dialogueLines.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDialogueLines(dialogueLines.filter((_, j) => j !== i))
                    }
                    className="rounded-lg p-2 text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setDialogueLines([...dialogueLines, { speaker: "", text: "" }])
              }
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/10 px-4 py-2 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tc.addPair}
            </button>
          </div>
        )}

        {type === "EXERCISE_SET" && (
          <textarea
            value={exerciseJson}
            onChange={(e) => setExerciseJson(e.target.value)}
            className={`${inputClass} min-h-[200px] resize-y font-mono text-xs`}
            rows={8}
            placeholder="[{ ... }]"
          />
        )}
      </div>

      {/* Preview toggle */}
      {showPreview && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="mb-2 text-sm font-medium text-white/60">{tc.preview}</h4>
          <pre className="max-h-60 overflow-auto text-xs text-white/50 whitespace-pre-wrap">
            {JSON.stringify(
              { type, title, description, languageCode, level, content: buildContent() },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-colors"
        >
          {tc.preview}
        </button>
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="rounded-xl bg-[#a78bfa] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 hover:bg-[#9575f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t.dashboard.common.loading : tc.publish}
        </button>
      </div>
    </form>
  );
}
