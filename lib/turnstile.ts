/**
 * Cloudflare Turnstile Server-Side Token Verification
 * Defeats automated SMS pumping, credential stuffing, and bot registration attacks.
 */

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
}

const TURNSTILE_VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Validates a client-submitted Cloudflare Turnstile token against Cloudflare's API.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.CF_TURNSTILE_SECRET_KEY;

  // In local test environments or when Turnstile is disabled by feature flag
  if (
    process.env.NODE_ENV === "test" ||
    !secretKey ||
    process.env.AUTH_ENABLE_TURNSTILE === "false"
  ) {
    // In dev / test, accept dummy token or any non-empty token
    if (token && token.length > 0) {
      return { success: true };
    }
    // If empty in dev, also pass to avoid blocking local developer onboarding unless strictly required
    return { success: true };
  }

  if (!token || token.trim().length === 0) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        errorCodes: [`http-status-${res.status}`],
      };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
      hostname?: string;
    };

    return {
      success: data.success,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
    };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    // Fail closed in production if verification endpoint fails
    return {
      success: false,
      errorCodes: ["verification-network-failure"],
    };
  }
}
