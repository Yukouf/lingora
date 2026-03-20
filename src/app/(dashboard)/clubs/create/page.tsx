"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const availableLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
  { code: "ko", name: "한국어" },
  { code: "ar", name: "العربية" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
];

export default function CreateClubPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [isPublic, setIsPublic] = useState(true);
  const [maxMembers, setMaxMembers] = useState(50);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          languageCode,
          isPublic,
          maxMembers,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        router.push(`/clubs/${json.data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back */}
      <Link
        href="/clubs"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.dashboard.common.back}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white/90">
          {t.dashboard.clubs.createClub}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 space-y-5"
      >
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/40">
            {t.dashboard.clubs.clubName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.dashboard.clubs.clubName}
            className={inputClass}
            required
            maxLength={60}
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/40">
            {t.dashboard.clubs.clubDesc}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.dashboard.clubs.clubDesc}
            className={`${inputClass} resize-none`}
            rows={3}
            maxLength={300}
          />
        </div>

        {/* Language */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/40">
            {t.dashboard.clubs.language}
          </label>
          <select
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className={inputClass}
          >
            {availableLanguages.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-[#0f0f14] text-white"
              >
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Public / Private toggle */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/40">
            {t.dashboard.clubs.public} / {t.dashboard.clubs.private}
          </label>
          <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 border border-white/5">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isPublic
                  ? "bg-white/[0.08] text-white/90"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {t.dashboard.clubs.public}
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !isPublic
                  ? "bg-white/[0.08] text-white/90"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {t.dashboard.clubs.private}
            </button>
          </div>
        </div>

        {/* Max members */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/40">
            {t.dashboard.clubs.maxMembers}
          </label>
          <input
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            min={2}
            max={500}
            className={inputClass}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full rounded-lg bg-violet-500/20 px-4 py-2.5 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/30 disabled:opacity-50"
        >
          {loading ? t.dashboard.common.loading : t.dashboard.clubs.create}
        </button>
      </form>
    </div>
  );
}
