import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // STRICT SECURITY GUARD: Seeding is completely forbidden in production environments
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("Seeding is strictly forbidden in production environments.");
  }

  console.log("[SEED] Running database seed for non-production development environment...");
  console.log("[SEED] SECURITY POLICY: Admin and Super Admin accounts are NEVER seeded.");
  console.log("[SEED] To create a Super Admin account, use: npm run admin:bootstrap");

  // Non-production reference / lookup data can be seeded here if required in the future
  console.log("[SEED] Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("[SEED_ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
