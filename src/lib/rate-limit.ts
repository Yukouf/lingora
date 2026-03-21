import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback: if Upstash is not configured, use in-memory rate limiting
const isConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// ── In-memory fallback rate limiter (when Upstash is not configured) ──
// IMPORTANT: This only works for single-instance deployments (dev, single serverless).
// In production, always configure Upstash for distributed rate limiting.
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, reset: entry.resetAt };
}

// Periodically clean expired entries (every 5 minutes)
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60 * 1000;
  const globalStore = globalThis as unknown as { _rlCleanup?: boolean };
  if (!globalStore._rlCleanup) {
    globalStore._rlCleanup = true;
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of inMemoryStore) {
        if (now >= entry.resetAt) inMemoryStore.delete(key);
      }
    }, CLEANUP_INTERVAL).unref?.();
  }
}

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
 * AI route rate limiter — 20 req/min per user (protects AI cost)
 */
export const aiRouteRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      prefix: "rl:ai:route",
    })
  : null;

/**
 * Check rate limit for chat endpoint
 * Returns { allowed, remaining, resetAt }
 * Falls back to in-memory rate limiting if Upstash not configured
 */
export async function checkChatRateLimit(
  userId: string,
  isPremium: boolean
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  const limiter = isPremium ? chatRateLimitPremium : chatRateLimitFree;

  if (!limiter) {
    // In-memory fallback: 15/day free, 200/day premium
    const maxReq = isPremium ? 200 : 15;
    const result = inMemoryRateLimit(`chat:${userId}`, maxReq, 24 * 60 * 60 * 1000);
    return { allowed: result.success, remaining: result.remaining, resetAt: result.reset };
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
    // In-memory fallback: 30 req/min per IP
    const result = inMemoryRateLimit(`ip:${ip}`, 30, 60 * 1000);
    return { allowed: result.success, remaining: result.remaining };
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
    // In-memory fallback: 5 attempts per 15 min
    const result = inMemoryRateLimit(`auth:${ip}`, 5, 15 * 60 * 1000);
    return { allowed: result.success, remaining: result.remaining };
  }

  const result = await authRateLimit.limit(ip);
  return { allowed: result.success, remaining: result.remaining };
}

/**
 * Check AI route rate limit (pronunciation, certification AI calls)
 */
export async function checkAiRouteRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!aiRouteRateLimit) {
    // In-memory fallback: 20 req/min per user
    const result = inMemoryRateLimit(`ai:${userId}`, 20, 60 * 1000);
    return { allowed: result.success, remaining: result.remaining };
  }

  const result = await aiRouteRateLimit.limit(userId);
  return { allowed: result.success, remaining: result.remaining };
}
