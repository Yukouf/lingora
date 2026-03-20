import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — upvote/downvote (auth required, toggleable)
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
    const vote = body.vote as number;

    if (vote !== 1 && vote !== -1) {
      return NextResponse.json({ error: "Vote invalide (1 ou -1)" }, { status: 400 });
    }

    // Check content exists
    const content = await db.communityContent.findUnique({ where: { id: contentId } });
    if (!content) {
      return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
    }

    // Check existing vote
    const existing = await db.contentVote.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });

    if (existing) {
      if (existing.vote === vote) {
        // Same vote — remove it (toggle off)
        await db.contentVote.delete({
          where: { userId_contentId: { userId, contentId } },
        });

        // Update counts
        const field = vote === 1 ? "upvotes" : "downvotes";
        await db.communityContent.update({
          where: { id: contentId },
          data: { [field]: { decrement: 1 } },
        });

        return NextResponse.json({ data: { action: "removed" } });
      } else {
        // Different vote — switch
        await db.contentVote.update({
          where: { userId_contentId: { userId, contentId } },
          data: { vote },
        });

        if (vote === 1) {
          await db.communityContent.update({
            where: { id: contentId },
            data: { upvotes: { increment: 1 }, downvotes: { decrement: 1 } },
          });
        } else {
          await db.communityContent.update({
            where: { id: contentId },
            data: { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
          });
        }

        return NextResponse.json({ data: { action: "switched", vote } });
      }
    } else {
      // New vote
      await db.contentVote.create({
        data: { userId, contentId, vote },
      });

      const field = vote === 1 ? "upvotes" : "downvotes";
      await db.communityContent.update({
        where: { id: contentId },
        data: { [field]: { increment: 1 } },
      });

      return NextResponse.json({ data: { action: "voted", vote } });
    }
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
