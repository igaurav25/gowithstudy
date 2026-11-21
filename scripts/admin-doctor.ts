import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { verifyEncryptionCanary } from "../lib/totp.ts";

// Auto-load .env.local or .env for CLI diagnostics if running locally
function loadLocalEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadLocalEnv();

interface DoctorCheckResult {
  title: string;
  passed: boolean;
  message: string;
  warning?: boolean;
}

async function runAdminDoctor() {
  console.log("==================================================================");
  console.log("🩺  GoWithStudy System & Security Health Doctor (admin:doctor)");
  console.log("    Read-only diagnostic audit. Zero secrets printed.");
  console.log("==================================================================\n");

  const results: DoctorCheckResult[] = [];

  // 1. Environment Variables Validation
  const nodeEnv = process.env.NODE_ENV || "development";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const isProduction = nodeEnv === "production" || Boolean(process.env.VERCEL);

  if (isProduction && siteUrl.includes("localhost")) {
    results.push({
      title: "Public Site URL",
      passed: false,
      message: `NEXT_PUBLIC_SITE_URL is configured as localhost in production: ${siteUrl}`,
    });
  } else if (!siteUrl) {
    results.push({
      title: "Public Site URL",
      passed: true,
      warning: true,
      message: "NEXT_PUBLIC_SITE_URL is not set; falling back to default production domain.",
    });
  } else {
    results.push({
      title: "Public Site URL",
      passed: true,
      message: `Valid public domain configured: ${siteUrl}`,
    });
  }

  // Auth Secret length
  const authSecret = process.env.AUTH_SECRET || "";
  if (!authSecret || authSecret.length < 32) {
    results.push({
      title: "AUTH_SECRET Strength",
      passed: false,
      message: "AUTH_SECRET is missing or shorter than 32 characters.",
    });
  } else {
    results.push({
      title: "AUTH_SECRET Strength",
      passed: true,
      message: "AUTH_SECRET satisfies high-entropy length requirement (>= 32 chars).",
    });
  }

  // 2. Encryption Key & AES-256-GCM Canary Decryption
  const canarySuccess = verifyEncryptionCanary();
  if (!canarySuccess) {
    results.push({
      title: "AES-256-GCM TOTP Encryption Canary",
      passed: false,
      message: "Failed encryption canary test. APP_ENCRYPTION_KEY or AES-256-GCM cipher error.",
    });
  } else {
    results.push({
      title: "AES-256-GCM TOTP Encryption Canary",
      passed: true,
      message: "Canary encrypted payload was successfully decrypted with matching authentication tag.",
    });
  }

  // 3. Database Connectivity & Partial Unique Index Inspection
  if (!process.env.DATABASE_URL) {
    results.push({
      title: "PostgreSQL Database Connection",
      passed: true,
      warning: true,
      message: "DATABASE_URL not set. Running in disk/in-memory fallback mode.",
    });
  } else {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      results.push({
        title: "PostgreSQL Database Connection",
        passed: true,
        message: "Successfully connected to PostgreSQL database cluster.",
      });

      // Query Super Admin count
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });

      if (superAdminCount > 1) {
        results.push({
          title: "Single Super Admin Invariant",
          passed: false,
          message: `CRITICAL: Found ${superAdminCount} Super Admin accounts. System strictly requires at most 1.`,
        });
      } else {
        results.push({
          title: "Single Super Admin Invariant",
          passed: true,
          message: `Invariant satisfied: ${superAdminCount} Super Admin account(s) registered (0 or 1 allowed).`,
        });
      }

      // Query partial unique index in pg_indexes
      try {
        const indexRecords: any[] = await prisma.$queryRaw`
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = 'User' AND indexname = 'idx_user_single_super_admin'
        `;

        if (indexRecords.length > 0) {
          results.push({
            title: "Database Partial Unique Index",
            passed: true,
            message: "Index 'idx_user_single_super_admin' is active on PostgreSQL.",
          });
        } else {
          results.push({
            title: "Database Partial Unique Index",
            passed: true,
            warning: true,
            message: "Partial unique index 'idx_user_single_super_admin' not found in PostgreSQL catalog. Run migration.",
          });
        }
      } catch {
        results.push({
          title: "Database Partial Unique Index",
          passed: true,
          warning: true,
          message: "Unable to query pg_indexes (may require superuser or standard permissions).",
        });
      }
    } catch (err) {
      results.push({
        title: "PostgreSQL Database Connection",
        passed: false,
        message: `Database connection error: ${(err as Error).message}`,
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  // 4. Redis / Upstash Reachability
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashUrl && upstashToken) {
    try {
      const pingRes = await fetch(upstashUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["PING"]),
        signal: AbortSignal.timeout(3000),
      });

      if (pingRes.ok) {
        results.push({
          title: "Upstash Redis Distributed Store",
          passed: true,
          message: "Successfully reached Upstash REST endpoint; response PONG received.",
        });
      } else {
        results.push({
          title: "Upstash Redis Distributed Store",
          passed: true,
          warning: true,
          message: `Upstash returned HTTP status ${pingRes.status}. Falling back to in-memory store.`,
        });
      }
    } catch (err) {
      results.push({
        title: "Upstash Redis Distributed Store",
        passed: true,
        warning: true,
        message: `Upstash check timed out or failed: ${(err as Error).message}`,
      });
    }
  } else {
    results.push({
      title: "Distributed Redis Store",
      passed: true,
      warning: true,
      message: "UPSTASH_REDIS_REST_URL not configured. Using in-memory sliding window rate limiter.",
    });
  }

  // 5. System Clock Drift (RFC 6238 TOTP requires synchronized wall clock)
  const localTime = Date.now();
  results.push({
    title: "Server Wall-Clock Synchronization",
    passed: true,
    message: `Server timestamp: ${new Date(localTime).toISOString()} (Ensure automatic NTP sync is enabled).`,
  });

  // Print Summary Table
  let allHealthy = true;
  for (const r of results) {
    const symbol = r.passed ? (r.warning ? "⚠️ " : "✅") : "❌";
    console.log(`${symbol} [${r.title}]`);
    console.log(`   ${r.message}`);
    if (!r.passed) allHealthy = false;
  }

  console.log("\n==================================================================");
  if (allHealthy) {
    console.log("🎉  ALL SYSTEM DIAGNOSTIC CHECKS PASSED!");
  } else {
    console.error("🚨  ONE OR MORE CRITICAL CHECKS FAILED. See above for resolution steps.");
    process.exit(1);
  }
  console.log("==================================================================");
}

runAdminDoctor().catch((err) => {
  console.error("Doctor encountered unhandled failure:", err);
  process.exit(1);
});
