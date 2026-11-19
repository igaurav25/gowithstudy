import crypto from "crypto";

export interface PwnedCheckResult {
  isBreached: boolean;
  breachCount: number;
}

/**
 * Checks a password against HaveIBeenPwned's breached password database
 * using the k-Anonymity privacy model.
 *
 * Privacy Guarantee:
 * - Only the first 5 characters of the SHA-1 hash are transmitted.
 * - The actual password and remaining 35 characters of the hash never leave the server.
 */
export async function checkPwnedPassword(
  password: string
): Promise<PwnedCheckResult> {
  if (!password || password.length === 0) {
    return { isBreached: false, breachCount: 0 };
  }

  // 1. Compute uppercase SHA-1 of password
  const sha1 = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();

  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true", // Padding against traffic analysis
        "User-Agent": "GoWithStudy-Auth-Security",
      },
      // 3-second timeout to avoid holding up signup on slow networks
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      // In offline/sandboxed environments or API downtime, pass gracefully
      return { isBreached: false, breachCount: 0 };
    }

    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(":");
      if (hashSuffix === suffix) {
        const count = parseInt(countStr || "0", 10);
        return { isBreached: true, breachCount: count };
      }
    }

    return { isBreached: false, breachCount: 0 };
  } catch {
    // If offline or blocked by sandbox/firewall, fail open so user signup is not broken
    return { isBreached: false, breachCount: 0 };
  }
}
