import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Idempotent demo account cleanup utility.
 * Targets known hardcoded / demo credentials and safely removes them.
 * Supports --dry-run flag.
 */

const TARGET_DEMO_EMAILS = [
  "student@gowithstudy.app",
  "student@campusflow.edu",
  "moderator@gowithstudy.app",
  "moderator@campusflow.edu",
  "admin@gowithstudy.app",
  "admin@campusflow.edu",
];

async function cleanupDemo() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");

  console.log("=================================================");
  console.log(`[CLEANUP:DEMO] Target emails:`, TARGET_DEMO_EMAILS);
  console.log(`[CLEANUP:DEMO] Mode: ${isDryRun ? "DRY RUN (no deletions performed)" : "ACTIVE EXECUTION"}`);
  console.log("=================================================");

  let dbDeletedCount = 0;
  let fileDeletedCount = 0;

  // 1. Check & Clean from Database (if available)
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      console.log("[CLEANUP:DEMO] Checking PostgreSQL database...");
      const existingDbUsers = await prisma.user.findMany({
        where: {
          email: {
            in: TARGET_DEMO_EMAILS,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log(`[CLEANUP:DEMO] Found ${existingDbUsers.length} target demo accounts in DB:`);
      for (const user of existingDbUsers) {
        console.log(`  - [${user.role}] ${user.profile?.name || "No Profile"} (${user.email}) [ID: ${user.id}]`);
      }

      if (!isDryRun && existingDbUsers.length > 0) {
        const result = await prisma.$transaction(async (tx) => {
          const ids = existingDbUsers.map((u) => u.id);
          // Delete related records if needed, then users
          const deleted = await tx.user.deleteMany({
            where: { id: { in: ids } },
          });

          // Write audit log if AuditLog model exists
          try {
            await (tx as any).auditLog?.create({
              data: {
                action: "CLEANUP_DEMO_ACCOUNTS",
                entity: "USER",
                metadata: {
                  deletedUserIds: ids,
                  deletedEmails: existingDbUsers.map((u) => u.email),
                  timestamp: new Date().toISOString(),
                },
              },
            });
          } catch {
            // Audit table might not have been migrated yet
          }

          return deleted.count;
        });
        dbDeletedCount = result;
        console.log(`[CLEANUP:DEMO] Successfully removed ${dbDeletedCount} users from PostgreSQL.`);
      }
    } catch (err) {
      console.warn("[CLEANUP:DEMO] Database check skipped or failed:", (err as Error).message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log("[CLEANUP:DEMO] DATABASE_URL not set; skipping database check.");
  }

  // 2. Check & Clean Local Disk Auth Store (.data/auth-users.json)
  const diskFilePath = path.join(process.cwd(), ".data", "auth-users.json");
  if (fs.existsSync(diskFilePath)) {
    try {
      console.log("[CLEANUP:DEMO] Checking local disk store at:", diskFilePath);
      const raw = fs.readFileSync(diskFilePath, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const targetSet = new Set(TARGET_DEMO_EMAILS.map((e) => e.toLowerCase()));
        const remaining = list.filter((u: any) => !targetSet.has(String(u.email || "").toLowerCase()));
        const removed = list.filter((u: any) => targetSet.has(String(u.email || "").toLowerCase()));

        fileDeletedCount = removed.length;
        console.log(`[CLEANUP:DEMO] Found ${removed.length} demo accounts in local disk storage:`);
        for (const u of removed) {
          console.log(`  - [${u.role}] ${u.name} (${u.email})`);
        }

        if (!isDryRun && removed.length > 0) {
          fs.writeFileSync(diskFilePath, JSON.stringify(remaining, null, 2), "utf8");
          console.log(`[CLEANUP:DEMO] Updated ${diskFilePath} (${remaining.length} accounts remaining).`);
        }
      }
    } catch (err) {
      console.warn("[CLEANUP:DEMO] Failed reading disk store:", (err as Error).message);
    }
  }

  console.log("=================================================");
  console.log(
    `[CLEANUP:DEMO] Summary: ${dbDeletedCount} DB records, ${fileDeletedCount} disk records ${
      isDryRun ? "flagged for deletion (DRY RUN)" : "deleted successfully."
    }`
  );
  console.log("=================================================");
}

cleanupDemo().catch((err) => {
  console.error("[CLEANUP:DEMO_FATAL]", err);
  process.exit(1);
});
