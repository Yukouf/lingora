"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const FLAG_REASONS = [
  "INAPPROPRIATE",
  "SPAM",
  "INCORRECT",
  "OFFENSIVE",
  "COPYRIGHT",
  "OTHER",
] as const;

interface FlagModalProps {
  contentId: string;
  contentTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FlagModal({
  contentId,
  contentTitle,
  onClose,
  onSuccess,
}: FlagModalProps) {
  const { t } = useI18n();
  const tc = t.dashboard.community;

  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/community/content/${contentId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError(tc.flagAlready);
        } else {
          setError(json.error ?? t.dashboard.common.error);
        }
        return;
      }

      onSuccess();
    } catch {
      setError(t.dashboard.common.error);
    } finally {
      setLoading(false);
    }
  }

  const reasonLabels = tc.flagReasons as Record<string, string>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f17] p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              {tc.flagContent}
            </h3>
            <p className="text-sm text-white/40 line-clamp-1">{contentTitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              {tc.flagReason}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FLAG_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    reason === r
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {reasonLabels[r] ?? r}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">
              {tc.flagDetails}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-red-500/30 transition-colors min-h-[80px] resize-y"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-colors"
            >
              {t.dashboard.common.cancel ?? "Annuler"}
            </button>
            <button
              type="submit"
              disabled={!reason || loading}
              className="rounded-xl bg-red-500/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t.dashboard.common.loading : tc.flag}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
