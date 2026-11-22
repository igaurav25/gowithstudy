const { execSync } = require("child_process");

const dbUrl =
  process.env.POSTGRES_PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
    ? process.env.DATABASE_URL
    : undefined);

if (dbUrl) {
  console.log("⚡ [DB PUSH] Syncing Prisma schema to cloud database...");
  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("✅ [DB PUSH] Database schema synchronized successfully.");
  } catch (err) {
    console.warn("⚠️ [DB PUSH] Schema sync warning:", err.message);
  }
} else {
  console.log("ℹ️ [DB PUSH] No remote database configured. Skipping cloud schema push.");
}
