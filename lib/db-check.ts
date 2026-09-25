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
    // 150ms ultra-fast probe
    const probe = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB probe timeout")), 150)
    );
    await Promise.race([probe, timeout]);
    isAvailable = true;
  } catch {
    isAvailable = false;
  }

  lastCheckTime = now;
  return isAvailable;
}
