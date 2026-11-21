import { checkRateLimit, RateLimitProfile } from "./rate-limit";

export interface ProgressiveBackoffResult {
  allowed: boolean;
  delaySeconds: number;
  requiresTurnstile: boolean;
  failedCount: number;
  message?: string;
}

// In-memory fallback tracking when hosted Redis is not configured
const memoryAttemptTracker = new Map<string, { count: number; lastFailedAt: number }>();

/**
 * Executes an Upstash REST API command if configured.
 */
async function callUpstashRedis(command: string[]): Promise<any | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      // Serverless timeout: 2 seconds maximum to prevent hanging
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch {
    return null; // Graceful fallback
  }
}

/**
 * Checks progressive backoff for an identifier (IP address, device, or admin ID).
 * Never permanently locks the account, only applies progressive delay and captcha.
 */
export async function checkAdminProgressiveBackoff(
  identifier: string
): Promise<ProgressiveBackoffResult> {
  const key = `admin_backoff:${identifier.toLowerCase().trim()}`;
  let count = 0;

  // 1. Try Upstash Redis
  const upstashCount = await callUpstashRedis(["GET", key]);
  if (upstashCount !== null && upstashCount !== undefined) {
    count = parseInt(String(upstashCount), 10) || 0;
  } else {
    // In-memory fallback
    const entry = memoryAttemptTracker.get(key);
    if (entry) {
      // 15-minute sliding window expiry
      if (Date.now() - entry.lastFailedAt > 15 * 60 * 1000) {
        memoryAttemptTracker.delete(key);
        count = 0;
      } else {
        count = entry.count;
      }
    }
  }

  // Progressive Backoff Rules:
  // 0 - 2 attempts: clean, no delay
  // 3 - 4 attempts: 5-second backoff + Turnstile
  // 5 - 9 attempts: 15-second backoff + Turnstile
  // 10+ attempts: 60-second backoff + Turnstile
  if (count <= 2) {
    return {
      allowed: true,
      delaySeconds: 0,
      requiresTurnstile: false,
      failedCount: count,
    };
  }

  if (count <= 4) {
    return {
      allowed: true,
      delaySeconds: 5,
      requiresTurnstile: true,
      failedCount: count,
      message: "Multiple failed attempts. Turnstile verification and 5s cooldown required.",
    };
  }

  if (count <= 9) {
    return {
      allowed: true,
      delaySeconds: 15,
      requiresTurnstile: true,
      failedCount: count,
      message: "Repeated failed attempts. 15s cooldown in effect.",
    };
  }

  return {
    allowed: true,
    delaySeconds: 60,
    requiresTurnstile: true,
    failedCount: count,
    message: "Security threshold reached. 60s cooldown in effect. No permanent lockout.",
  };
}

/**
 * Records a failed administrative login attempt.
 */
export async function recordAdminFailedAttempt(identifier: string): Promise<number> {
  const key = `admin_backoff:${identifier.toLowerCase().trim()}`;

  // Try Redis INCR with 15-minute TTL
  const upstashRes = await callUpstashRedis(["INCR", key]);
  if (upstashRes !== null && upstashRes !== undefined) {
    await callUpstashRedis(["EXPIRE", key, "900"]); // 15 mins
    return parseInt(String(upstashRes), 10);
  }

  // In-memory fallback
  const now = Date.now();
  const current = memoryAttemptTracker.get(key);
  const newCount = (current ? current.count : 0) + 1;
  memoryAttemptTracker.set(key, { count: newCount, lastFailedAt: now });
  return newCount;
}

/**
 * Clears failed attempt counters on successful authentication.
 */
export async function resetAdminFailedAttempts(identifier: string): Promise<void> {
  const key = `admin_backoff:${identifier.toLowerCase().trim()}`;
  await callUpstashRedis(["DEL", key]);
  memoryAttemptTracker.delete(key);
}
