import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH — approve/reject content (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, reviewNote } = body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Statut invalide (APPROVED ou REJECTED)" }, { status: 400 });
    }

    const content = await db.communityContent.findUnique({ where: { id } });
    if (!content) {
      return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
    }

    // Update content status
    const updated = await db.communityContent.update({
      where: { id },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewNote: reviewNote?.trim() || null,
      },
    });

    // Update author reputation
    const reputationChange = status === "APPROVED" ? 10 : -20;
    await db.user.update({
      where: { id: content.authorId },
      data: { reputation: { increment: reputationChange } },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
