import { SignJWT, jwtVerify } from "jose";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";

const SIGNUP_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "gowithstudy-signup-state-machine-secret-32chars"
);

export type SignupState =
  | "PENDING_EMAIL"
  | "PENDING_PHONE"
  | "PENDING_PROFILE"
  | "ACTIVE";

export interface SignupTokenPayload {
  state: SignupState;
  emailCanonical: string;
  emailVerifiedAt?: string;
  phoneCanonical?: string;
  phoneVerifiedAt?: string;
  ipHash: string;
  createdAt: string;
}

export class SignupStateMachine {
  /**
   * Signs a state token with 15-minute expiration
   */
  static async signToken(payload: SignupTokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(SIGNUP_SECRET);
  }

  /**
   * Cryptographically verifies and extracts the registration state token
   */
  static async verifyToken(token: string): Promise<SignupTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, SIGNUP_SECRET, {
        algorithms: ["HS256"],
      });
      return payload as unknown as SignupTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Initiates registration and creates signed state token
   */
  static async startRegistration(
    emailCanonical: string,
    ipHash: string
  ): Promise<string> {
    return this.signToken({
      state: "PENDING_EMAIL",
      emailCanonical,
      ipHash,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Verifies Email OTP and transitions state to PENDING_PHONE
   */
  static async verifyEmailAndAdvance(
    token: string,
    challengeId: string,
    submittedCode: string
  ): Promise<{
    success: boolean;
    updatedToken?: string;
    error?: string;
    remainingAttempts?: number;
  }> {
    const payload = await this.verifyToken(token);
    if (!payload || payload.state !== "PENDING_EMAIL") {
      return {
        success: false,
        error: "Invalid or expired registration session. Please start over.",
      };
    }

    // Verify OTP challenge
    const verifyResult = OtpChallengeStore.verifyChallenge({
      challengeId,
      submittedCode,
    });

    if (!verifyResult.success || !verifyResult.challenge) {
      return {
        success: false,
        error: verifyResult.error,
        remainingAttempts: verifyResult.remainingAttempts,
      };
    }

    // Ensure challenge target matches registration token
    if (verifyResult.challenge.targetCanonical !== payload.emailCanonical) {
      return {
        success: false,
        error: "Verification code does not match registered email.",
      };
    }

    // Advance state
    const requirePhone = process.env.AUTH_REQUIRE_PHONE_OTP !== "false";
    const nextState: SignupState = requirePhone ? "PENDING_PHONE" : "PENDING_PROFILE";

    const updatedToken = await this.signToken({
      ...payload,
      state: nextState,
      emailVerifiedAt: new Date().toISOString(),
    });

    return {
      success: true,
      updatedToken,
    };
  }

  /**
   * Verifies Phone OTP and transitions state to PENDING_PROFILE
   */
  static async verifyPhoneAndAdvance(
    token: string,
    phoneCanonical: string,
    challengeId: string,
    submittedCode: string
  ): Promise<{
    success: boolean;
    updatedToken?: string;
    error?: string;
    remainingAttempts?: number;
  }> {
    const payload = await this.verifyToken(token);
    if (!payload || payload.state !== "PENDING_PHONE") {
      return {
        success: false,
        error: "Invalid registration state. Please verify your email first.",
      };
    }

    const verifyResult = OtpChallengeStore.verifyChallenge({
      challengeId,
      submittedCode,
    });

    if (!verifyResult.success || !verifyResult.challenge) {
      return {
        success: false,
        error: verifyResult.error,
        remainingAttempts: verifyResult.remainingAttempts,
      };
    }

    if (verifyResult.challenge.targetCanonical !== phoneCanonical) {
      return {
        success: false,
        error: "Verification code does not match registered mobile number.",
      };
    }

    // Advance state to PENDING_PROFILE
    const updatedToken = await this.signToken({
      ...payload,
      state: "PENDING_PROFILE",
      phoneCanonical,
      phoneVerifiedAt: new Date().toISOString(),
    });

    return {
      success: true,
      updatedToken,
    };
  }

  /**
   * Asserts whether all prerequisites for finalizing account creation are satisfied
   */
  static assertCanComplete(payload: SignupTokenPayload): {
    canComplete: boolean;
    error?: string;
  } {
    if (payload.state !== "PENDING_PROFILE") {
      return {
        canComplete: false,
        error: "Registration incomplete. Please finish email and mobile verification.",
      };
    }

    if (!payload.emailVerifiedAt) {
      return {
        canComplete: false,
        error: "Email verification is required before account creation.",
      };
    }

    const requirePhone = process.env.AUTH_REQUIRE_PHONE_OTP !== "false";
    if (requirePhone && !payload.phoneVerifiedAt) {
      return {
        canComplete: false,
        error: "Mobile number verification is required before account creation.",
      };
    }

    return { canComplete: true };
  }
}
