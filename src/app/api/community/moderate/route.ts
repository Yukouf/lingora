import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — pending content (admin only)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    const items = await db.communityContent.findMany({
      where: { status: "PENDING" },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: items });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
