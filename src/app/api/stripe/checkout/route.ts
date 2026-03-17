import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, PREMIUM_MONTHLY_AMOUNT } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get or create Stripe customer
    let subscription = await db.subscription.findUnique({
      where: { userId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;

      // Save customer ID
      if (subscription) {
        await db.subscription.update({
          where: { userId },
          data: { stripeCustomerId: customerId },
        });
      } else {
        subscription = await db.subscription.create({
          data: {
            userId,
            stripeCustomerId: customerId,
            status: "FREE",
          },
        });
      }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: PREMIUM_MONTHLY_AMOUNT,
            recurring: { interval: "month" },
            product_data: {
              name: "Lingora Premium",
              description: "Accès illimité — Niveaux B1 à C2, conversations IA illimitées, toutes les langues",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: { userId },
    });

    return NextResponse.json({ data: { url: checkoutSession.url } });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
