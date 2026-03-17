import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Helper to extract period dates from subscription
function getSubPeriod(sub: Record<string, unknown>) {
  const start = sub.current_period_start as number | undefined;
  const end = sub.current_period_end as number | undefined;
  return {
    currentPeriodStart: start ? new Date(start * 1000) : new Date(),
    currentPeriodEnd: end ? new Date(end * 1000) : new Date(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 }
    );
  }

  // Idempotency: skip already-processed events
  const alreadyProcessed = await db.processedWebhookEvent.findUnique({
    where: { id: event.id },
  });

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const subData = sub as unknown as Record<string, unknown>;
          const period = getSubPeriod(subData);
          const items = sub.items?.data;

          await db.subscription.update({
            where: { userId },
            data: {
              status: "ACTIVE",
              stripeSubscriptionId: subscriptionId,
              stripePriceId: items?.[0]?.price?.id ?? null,
              ...period,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const invoiceData = invoice as unknown as Record<string, unknown>;
        const subscriptionId = invoiceData.subscription as string | undefined;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const subData = sub as unknown as Record<string, unknown>;
          const customerId = sub.customer as string;
          const period = getSubPeriod(subData);

          const subscription = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (subscription) {
            await db.subscription.update({
              where: { id: subscription.id },
              data: { status: "ACTIVE", ...period },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const invoiceData = invoice as unknown as Record<string, unknown>;
        const subscriptionId = invoiceData.subscription as string | undefined;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = sub.customer as string;

          await db.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "CANCELED", cancelAtPeriodEnd: false },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const subData = sub as unknown as Record<string, unknown>;
        const customerId = sub.customer as string;
        const period = getSubPeriod(subData);

        const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "FREE"> = {
          active: "ACTIVE",
          past_due: "PAST_DUE",
          canceled: "CANCELED",
          unpaid: "UNPAID",
        };

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: statusMap[sub.status] ?? "FREE",
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            ...period,
          },
        });
        break;
      }
    }

    // Mark event as processed
    await db.processedWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
