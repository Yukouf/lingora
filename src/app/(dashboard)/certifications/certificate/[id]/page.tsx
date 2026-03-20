"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { CertificateView } from "@/components/certifications/CertificateView";
import { Printer, ArrowLeft } from "lucide-react";

interface CertificateData {
  certificateId: string;
  userName: string;
  languageCode: string;
  level: string;
  examTitle: string;
  score: number;
  completedAt: string;
}

export default function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const cert = t.dashboard.certifications;
  const router = useRouter();

  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/certifications/certificate/${id}`);
        const json = await res.json();
        if (json.error) {
          setError(json.error);
          return;
        }
        setData(json.data);
      } catch {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#a78bfa]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error ?? "Certificat introuvable"}</p>
        <button
          onClick={() => router.push("/certifications")}
          className="text-[#a78bfa] hover:underline text-sm"
        >
          {t.dashboard.common.back}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/certifications")}
        className="flex items-center gap-1 text-sm text-white/40 hover:text-white/60 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.dashboard.common.back}
      </button>

      {/* Certificate */}
      <CertificateView
        userName={data.userName}
        languageCode={data.languageCode}
        level={data.level}
        examTitle={data.examTitle}
        score={data.score}
        completedAt={data.completedAt}
        certificateId={data.certificateId}
      />

      {/* Print button */}
      <div className="flex justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
        >
          <Printer className="h-4 w-4" />
          {cert.print}
        </button>
      </div>
    </div>
  );
}
