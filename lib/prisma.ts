import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL?.includes("localhost")) {
    if (process.env.POSTGRES_PRISMA_DATABASE_URL) return process.env.POSTGRES_PRISMA_DATABASE_URL;
    if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  }
  return (
    process.env.POSTGRES_PRISMA_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL
  );
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
