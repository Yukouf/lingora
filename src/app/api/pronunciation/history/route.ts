import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get("languageCode");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

    const attempts = await db.pronunciationAttempt.findMany({
      where: {
        userId: session.user.id,
        ...(languageCode ? { languageCode } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        targetText: true,
        spokenText: true,
        languageCode: true,
        accuracyScore: true,
        aiFeedback: true,
        createdAt: true,
      },
    });

    // Compute stats
    const allAttempts = await db.pronunciationAttempt.findMany({
      where: {
        userId: session.user.id,
        ...(languageCode ? { languageCode } : {}),
      },
      select: { accuracyScore: true },
    });

    const totalAttempts = allAttempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            allAttempts.reduce((sum, a) => sum + a.accuracyScore, 0) /
              totalAttempts
          )
        : 0;
    const perfectCount = allAttempts.filter((a) => a.accuracyScore >= 90).length;

    return NextResponse.json({
      data: {
        attempts,
        stats: {
          totalAttempts,
          avgScore,
          perfectCount,
        },
      },
    });
  } catch (error) {
    console.error("Pronunciation history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
