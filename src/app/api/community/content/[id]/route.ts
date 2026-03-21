import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — single content detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    const item = await db.communityContent.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true, reputation: true } },
        votes: { select: { userId: true, vote: true } },
        _count: { select: { flags: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
    }

    // Check if current user has voted or flagged
    let userVote: number | null = null;
    let userFlagged = false;
    if (session?.user?.id) {
      const vote = item.votes.find((v) => v.userId === session.user?.id);
      userVote = vote?.vote ?? null;

      const flag = await db.contentFlag.findUnique({
        where: {
          userId_contentId: {
            userId: session.user.id,
            contentId: id,
          },
        },
      });
      userFlagged = !!flag;
    }

    return NextResponse.json({
      data: {
        ...item,
        userVote,
        userFlagged,
        flagCount: item._count.flags,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — delete own content (author only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await db.communityContent.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
    }

    // Only author or admin can delete
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    if (item.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    await db.communityContent.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
