import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { immersionMode: true, immersionLang: true },
  });

  return NextResponse.json({
    data: {
      immersionMode: user?.immersionMode ?? false,
      immersionLang: user?.immersionLang ?? null,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { immersionMode, immersionLang } = body as {
    immersionMode: boolean;
    immersionLang?: string;
  };

  if (typeof immersionMode !== "boolean") {
    return NextResponse.json(
      { error: "immersionMode doit être un booléen" },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      immersionMode,
      immersionLang: immersionMode ? (immersionLang ?? null) : null,
    },
    select: { immersionMode: true, immersionLang: true },
  });

  return NextResponse.json({
    data: {
      immersionMode: user.immersionMode,
      immersionLang: user.immersionLang,
    },
  });
}
