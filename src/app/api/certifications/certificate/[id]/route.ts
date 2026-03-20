import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  const certification = await db.certification.findUnique({
    where: { id },
    include: {
      exam: {
        select: {
          languageCode: true,
          level: true,
          title: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certification || certification.userId !== userId) {
    return NextResponse.json(
      { error: "Certificat introuvable" },
      { status: 404 }
    );
  }

  if (!certification.passed) {
    return NextResponse.json(
      { error: "Examen non réussi — pas de certificat" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    data: {
      certificateId: certification.id,
      userName: certification.user.name ?? certification.user.email ?? "Apprenant",
      languageCode: certification.exam.languageCode,
      level: certification.exam.level,
      examTitle: certification.exam.title,
      score: certification.score,
      completedAt: certification.completedAt,
    },
    error: null,
  });
}
