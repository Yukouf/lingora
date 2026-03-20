"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ContentSubmitForm } from "@/components/community/ContentSubmitForm";

export default function SubmitContentPage() {
  const { t } = useI18n();
  const tc = t.dashboard.community;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(data: {
    type: string;
    title: string;
    description: string;
    languageCode: string;
    level: string;
    content: unknown;
  }) {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/community/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || t.dashboard.common.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/community/my-content"), 2000);
    } catch {
      setError(t.dashboard.common.error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.dashboard.common.back}
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-white/90">{tc.submitContent}</h1>
      <p className="mb-8 text-sm text-white/40">{tc.subtitle}</p>

      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <p className="text-emerald-300 font-medium">{tc.submitSuccess}</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <ContentSubmitForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
