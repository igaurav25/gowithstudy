import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function canonicalizeEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  const parts = clean.split("@");
  if (parts.length !== 2) return clean;
  let [localPart, domain] = parts;
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") {
    localPart = localPart.split("+")[0] || localPart;
    localPart = localPart.replace(/\./g, "");
  }
  return `${localPart}@${domain}`;
}

function normalizePhone(phone: string): string | null {
  const cleaned = phone.trim().replace(/\s+/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("+")) return cleaned;
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : null;
}

/**
 * Legacy user migration script.
 * Safely maps existing users (role 'USER') to 'STUDENT',
 * sets accountStatus = 'ACTIVE', isLegacy = true, and populates
 * canonical email and phone fields.
 * Idempotent: can be run safely multiple times.
 */

async function migrateLegacyUsers() {
  console.log("=================================================");
  console.log("[MIGRATE:LEGACY] Starting legacy user migration...");
  console.log("=================================================");

  let dbUpdated = 0;
  let diskUpdated = 0;

  // 1. Migrate in PostgreSQL (if DATABASE_URL is configured)
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      console.log("[MIGRATE:LEGACY] Checking PostgreSQL database...");
      const usersToMigrate = await prisma.user.findMany({
        where: {
          OR: [
            { role: "USER" },
            { isLegacy: false, accountStatus: "ACTIVE", emailCanonical: null },
          ],
        },
      });

      console.log(`[MIGRATE:LEGACY] Found ${usersToMigrate.length} legacy accounts to upgrade in DB.`);

      for (const u of usersToMigrate) {
        const canonical = canonicalizeEmail(u.email);
        const phoneE164 = u.phone ? normalizePhone(u.phone) : null;

        await prisma.user.update({
          where: { id: u.id },
          data: {
            role: (u.role as string) === "USER" ? ("STUDENT" as any) : u.role,
            accountStatus: "ACTIVE",
            isLegacy: true,
            emailCanonical: u.emailCanonical || canonical,
            phoneE164: u.phoneE164 || phoneE164,
          },
        });
        dbUpdated++;
      }
      console.log(`[MIGRATE:LEGACY] Successfully migrated ${dbUpdated} database users.`);
    } catch (err) {
      console.warn("[MIGRATE:LEGACY] Database migration skipped or failed:", (err as Error).message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log("[MIGRATE:LEGACY] DATABASE_URL not set; skipping DB migration.");
  }

  // 2. Migrate local disk auth store (.data/auth-users.json)
  const diskFilePath = path.join(process.cwd(), ".data", "auth-users.json");
  if (fs.existsSync(diskFilePath)) {
    try {
      console.log("[MIGRATE:LEGACY] Checking local disk store at:", diskFilePath);
      const raw = fs.readFileSync(diskFilePath, "utf8");
      const list = JSON.parse(raw);

      if (Array.isArray(list)) {
        let changed = false;
        const updatedList = list.map((user: any) => {
          let modified = false;
          let role = user.role;
          if (role === "USER") {
            role = "STUDENT";
            modified = true;
          }
          const emailCanonical = user.emailCanonical || canonicalizeEmail(user.email || "");
          const phoneE164 = user.phone ? normalizePhone(user.phone) : user.phoneE164;
          const accountStatus = user.accountStatus || "ACTIVE";
          const isLegacy = user.isLegacy !== undefined ? user.isLegacy : true;

          if (modified || !user.emailCanonical || !user.accountStatus) {
            diskUpdated++;
            changed = true;
            return {
              ...user,
              role,
              emailCanonical,
              phoneE164,
              accountStatus,
              isLegacy,
            };
          }
          return user;
        });

        if (changed) {
          fs.writeFileSync(diskFilePath, JSON.stringify(updatedList, null, 2), "utf8");
          console.log(`[MIGRATE:LEGACY] Migrated ${diskUpdated} accounts in disk store.`);
        } else {
          console.log("[MIGRATE:LEGACY] Local disk store accounts are already up to date.");
        }
      }
    } catch (err) {
      console.warn("[MIGRATE:LEGACY] Disk store migration failed:", (err as Error).message);
    }
  }

  console.log("=================================================");
  console.log(`[MIGRATE:LEGACY] Completed. DB updated: ${dbUpdated}, Disk updated: ${diskUpdated}`);
  console.log("=================================================");
}

migrateLegacyUsers().catch((err) => {
  console.error("[MIGRATE:LEGACY_FATAL]", err);
  process.exit(1);
});
