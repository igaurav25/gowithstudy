/**
 * In-Memory & Edge-Compatible Rate Limiting Engine
 * Implements sliding-window counters to prevent brute-force, DoS, and spam attacks.
 */

export type RateLimitProfile = "AUTH" | "UPLOAD" | "API" | "AI" | "COMMUNITY";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

export const RATE_LIMIT_CONFIGS: Record<RateLimitProfile, RateLimitConfig> = {
  // Anti-Brute-Force & Credential Stuffing: 5 requests per 60s
  AUTH: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },
  // File Upload DOS Protection: 10 uploads per 5 minutes
  UPLOAD: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  },
  // General API Rate Limit: 60 requests per minute
  API: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  // AI Study Assistant RAG Query Rate Limit: 20 prompts per minute
  AI: {
    maxRequests: 20,
    windowMs: 60 * 1000,
  },
  // Community Post/Comment Anti-Spam: 15 actions per 5 minutes
  COMMUNITY: {
    maxRequests: 15,
    windowMs: 5 * 60 * 1000,
  },
};

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store (keyed by `${profile}:${identifier}`)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      // Find oldest window duration (max 5 minutes)
      const validTimestamps = entry.timestamps.filter((ts) => now - ts < 5 * 60 * 1000);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      } else {
        entry.timestamps = validTimestamps;
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds to wait before retry
}

/**
 * Checks and records a rate limit hit for a given identifier (IP or User ID).
 */
export function checkRateLimit(
  identifier: string,
  profile: RateLimitProfile = "API"
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[profile] || RATE_LIMIT_CONFIGS.API;
  const key = `${profile}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key) || { timestamps: [] };

  // Filter timestamps within the current sliding window
  const windowStart = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const currentCount = entry.timestamps.length;
  const resetTimestampSec = Math.ceil((now + config.windowMs) / 1000);

  if (currentCount >= config.maxRequests) {
    // Exceeded limit
    const oldestTimestamp = entry.timestamps[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((oldestTimestamp + config.windowMs - now) / 1000));

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: resetTimestampSec,
      retryAfter: retryAfterSec,
    };
  }

  // Record this request
  entry.timestamps.push(now);
  rateLimitStore.set(key, entry);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.timestamps.length),
    reset: resetTimestampSec,
    retryAfter: 0,
  };
}

/**
 * Returns standard rate limit headers to attach to HTTP responses.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };

  if (!result.success && result.retryAfter > 0) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Manually reset rate limit for a key (used in tests and administrative unlocks).
 */
export function resetRateLimit(identifier: string, profile: RateLimitProfile): void {
  const key = `${profile}:${identifier}`;
  rateLimitStore.delete(key);
}
