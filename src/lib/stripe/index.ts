import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// Price for premium plan: 10€/month
// You need to create this product+price in Stripe Dashboard
// and set the price ID here
export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID ?? "";

export const PREMIUM_MONTHLY_AMOUNT = 1000; // 10.00 EUR in cents
