import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constantTimeCompare } from "@/lib/constant-time";
import { hashPasswordArgon2 } from "@/lib/crypto-auth";
import {
  generateTotpSecret,
  encryptTotpSecret,
  generateTotpUri,
  generateBackupCodes,
  hashBackupCode,
} from "@/lib/totp";
import { canonicalizeEmail } from "@/lib/canonicalize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleBootstrap(req);
}

export async function POST(req: NextRequest) {
  return handleBootstrap(req);
}

async function handleBootstrap(req: NextRequest) {
  let token = req.nextUrl.searchParams.get("token")?.trim() || "";
  let email = req.nextUrl.searchParams.get("email")?.trim() || "joshii.igaurav11@gmail.com";
  let password = req.nextUrl.searchParams.get("password") || "Gaurav@21";
  let name = req.nextUrl.searchParams.get("name") || "Gaurav Joshi";

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body.token) token = body.token.trim();
      if (body.email) email = body.email.trim();
      if (body.password) password = body.password;
      if (body.name) name = body.name;
    } catch {
      // Body parsing optional
    }
  }

  const expectedToken = process.env.ADMIN_SETUP_TOKEN?.trim() || "";

  if (!expectedToken || expectedToken.length < 16) {
    return NextResponse.json(
      { error: "Setup token not configured in environment." },
      { status: 500 }
    );
  }

  if (!constantTimeCompare(token, expectedToken)) {
    return NextResponse.json(
      { error: "Invalid setup token." },
      { status: 401 }
    );
  }

  // Check if a SUPER_ADMIN already exists in database
  const existingSuper = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, email: true },
  });

  if (existingSuper) {
    return NextResponse.json(
      {
        error: "Super Admin already exists. Bootstrap route is permanently closed.",
        email: existingSuper.email,
      },
      { status: 403 }
    );
  }

  const canonicalEmail = canonicalizeEmail(email);
  const passwordHash = await hashPasswordArgon2(password);
  const totpSecret = generateTotpSecret();
  const encryptedSecret = encryptTotpSecret(totpSecret);
  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = backupCodes.map(hashBackupCode);
  const totpUri = generateTotpUri(email, totpSecret);

  try {
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
          action: "SUPER_ADMIN_BOOTSTRAP_DIRECT",
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

    return NextResponse.json({
      success: true,
      message: "Super Admin successfully provisioned in PostgreSQL database!",
      user: {
        id: user.id,
        email: user.email,
        name,
        role: user.role,
      },
      totp: {
        secret: totpSecret,
        uri: totpUri,
      },
      backupCodes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Database provisioning failed", details: (err as Error).message },
      { status: 500 }
    );
  }
}
