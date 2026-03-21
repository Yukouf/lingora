import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const immersionSchema = z.object({
  immersionMode: z.boolean(),
  immersionLang: z.string().min(1).max(10).optional(),
});

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = immersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Donnees invalides" },
      { status: 400 }
    );
  }

  const { immersionMode, immersionLang } = parsed.data;

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
