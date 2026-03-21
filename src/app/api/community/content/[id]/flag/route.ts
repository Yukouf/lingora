import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_REASONS = [
  "INAPPROPRIATE",
  "SPAM",
  "INCORRECT",
  "OFFENSIVE",
  "COPYRIGHT",
  "OTHER",
] as const;

// POST — flag/report content (auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id: contentId } = await params;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { reason, details } = body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Raison invalide" },
        { status: 400 }
      );
    }

    // Check content exists
    const content = await db.communityContent.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      return NextResponse.json(
        { error: "Contenu introuvable" },
        { status: 404 }
      );
    }

    // Prevent self-flagging
    if (content.authorId === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas signaler votre propre contenu" },
        { status: 400 }
      );
    }

    // Check if already flagged by this user
    const existing = await db.contentFlag.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Deja signale" },
        { status: 409 }
      );
    }

    // Create flag
    await db.contentFlag.create({
      data: {
        userId,
        contentId,
        reason,
        details: details?.trim() || null,
      },
    });

    // If content receives 3+ flags, auto-flag it for moderation review
    const flagCount = await db.contentFlag.count({
      where: { contentId },
    });

    if (flagCount >= 3 && content.status === "APPROVED") {
      await db.communityContent.update({
        where: { id: contentId },
        data: { status: "FLAGGED" },
      });
    }

    return NextResponse.json({ data: { action: "flagged" } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
