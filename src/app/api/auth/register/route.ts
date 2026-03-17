import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

// Valid promo codes → grant full premium access
const PROMO_CODES: Record<string, { label: string }> = {
  youssefleplusbeau: { label: "Fondateur" },
};

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  nativeLanguage: z.string().default("fr"),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
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

    // Check promo code validity
    const normalizedCode = promoCode?.toLowerCase().trim();
    const promo = normalizedCode ? PROMO_CODES[normalizedCode] : null;

    if (promoCode && !promo) {
      return NextResponse.json(
        { error: "Code promo invalide" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // If valid promo → ACTIVE subscription (full premium, no expiry)
    const subscriptionStatus = promo ? "ACTIVE" : "FREE";

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        nativeLanguage,
        subscription: {
          create: {
            status: subscriptionStatus,
            // Premium via promo: no Stripe, no expiry — permanent access
            ...(promo
              ? {
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date("2099-12-31"),
                }
              : {}),
          },
        },
      },
    });

    // Send welcome email (non-blocking — don't delay registration)
    sendWelcomeEmail(email, name).catch(() => {});

    return NextResponse.json(
      {
        data: { id: user.id, name: user.name, email: user.email },
        message: promo
          ? `Compte créé avec accès Premium ! (${promo.label})`
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
