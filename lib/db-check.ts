// ==============================================================================
// CampusFlow — Database Connectivity Guard & Ultra-Fast Fallback Helper
// Ensures sub-10ms response times even when PostgreSQL is not running locally.
// ==============================================================================
import { prisma } from "@/lib/prisma";

let isAvailable: boolean | null = null;
let lastCheckTime = 0;

export async function isDbConnected(): Promise<boolean> {
  const now = Date.now();
  // Cache the result for 60 seconds to prevent connection timeouts on every request
  if (isAvailable !== null && now - lastCheckTime < 60000) {
    return isAvailable;
  }

  try {
    // Cloud database connection probe (5000ms to allow TLS handshake & cold start)
    const timeoutMs = process.env.VERCEL ? 5000 : 1000;
    const probe = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB probe timeout")), timeoutMs)
    );
    await Promise.race([probe, timeout]);
    isAvailable = true;
  } catch (err) {
    console.warn("[DB PROBE]", (err as Error).message);
    isAvailable = false;
  }

  lastCheckTime = now;
  return isAvailable;
}
