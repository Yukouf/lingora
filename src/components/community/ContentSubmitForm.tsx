"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface FlashcardPair {
  front: string;
  back: string;
}

interface DialogueLine {
  speaker: string;
  text: string;
}

interface VocabEntry {
  word: string;
  translation: string;
  example: string;
  context: string;
}

interface ExpressionEntry {
  expression: string;
  meaning: string;
  example: string;
  usage: string;
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

export function ContentSubmitForm({
  onSubmit,
  isLoading,
}: ContentSubmitFormProps) {
  const { t } = useI18n();
  const tc = t.dashboard.community;

  const [type, setType] = useState("VOCABULARY");
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

  // VOCABULARY: list of vocab entries
  const [vocabEntries, setVocabEntries] = useState<VocabEntry[]>([
    { word: "", translation: "", example: "", context: "" },
  ]);

  // EXPRESSION: list of expression entries
  const [expressionEntries, setExpressionEntries] = useState<
    ExpressionEntry[]
  >([{ expression: "", meaning: "", example: "", usage: "" }]);

  // CULTURAL_NOTE: rich text
  const [culturalNote, setCulturalNote] = useState("");

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
    { code: "ar", label: "Arabic" },
  ];

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const contentTypes = [
    { value: "VOCABULARY", label: tc.vocabulary },
    { value: "EXPRESSION", label: tc.expressions },
    { value: "CULTURAL_NOTE", label: tc.culturalNotes },
    { value: "DIALOGUE", label: tc.dialogues },
    { value: "FLASHCARD_PACK", label: tc.flashcardPacks },
    { value: "LESSON", label: tc.lessons },
    { value: "EXERCISE_SET", label: tc.exerciseSets },
  ];

  function buildContent(): unknown {
    switch (type) {
      case "LESSON":
        return { body: lessonBody };
      case "FLASHCARD_PACK":
        return {
          cards: flashcards.filter((c) => c.front.trim() && c.back.trim()),
        };
      case "DIALOGUE":
        return {
          lines: dialogueLines.filter(
            (l) => l.speaker.trim() && l.text.trim()
          ),
        };
      case "EXERCISE_SET":
        try {
          return JSON.parse(exerciseJson);
        } catch {
          return [];
        }
      case "VOCABULARY":
        return {
          entries: vocabEntries.filter((e) => e.word.trim() && e.translation.trim()),
        };
      case "EXPRESSION":
        return {
          entries: expressionEntries.filter(
            (e) => e.expression.trim() && e.meaning.trim()
          ),
        };
      case "CULTURAL_NOTE":
        return { body: culturalNote };
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

  function updateVocabEntry(index: number, field: keyof VocabEntry, value: string) {
    const copy = [...vocabEntries];
    copy[index] = { ...copy[index], [field]: value };
    setVocabEntries(copy);
  }

  function updateExpressionEntry(
    index: number,
    field: keyof ExpressionEntry,
    value: string
  ) {
    const copy = [...expressionEntries];
    copy[index] = { ...copy[index], [field]: value };
    setExpressionEntries(copy);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type selection as visual buttons */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white/60">
          {tc.contentType}
        </label>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setType(ct.value)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                type === ct.value
                  ? "border-[#a78bfa]/40 bg-[#a78bfa]/10 text-[#a78bfa]"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/70"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
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
          placeholder={
            type === "VOCABULARY"
              ? 'ex: "Vocabulaire du restaurant en anglais"'
              : type === "EXPRESSION"
                ? 'ex: "Expressions idiomatiques japonaises"'
                : type === "CULTURAL_NOTE"
                  ? 'ex: "Le keigo : la politesse japonaise"'
                  : ""
          }
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

        {/* VOCABULARY */}
        {type === "VOCABULARY" && (
          <div className="space-y-4">
            {vocabEntries.map((entry, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/30">
                    #{i + 1}
                  </span>
                  {vocabEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setVocabEntries(vocabEntries.filter((_, j) => j !== i))
                      }
                      className="rounded-lg p-1.5 text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={tc.wordOrPhrase}
                    value={entry.word}
                    onChange={(e) => updateVocabEntry(i, "word", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder={tc.translation}
                    value={entry.translation}
                    onChange={(e) =>
                      updateVocabEntry(i, "translation", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <input
                  type="text"
                  placeholder={tc.exampleSentence}
                  value={entry.example}
                  onChange={(e) =>
                    updateVocabEntry(i, "example", e.target.value)
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder={tc.context}
                  value={entry.context}
                  onChange={(e) =>
                    updateVocabEntry(i, "context", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setVocabEntries([
                  ...vocabEntries,
                  { word: "", translation: "", example: "", context: "" },
                ])
              }
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tc.addEntry}
            </button>
          </div>
        )}

        {/* EXPRESSION */}
        {type === "EXPRESSION" && (
          <div className="space-y-4">
            {expressionEntries.map((entry, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/30">
                    #{i + 1}
                  </span>
                  {expressionEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpressionEntries(
                          expressionEntries.filter((_, j) => j !== i)
                        )
                      }
                      className="rounded-lg p-1.5 text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={tc.wordOrPhrase}
                    value={entry.expression}
                    onChange={(e) =>
                      updateExpressionEntry(i, "expression", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder={tc.translation}
                    value={entry.meaning}
                    onChange={(e) =>
                      updateExpressionEntry(i, "meaning", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <input
                  type="text"
                  placeholder={tc.exampleSentence}
                  value={entry.example}
                  onChange={(e) =>
                    updateExpressionEntry(i, "example", e.target.value)
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder={tc.context}
                  value={entry.usage}
                  onChange={(e) =>
                    updateExpressionEntry(i, "usage", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setExpressionEntries([
                  ...expressionEntries,
                  { expression: "", meaning: "", example: "", usage: "" },
                ])
              }
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tc.addEntry}
            </button>
          </div>
        )}

        {/* CULTURAL_NOTE */}
        {type === "CULTURAL_NOTE" && (
          <textarea
            value={culturalNote}
            onChange={(e) => setCulturalNote(e.target.value)}
            className={`${inputClass} min-h-[200px] resize-y`}
            rows={8}
            placeholder={tc.culturalNoteBody}
          />
        )}

        {/* LESSON */}
        {type === "LESSON" && (
          <textarea
            value={lessonBody}
            onChange={(e) => setLessonBody(e.target.value)}
            className={`${inputClass} min-h-[200px] resize-y`}
            rows={8}
          />
        )}

        {/* FLASHCARD_PACK */}
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
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tc.addPair}
            </button>
          </div>
        )}

        {/* DIALOGUE */}
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
                      setDialogueLines(
                        dialogueLines.filter((_, j) => j !== i)
                      )
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
                setDialogueLines([
                  ...dialogueLines,
                  { speaker: "", text: "" },
                ])
              }
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {tc.addLine}
            </button>
          </div>
        )}

        {/* EXERCISE_SET */}
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
          <h4 className="mb-2 text-sm font-medium text-white/60">
            {tc.preview}
          </h4>
          <pre className="max-h-60 overflow-auto text-xs text-white/50 whitespace-pre-wrap">
            {JSON.stringify(
              {
                type,
                title,
                description,
                languageCode,
                level,
                content: buildContent(),
              },
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
          className="flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-colors"
        >
          {showPreview ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
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
