import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { checkAuthRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  nativeLanguage: z.string().default("fr"),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per 15 min per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rlCheck = await checkAuthRateLimit(ip);
  if (!rlCheck.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives — réessaie dans 15 minutes" },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, nativeLanguage, promoCode } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Check promo code validity from DB
    const normalizedCode = promoCode?.toLowerCase().trim();
    let promoRecord: { id: string; label: string } | null = null;

    if (normalizedCode) {
      const dbPromo = await db.promoCode.findUnique({
        where: { code: normalizedCode },
      });

      if (!dbPromo) {
        return NextResponse.json(
          { error: "Code promo invalide" },
          { status: 400 }
        );
      }

      // Check if expired
      if (dbPromo.expiresAt && dbPromo.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Ce code promo a expiré" },
          { status: 400 }
        );
      }

      // Check if deactivated
      if (!dbPromo.isActive) {
        return NextResponse.json(
          { error: "Ce code promo n'est plus valide" },
          { status: 400 }
        );
      }

      // Check max uses
      if (dbPromo.maxUses !== null && dbPromo.currentUses >= dbPromo.maxUses) {
        return NextResponse.json(
          { error: "Ce code promo a atteint sa limite d'utilisation" },
          { status: 400 }
        );
      }

      promoRecord = { id: dbPromo.id, label: dbPromo.label };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // If valid promo → ACTIVE subscription (full premium, no expiry)
    const subscriptionStatus = promoRecord ? "ACTIVE" : "FREE";

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        nativeLanguage,
        subscription: {
          create: {
            status: subscriptionStatus,
            ...(promoRecord
              ? {
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date("2099-12-31"),
                }
              : {}),
          },
        },
      },
    });

    // Track promo code redemption
    if (promoRecord) {
      await db.$transaction([
        db.promoRedemption.create({
          data: { promoCodeId: promoRecord.id, userId: user.id },
        }),
        db.promoCode.update({
          where: { id: promoRecord.id },
          data: { currentUses: { increment: 1 } },
        }),
      ]);
    }

    // Send welcome email (non-blocking — don't delay registration)
    sendWelcomeEmail(email, name).catch(() => {});

    return NextResponse.json(
      {
        data: { id: user.id, name: user.name, email: user.email },
        message: promoRecord
          ? `Compte créé avec accès Premium ! (${promoRecord.label})`
          : "Compte créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
