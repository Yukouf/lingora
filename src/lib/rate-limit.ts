import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback: if Upstash is not configured, use a no-op that always allows
const isConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Chat rate limiter — per-user daily limits
 * Free: 15 messages/day | Premium: 200 messages/day
 */
export const chatRateLimitFree = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(15, "1 d"),
      prefix: "rl:chat:free",
      analytics: true,
    })
  : null;

export const chatRateLimitPremium = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(200, "1 d"),
      prefix: "rl:chat:premium",
      analytics: true,
    })
  : null;

/**
 * Global IP rate limiter — 30 req/min per IP (anti-abuse)
 */
export const globalIpRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "rl:global:ip",
    })
  : null;

/**
 * Auth rate limiter — 5 attempts per 15 min per IP (brute-force protection)
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, "15 m"),
      prefix: "rl:auth",
    })
  : null;

/**
 * Check rate limit for chat endpoint
 * Returns { allowed, remaining, resetAt } or allows all if Upstash not configured
 */
export async function checkChatRateLimit(
  userId: string,
  isPremium: boolean
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  const limiter = isPremium ? chatRateLimitPremium : chatRateLimitFree;

  if (!limiter) {
    // Upstash not configured — allow (dev mode)
    console.warn("[rate-limit] Upstash not configured — skipping rate limit");
    return { allowed: true, remaining: 999 };
  }

  const result = await limiter.limit(userId);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

/**
 * Check global IP rate limit
 */
export async function checkIpRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!globalIpRateLimit) {
    return { allowed: true, remaining: 999 };
  }

  const result = await globalIpRateLimit.limit(ip);
  return { allowed: result.success, remaining: result.remaining };
}

/**
 * Check auth rate limit (login/register brute-force protection)
 */
export async function checkAuthRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!authRateLimit) {
    return { allowed: true, remaining: 999 };
  }

  const result = await authRateLimit.limit(ip);
  return { allowed: result.success, remaining: result.remaining };
}
