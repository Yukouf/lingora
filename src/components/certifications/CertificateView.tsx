"use client";

import { useI18n } from "@/lib/i18n/context";

interface CertificateViewProps {
  userName: string;
  languageCode: string;
  level: string;
  examTitle: string;
  score: number;
  completedAt: string;
  certificateId: string;
}

export function CertificateView({
  userName,
  languageCode,
  level,
  examTitle,
  score,
  completedAt,
  certificateId,
}: CertificateViewProps) {
  const { t } = useI18n();
  const cert = t.dashboard.certifications;

  const { locale } = useI18n();
  const localeMap: Record<string, string> = { fr: "fr-FR", en: "en-US", es: "es-ES", de: "de-DE", ja: "ja-JP", zh: "zh-CN", ru: "ru-RU", ko: "ko-KR", ar: "ar-SA" };
  const date = new Date(completedAt).toLocaleDateString(localeMap[locale] ?? "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const languageNames: Record<string, string> = {
    EN: "English",
    ES: "Espanol",
    FR: "Francais",
    DE: "Deutsch",
    JP: "Japanese",
    ZH: "Chinese",
    AR: "Arabic",
    KO: "Korean",
    RU: "Russian",
  };

  return (
    <div className="certificate-print-area">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#1a1625] via-[#1e1a2e] to-[#16132a] p-10 shadow-2xl">
        {/* Decorative border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/10 m-2 pointer-events-none" />
        <div className="absolute inset-0 rounded-2xl border border-amber-500/5 m-4 pointer-events-none" />

        {/* Corner decorations */}
        <div className="absolute top-6 left-6 h-8 w-8 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg" />
        <div className="absolute top-6 right-6 h-8 w-8 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Logo */}
          <div className="text-xl font-semibold tracking-[-0.02em]">
            <span className="text-white">Ling</span>
            <span className="text-[#a78bfa]">you</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400 tracking-wide">
              {cert.certificateTitle}
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>

          {/* User name */}
          <div className="space-y-1 pt-2">
            <p className="text-3xl md:text-4xl font-bold text-white">
              {userName}
            </p>
          </div>

          {/* Achievement */}
          <div className="space-y-2 pt-2">
            <p className="text-white/60 text-sm uppercase tracking-widest">
              {cert.certifiedLevel}
            </p>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500/20 px-4 py-2 text-2xl font-bold text-amber-400">
                {level}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white/70 text-lg">
                {languageNames[languageCode.toUpperCase()] ?? languageCode}
              </span>
            </div>
            <p className="text-white/50 text-sm">{examTitle}</p>
          </div>

          {/* Score */}
          <div className="pt-2">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
              {cert.yourScore}
            </p>
            <p className="text-3xl font-bold text-[#a78bfa]">{score}%</p>
          </div>

          {/* Date & ID */}
          <div className="pt-4 space-y-1 text-sm text-white/40">
            <p>
              {cert.issuedOn} {date}
            </p>
            <p className="font-mono text-xs">
              {cert.certificateId}: {certificateId.slice(0, 16).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-print-area,
          .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
