import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  const certifications = await db.certification.findMany({
    where: { userId, completedAt: { not: null } },
    include: {
      exam: {
        select: {
          id: true,
          languageCode: true,
          level: true,
          title: true,
          passScore: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  const data = certifications.map((cert) => ({
    id: cert.id,
    examId: cert.examId,
    score: cert.score,
    passed: cert.passed,
    timeSpent: cert.timeSpent,
    completedAt: cert.completedAt,
    exam: {
      languageCode: cert.exam.languageCode,
      level: cert.exam.level,
      title: cert.exam.title,
      passScore: cert.exam.passScore,
    },
  }));

  return NextResponse.json({ data, error: null });
}
