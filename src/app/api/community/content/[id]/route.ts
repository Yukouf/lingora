import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — single content detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const item = await db.communityContent.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        votes: { select: { userId: true, vote: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
