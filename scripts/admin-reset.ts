import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { hashPasswordArgon2 } from "../lib/crypto-auth.ts";
import {
  generateTotpSecret,
  encryptTotpSecret,
  generateTotpUri,
  generateBackupCodes,
  hashBackupCode,
} from "../lib/totp.ts";

async function resetAdmin() {
  console.log("=================================================");
  console.log("🚨 GoWithStudy Super Admin Emergency Reset CLI");
  console.log("=================================================");

  const args = process.argv.slice(2);
  const isConfirmed = args.includes("--confirm");

  if (!isConfirmed) {
    console.error("❌ Safety Lock Active: To execute an emergency Super Admin reset, you must pass the --confirm flag.");
    console.error("   Usage: npm run admin:reset -- --confirm [--new-password <secret>]");
    process.exit(1);
  }

  const getArg = (flag: string) => {
    const withEq = args.find((a) => a.startsWith(`${flag}=`));
    if (withEq) return withEq.slice(`${flag}=`.length);
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  };

  const newPassword = getArg("--new-password") || "SuperAdmin@2026!RotatedKey";
  const newPasswordHash = await hashPasswordArgon2(newPassword);
  const newTotpSecret = generateTotpSecret();
  const encryptedSecret = encryptTotpSecret(newTotpSecret);
  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      const superAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });

      if (!superAdmin) {
        console.error("❌ No Super Admin account exists. Please run `npm run admin:bootstrap` instead.");
        process.exit(1);
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: superAdmin.id },
          data: {
            passwordHash: newPasswordHash,
            accountStatus: "ACTIVE",
            isSuspended: false,
          },
        });

        await tx.adminSecurity.upsert({
          where: { userId: superAdmin.id },
          create: {
            userId: superAdmin.id,
            totpSecretEnc: encryptedSecret.ciphertext,
            totpIv: encryptedSecret.iv,
            totpTag: encryptedSecret.tag,
            totpEnabled: true,
            backupCodes: hashedBackupCodes,
            failedAttempts: 0,
            lockedUntil: null,
          },
          update: {
            totpSecretEnc: encryptedSecret.ciphertext,
            totpIv: encryptedSecret.iv,
            totpTag: encryptedSecret.tag,
            totpEnabled: true,
            backupCodes: hashedBackupCodes,
            failedAttempts: 0,
            lockedUntil: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: superAdmin.id,
            actorRole: "SUPER_ADMIN",
            action: "SUPER_ADMIN_CREDENTIAL_RESET",
            entity: "USER",
            entityId: superAdmin.id,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        });
      });

      console.log("=================================================");
      console.log("✅ Super Admin Credentials Successfully Rotated!");
      console.log(`   Account Email: ${superAdmin.email}`);
      console.log("=================================================");
      console.log("🔐 NEW TOTP 2-FACTOR AUTHENTICATION SETUP");
      console.log(`   Secret Key:    ${newTotpSecret}`);
      console.log(`   Setup URI:     ${generateTotpUri(superAdmin.email, newTotpSecret)}`);
      console.log("=================================================");
      console.log("🎟️  10 NEW ONE-TIME BACKUP RECOVERY CODES:");
      backupCodes.forEach((code, i) => {
        console.log(`   [Code ${String(i + 1).padStart(2, "0")}]:  ${code}`);
      });
      console.log("=================================================");
    } catch (err) {
      console.error("❌ Reset failed:", (err as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    // Disk store fallback
    const diskPath = path.join(process.cwd(), ".data", "auth-users.json");
    if (!fs.existsSync(diskPath)) {
      console.error("❌ No local disk accounts found. Run `npm run admin:bootstrap` first.");
      process.exit(1);
    }

    const list: any[] = JSON.parse(fs.readFileSync(diskPath, "utf8")) || [];
    const superAdmin = list.find((u) => u.role === "SUPER_ADMIN");
    if (!superAdmin) {
      console.error("❌ No Super Admin found in disk store.");
      process.exit(1);
    }

    superAdmin.passwordHash = newPasswordHash;
    superAdmin.accountStatus = "ACTIVE";
    superAdmin.isSuspended = false;
    superAdmin.adminSecurity = {
      totpSecretEnc: encryptedSecret.ciphertext,
      totpIv: encryptedSecret.iv,
      totpTag: encryptedSecret.tag,
      totpEnabled: true,
      backupCodes: hashedBackupCodes,
    };

    fs.writeFileSync(diskPath, JSON.stringify(list, null, 2), "utf8");

    console.log("=================================================");
    console.log("✅ Super Admin Credentials Reset in Local Disk Store!");
    console.log(`   Email:      ${superAdmin.email}`);
    console.log("=================================================");
    console.log("🔐 NEW TOTP 2-FACTOR AUTHENTICATION SETUP");
    console.log(`   Secret Key: ${newTotpSecret}`);
    console.log(`   Setup URI:  ${generateTotpUri(superAdmin.email, newTotpSecret)}`);
    console.log("=================================================");
    console.log("🎟️  10 NEW ONE-TIME BACKUP RECOVERY CODES:");
    backupCodes.forEach((code, i) => {
      console.log(`   [Code ${String(i + 1).padStart(2, "0")}]:  ${code}`);
    });
    console.log("=================================================");
  }
}

resetAdmin().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
