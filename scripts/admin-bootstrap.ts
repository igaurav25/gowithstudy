import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { hashPasswordArgon2 } from "../lib/crypto-auth.ts";
import {
  generateTotpSecret,
  encryptTotpSecret,
  generateTotpUri,
  generateBackupCodes,
  hashBackupCode,
} from "../lib/totp.ts";

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

async function bootstrapAdmin() {
  console.log("=================================================");
  console.log("🛡️  GoWithStudy Super Admin Bootstrap CLI");
  console.log("=================================================");

  // Parse arguments or environment variables
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  };

  const email = (getArg("--email") || process.env.ADMIN_BOOTSTRAP_EMAIL || "superadmin@gowithstudy.app").trim();
  const name = (getArg("--name") || process.env.ADMIN_BOOTSTRAP_NAME || "Super Administrator").trim();
  const generatedPassword = crypto.randomBytes(16).toString("base64url") + "@Gws!";
  const password = getArg("--password") || process.env.ADMIN_BOOTSTRAP_PASSWORD || generatedPassword;

  if (!email || !password || password.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters.");
    process.exit(1);
  }

  const canonicalEmail = canonicalizeEmail(email);

  // 1. Check if a SUPER_ADMIN already exists (PostgreSQL or Disk)
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });

      if (existingSuperAdmin) {
        console.error("❌ ABORT: A Super Admin already exists in the system.");
        console.error(`   Existing Super Admin ID: ${existingSuperAdmin.id} (${existingSuperAdmin.email})`);
        console.error("   To reset Super Admin credentials, run: npm run admin:reset");
        process.exit(1);
      }

      console.log(`[BOOTSTRAP] Hashing password with Argon2id...`);
      const passwordHash = await hashPasswordArgon2(password);

      console.log(`[BOOTSTRAP] Generating RFC 6238 TOTP key & 10 backup codes...`);
      const totpSecret = generateTotpSecret();
      const encryptedSecret = encryptTotpSecret(totpSecret);
      const backupCodes = generateBackupCodes(10);
      const hashedBackupCodes = backupCodes.map(hashBackupCode);

      console.log(`[BOOTSTRAP] Creating Super Admin in PostgreSQL...`);
      const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            emailCanonical: canonicalEmail,
            passwordHash,
            role: "SUPER_ADMIN",
            accountStatus: "ACTIVE",
            emailVerified: true,
            isLegacy: false,
            profile: {
              create: {
                name,
                college: "GoWithStudy Central Governance",
                course: "Platform Administration",
                branch: "Executive Office",
                year: 4,
                semester: 8,
              },
            },
            adminSecurity: {
              create: {
                totpSecretEnc: encryptedSecret.ciphertext,
                totpIv: encryptedSecret.iv,
                totpTag: encryptedSecret.tag,
                totpEnabled: true,
                backupCodes: hashedBackupCodes,
              },
            },
          },
        });

        await tx.auditLog.create({
          data: {
            userId: u.id,
            actorRole: "SUPER_ADMIN",
            action: "SUPER_ADMIN_BOOTSTRAP",
            entity: "USER",
            entityId: u.id,
            metadata: {
              emailCanonical: canonicalEmail,
              timestamp: new Date().toISOString(),
            },
          },
        });

        return u;
      });

      console.log("=================================================");
      console.log("✅ Super Admin Account Successfully Provisioned!");
      console.log(`   User ID:     ${user.id}`);
      console.log(`   Email:       ${email}`);
      console.log(`   Name:        ${name}`);
      if (!getArg("--password") && !process.env.ADMIN_BOOTSTRAP_PASSWORD) {
        console.log(`   Password:    ${password} (Generated)`);
      }
      console.log("=================================================");
      console.log("🔐 TOTP 2-FACTOR AUTHENTICATION SETUP");
      console.log(`   Secret Key:  ${totpSecret}`);
      console.log(`   Setup URI:   ${generateTotpUri(email, totpSecret)}`);
      console.log("=================================================");
      console.log("🎟️  ONE-TIME BACKUP RECOVERY CODES (Store securely!):");
      backupCodes.forEach((code, i) => {
        console.log(`   [Code ${String(i + 1).padStart(2, "0")}]:  ${code}`);
      });
      console.log("=================================================");
    } catch (err) {
      console.error("❌ Failed bootstrapping admin:", (err as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    // Disk store fallback
    const diskPath = path.join(process.cwd(), ".data", "auth-users.json");
    console.log(`[BOOTSTRAP] DATABASE_URL not set; configuring local disk store at: ${diskPath}`);

    let list: any[] = [];
    if (fs.existsSync(diskPath)) {
      list = JSON.parse(fs.readFileSync(diskPath, "utf8")) || [];
    }

    const existingSuper = list.find((u) => u.role === "SUPER_ADMIN");
    if (existingSuper) {
      console.error("❌ ABORT: A Super Admin already exists in disk store.");
      console.error(`   Existing Super Admin: ${existingSuper.email}`);
      process.exit(1);
    }

    const passwordHash = await hashPasswordArgon2(password);
    const totpSecret = generateTotpSecret();
    const encryptedSecret = encryptTotpSecret(totpSecret);
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    const superAdminUser = {
      id: `usr_super_admin_${Date.now()}`,
      name,
      email,
      emailCanonical: canonicalEmail,
      passwordHash,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE",
      college: "GoWithStudy Central Governance",
      course: "Administration",
      branch: "Executive Office",
      year: 4,
      semester: 8,
      emailVerified: true,
      isLegacy: false,
      adminSecurity: {
        totpSecretEnc: encryptedSecret.ciphertext,
        totpIv: encryptedSecret.iv,
        totpTag: encryptedSecret.tag,
        totpEnabled: true,
        backupCodes: hashedBackupCodes,
      },
      createdAt: new Date(),
    };

    list.push(superAdminUser);
    fs.mkdirSync(path.dirname(diskPath), { recursive: true });
    fs.writeFileSync(diskPath, JSON.stringify(list, null, 2), "utf8");

    console.log("=================================================");
    console.log("✅ Super Admin Account Successfully Provisioned in Disk Store!");
    console.log(`   Email:       ${email}`);
    console.log(`   Name:        ${name}`);
    if (!getArg("--password") && !process.env.ADMIN_BOOTSTRAP_PASSWORD) {
      console.log(`   Password:    ${password} (Generated)`);
    }
    console.log("=================================================");
    console.log("🔐 TOTP 2-FACTOR AUTHENTICATION SETUP");
    console.log(`   Secret Key:  ${totpSecret}`);
    console.log(`   Setup URI:   ${generateTotpUri(email, totpSecret)}`);
    console.log("=================================================");
    console.log("🎟️  ONE-TIME BACKUP RECOVERY CODES (Store securely!):");
    backupCodes.forEach((code, i) => {
      console.log(`   [Code ${String(i + 1).padStart(2, "0")}]:  ${code}`);
    });
    console.log("=================================================");
  }
}

bootstrapAdmin().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
