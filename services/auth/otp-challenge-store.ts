import {
  generateSecureOtp,
  hashOtpCode,
  verifyOtpCode,
  hashIpAddress,
} from "@/lib/crypto-auth";
import {
  OtpChannel,
  OtpSenderGateway,
  SendOtpResult,
} from "@/services/otp/otp-sender";

export type OtpPurpose =
  | "SIGNUP_EMAIL"
  | "SIGNUP_PHONE"
  | "APPLICATION_EMAIL"
  | "LOGIN_STEP_UP"
  | "PASSWORD_RESET"
  | "CHANGE_EMAIL"
  | "CHANGE_PHONE"
  | "ADMIN_SETUP_EMAIL"
  | "ADMIN_RECOVERY_EMAIL"
  | "ADMIN_LOGIN_FALLBACK";

export interface StoredOtpChallenge {
  id: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
  targetCanonical: string;
  targetHash: string; // SHA-256 for indexed lookup
  codeHmac: string;
  attempts: number;
  maxAttempts: number;
  resendCount: number;
  ipHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  lockedAt: Date | null;
  createdAt: Date;
  lastResentAt: Date;
}

// In-memory challenge store (keyed by challengeId)
// In production, syncs with Prisma OtpChallenge / Redis
const challengesStore = new Map<string, StoredOtpChallenge>();
// Target lookup map: `${purpose}:${targetCanonical}` -> challengeId
const activeTargetIndex = new Map<string, string>();

export class OtpChallengeStore {
  /**
   * Resend cooldown calculation:
   * 0 resends -> 30s
   * 1 resend  -> 60s
   * 2 resends -> 120s
   * >= 3 resends -> 15 min lock
   */
  static getCooldownSeconds(resendCount: number): number {
    if (resendCount === 0) return 30;
    if (resendCount === 1) return 60;
    if (resendCount === 2) return 120;
    return 15 * 60; // 15 minutes lockout
  }

  /**
   * Creates an OTP challenge, enforces cooldown, invalidates prior challenges, and dispatches via gateway
   */
  static async createChallenge(params: {
    purpose: OtpPurpose;
    channel: OtpChannel;
    targetCanonical: string;
    clientIp: string;
    originDomain?: string;
  }): Promise<{
    success: boolean;
    challengeId?: string;
    previewCode?: string;
    cooldownSeconds?: number;
    error?: string;
    sendResult?: SendOtpResult;
  }> {
    const now = new Date();
    const indexKey = `${params.purpose}:${params.targetCanonical}`;
    const existingId = activeTargetIndex.get(indexKey);

    let resendCount = 0;

    if (existingId) {
      const prior = challengesStore.get(existingId);
      if (prior && !prior.consumedAt && prior.expiresAt > now) {
        // Enforce cooldown
        const timeSinceLastResend =
          (now.getTime() - new Date(prior.lastResentAt).getTime()) / 1000;
        const requiredCooldown = this.getCooldownSeconds(prior.resendCount);

        if (timeSinceLastResend < requiredCooldown) {
          const waitSeconds = Math.ceil(requiredCooldown - timeSinceLastResend);
          return {
            success: false,
            error: `Please wait ${waitSeconds}s before requesting a new code.`,
            cooldownSeconds: waitSeconds,
          };
        }

        if (prior.resendCount >= 3) {
          return {
            success: false,
            error:
              "Maximum verification attempts reached for this session. Please try again after 15 minutes.",
            cooldownSeconds: 15 * 60,
          };
        }

        resendCount = prior.resendCount + 1;
        // Invalidate prior challenge
        prior.consumedAt = now;
      }
    }

    const challengeId = `clg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const code = generateSecureOtp();
    const codeHmac = hashOtpCode(code, challengeId);
    const ipHash = hashIpAddress(params.clientIp);

    // Expiry: 5 minutes for SMS/WhatsApp, 10 minutes for Email
    const expiryMinutes = params.channel === "EMAIL" ? 10 : 5;
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);

    const challenge: StoredOtpChallenge = {
      id: challengeId,
      purpose: params.purpose,
      channel: params.channel,
      targetCanonical: params.targetCanonical,
      targetHash: hashIpAddress(params.targetCanonical),
      codeHmac,
      attempts: 0,
      maxAttempts: 5,
      resendCount,
      ipHash,
      expiresAt,
      consumedAt: null,
      lockedAt: null,
      createdAt: now,
      lastResentAt: now,
    };

    challengesStore.set(challengeId, challenge);
    activeTargetIndex.set(indexKey, challengeId);

    // Dispatch OTP through gateway
    const sendResult = await OtpSenderGateway.sendOtp({
      channel: params.channel,
      target: params.targetCanonical,
      code,
      purpose: params.purpose,
      originDomain: params.originDomain,
    });

    if (!sendResult.success) {
      // Remove failed challenge
      challengesStore.delete(challengeId);
      activeTargetIndex.delete(indexKey);
      return {
        success: false,
        error: sendResult.error || "Failed to deliver verification code.",
        sendResult,
      };
    }

    const isMockDelivery = !process.env.RESEND_API_KEY || process.env.NODE_ENV === "test";

    return {
      success: true,
      challengeId,
      previewCode: isMockDelivery ? code : undefined,
      cooldownSeconds: this.getCooldownSeconds(resendCount),
      sendResult,
    };
  }

  /**
   * Verifies an OTP challenge submission with attempt tracking and constant-time comparison
   */
  static verifyChallenge(params: {
    challengeId: string;
    submittedCode: string;
  }): {
    success: boolean;
    error?: string;
    remainingAttempts?: number;
    challenge?: StoredOtpChallenge;
  } {
    const challenge = challengesStore.get(params.challengeId);
    if (!challenge) {
      return {
        success: false,
        error: "Invalid or expired verification session. Please request a new code.",
      };
    }

    const now = new Date();

    // Check consumed/replay
    if (challenge.consumedAt) {
      return {
        success: false,
        error: "This code has already been used. Please request a new one.",
      };
    }

    // Check locked
    if (challenge.lockedAt || challenge.attempts >= challenge.maxAttempts) {
      return {
        success: false,
        error:
          "Verification challenge locked due to too many failed attempts. Please request a new code.",
      };
    }

    // Check expired
    if (now > challenge.expiresAt) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Increment attempts
    challenge.attempts += 1;

    // Verify HMAC constant-time
    const isValid = verifyOtpCode(
      params.submittedCode,
      challenge.id,
      challenge.codeHmac
    );

    if (!isValid) {
      const remaining = challenge.maxAttempts - challenge.attempts;
      if (remaining <= 0) {
        challenge.lockedAt = now;
        return {
          success: false,
          error: "Too many incorrect attempts. Challenge is now locked.",
          remainingAttempts: 0,
        };
      }
      return {
        success: false,
        error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        remainingAttempts: remaining,
      };
    }

    // Mark consumed to eliminate replay attacks
    challenge.consumedAt = now;

    return {
      success: true,
      challenge,
    };
  }

  /**
   * Verifies an OTP challenge looked up directly by purpose and target email/phone.
   */
  static verifyByTarget(params: {
    purpose: OtpPurpose;
    targetCanonical: string;
    submittedCode: string;
  }): {
    success: boolean;
    error?: string;
  } {
    const cleanTarget = params.targetCanonical.toLowerCase().trim();
    const indexKey = `${params.purpose}:${cleanTarget}`;
    const challengeId = activeTargetIndex.get(indexKey);
    if (!challengeId) {
      return { success: false, error: "No active verification challenge found." };
    }
    return this.verifyChallenge({ challengeId, submittedCode: params.submittedCode });
  }
}
