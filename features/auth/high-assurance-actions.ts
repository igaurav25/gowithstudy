"use server";

import { z } from "zod";
import { cookies, headers } from "next/headers";
import {
  canonicalizeEmail,
  isDisposableEmail,
  canonicalizePhone,
  maskEmail,
  maskPhone,
} from "@/lib/canonicalize";
import {
  hashPasswordArgon2,
  verifyPasswordUnified,
  generateDeviceToken,
  hashIpAddress,
} from "@/lib/crypto-auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkPwnedPassword } from "@/lib/pwned-password";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";
import {
  SignupStateMachine,
} from "@/services/auth/signup-state-machine";
import { AuthService } from "@/services/auth-service";
import {
  createSessionToken,
  setSessionCookie,
  SESSION_DURATION_REMEMBER,
  SESSION_DURATION_DEFAULT,
} from "@/lib/auth";
import { ActionResult } from "@/features/auth/actions";

const DEVICE_COOKIE_NAME = "gowithstudy_device";

async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    return (
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      "127.0.0.1"
    );
  } catch {
    return "127.0.0.1";
  }
}

// ==========================================
// 1. SIGNUP STEP 1: START & SEND EMAIL OTP
// ==========================================

export async function startSignupFlowAction(params: {
  email: string;
  turnstileToken?: string;
}): Promise<
  ActionResult<{
    signupToken: string;
    challengeId: string;
    cooldownSeconds: number;
    maskedEmail: string;
  }>
> {
  const rawEmail = params.email.trim();
  if (!rawEmail || !rawEmail.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  // 1. Bot Gate (Turnstile)
  const clientIp = await getClientIp();
  const botCheck = await verifyTurnstileToken(params.turnstileToken || "", clientIp);
  if (!botCheck.success) {
    return {
      success: false,
      message: "Anti-bot verification failed. Please try again.",
    };
  }

  // 2. Reject Disposable Domains
  if (isDisposableEmail(rawEmail)) {
    return {
      success: false,
      message: "Disposable temporary email addresses are not permitted for student accounts.",
    };
  }

  // 3. Canonicalize & Check Duplication
  const canonicalEmail = canonicalizeEmail(rawEmail);
  const existingUser = await AuthService.getUserByEmail(canonicalEmail);
  if (existingUser) {
    return {
      success: false,
      message: "An account with this email address already exists. Please log in.",
    };
  }

  // 4. Create Initial Signed Token
  const ipHash = hashIpAddress(clientIp);
  const signupToken = await SignupStateMachine.startRegistration(
    canonicalEmail,
    ipHash
  );

  // 5. Issue OTP Challenge
  const challengeResult = await OtpChallengeStore.createChallenge({
    purpose: "SIGNUP_EMAIL",
    channel: "EMAIL",
    targetCanonical: canonicalEmail,
    clientIp,
  });

  if (!challengeResult.success || !challengeResult.challengeId) {
    return {
      success: false,
      message: challengeResult.error || "Failed to dispatch email verification code.",
    };
  }

  return {
    success: true,
    message: `Verification code sent to ${maskEmail(canonicalEmail)}.`,
    data: {
      signupToken,
      challengeId: challengeResult.challengeId,
      cooldownSeconds: challengeResult.cooldownSeconds || 30,
      maskedEmail: maskEmail(canonicalEmail),
    },
  };
}

// ==========================================
// 2. SIGNUP STEP 2: VERIFY EMAIL OTP
// ==========================================

export async function verifySignupEmailOtpAction(params: {
  signupToken: string;
  challengeId: string;
  otpCode: string;
}): Promise<
  ActionResult<{
    updatedToken: string;
    nextStep: "PHONE" | "PROFILE";
  }>
> {
  const cleanCode = params.otpCode.trim();
  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, message: "Please enter the 6-digit verification code." };
  }

  const result = await SignupStateMachine.verifyEmailAndAdvance(
    params.signupToken,
    params.challengeId,
    cleanCode
  );

  if (!result.success || !result.updatedToken) {
    return {
      success: false,
      message: result.error || "Invalid verification code.",
    };
  }

  const requirePhone = process.env.AUTH_REQUIRE_PHONE_OTP !== "false";
  return {
    success: true,
    message: "Email address verified successfully!",
    data: {
      updatedToken: result.updatedToken,
      nextStep: requirePhone ? "PHONE" : "PROFILE",
    },
  };
}

// ==========================================
// 3. SIGNUP STEP 3: SEND PHONE OTP (SMS / WA)
// ==========================================

export async function sendSignupPhoneOtpAction(params: {
  signupToken: string;
  phone: string;
  channel?: "WHATSAPP" | "SMS";
}): Promise<
  ActionResult<{
    challengeId: string;
    cooldownSeconds: number;
    maskedPhone: string;
    normalizedPhone: string;
  }>
> {
  const tokenPayload = await SignupStateMachine.verifyToken(params.signupToken);
  if (!tokenPayload || tokenPayload.state !== "PENDING_PHONE") {
    return {
      success: false,
      message: "Please verify your email address before setting up mobile authentication.",
    };
  }

  const phoneValidation = canonicalizePhone(params.phone);
  if (!phoneValidation.isValid) {
    return {
      success: false,
      message: phoneValidation.errorMessage || "Please enter a valid 10-digit mobile number.",
    };
  }

  const clientIp = await getClientIp();
  const selectedChannel = params.channel || "WHATSAPP";

  const challengeResult = await OtpChallengeStore.createChallenge({
    purpose: "SIGNUP_PHONE",
    channel: selectedChannel,
    targetCanonical: phoneValidation.e164,
    clientIp,
    originDomain: "gowithstudy.vercel.app",
  });

  if (!challengeResult.success || !challengeResult.challengeId) {
    return {
      success: false,
      message: challengeResult.error || "Failed to dispatch mobile verification code.",
    };
  }

  return {
    success: true,
    message: `Verification code dispatched to ${maskPhone(phoneValidation.e164)}.`,
    data: {
      challengeId: challengeResult.challengeId,
      cooldownSeconds: challengeResult.cooldownSeconds || 30,
      maskedPhone: maskPhone(phoneValidation.e164),
      normalizedPhone: phoneValidation.e164,
    },
  };
}

// ==========================================
// 4. SIGNUP STEP 4: VERIFY PHONE OTP
// ==========================================

export async function verifySignupPhoneOtpAction(params: {
  signupToken: string;
  phone: string;
  challengeId: string;
  otpCode: string;
}): Promise<
  ActionResult<{
    updatedToken: string;
  }>
> {
  const cleanCode = params.otpCode.trim();
  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, message: "Please enter the 6-digit verification code." };
  }

  const phoneValidation = canonicalizePhone(params.phone);
  if (!phoneValidation.isValid) {
    return { success: false, message: "Invalid phone number format." };
  }

  const result = await SignupStateMachine.verifyPhoneAndAdvance(
    params.signupToken,
    phoneValidation.e164,
    params.challengeId,
    cleanCode
  );

  if (!result.success || !result.updatedToken) {
    return {
      success: false,
      message: result.error || "Invalid mobile verification code.",
    };
  }

  return {
    success: true,
    message: "Mobile number verified successfully!",
    data: {
      updatedToken: result.updatedToken,
    },
  };
}

// ==========================================
// 5. SIGNUP STEP 5: FINALIZE PROFILE & USER
// ==========================================

const completeProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(10, "Password must be at least 10 characters for student security"),
  college: z.string().trim().min(2, "Please select or enter your college name"),
  course: z.string().trim().min(2, "Course is required (e.g. B.Tech)"),
  branch: z.string().trim().min(2, "Branch / Department is required"),
  year: z.coerce.number().int().min(1).max(5),
  semester: z.coerce.number().int().min(1).max(10),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "You must consent to terms and privacy policy to register.",
  }),
});

export async function completeRegistrationAction(params: {
  signupToken: string;
  formData: z.infer<typeof completeProfileSchema>;
}): Promise<ActionResult<{ redirectUrl: string }>> {
  // 1. Verify Token & State Machine
  const tokenPayload = await SignupStateMachine.verifyToken(params.signupToken);
  if (!tokenPayload) {
    return {
      success: false,
      message: "Registration session expired. Please start over.",
    };
  }

  const canCompleteCheck = SignupStateMachine.assertCanComplete(tokenPayload);
  if (!canCompleteCheck.canComplete) {
    return {
      success: false,
      message: canCompleteCheck.error || "Prerequisites not fulfilled.",
    };
  }

  // 2. Validate Profile Input
  const val = completeProfileSchema.safeParse(params.formData);
  if (!val.success) {
    return {
      success: false,
      errors: Object.fromEntries(
        val.error.issues.map((i) => [i.path[0] as string, i.message])
      ),
    };
  }

  // 3. Breached Password Check (HIBP k-Anonymity)
  const pwnedResult = await checkPwnedPassword(val.data.password);
  if (pwnedResult.isBreached && pwnedResult.breachCount > 10) {
    return {
      success: false,
      message:
        "This password has appeared in known public data breaches. Please choose a more unique, secure password.",
    };
  }

  // 4. Hash Password with Argon2id
  const argon2Hash = await hashPasswordArgon2(val.data.password);

  // 5. Create Student Account
  try {
    const { user, sessionId } = await AuthService.registerStudentWithArgon2({
      email: tokenPayload.emailCanonical,
      phone: tokenPayload.phoneCanonical,
      username: val.data.username,
      name: val.data.name,
      passwordHash: argon2Hash,
      college: val.data.college,
      course: val.data.course,
      branch: val.data.branch,
      year: val.data.year,
      semester: val.data.semester,
    });

    // 6. Set 60-day Session Cookie
    const sessionToken = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
        course: user.course,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        sessionId,
      },
      SESSION_DURATION_REMEMBER
    );

    await setSessionCookie(sessionToken, SESSION_DURATION_REMEMBER);

    // 7. Set Rotating Trusted Device Cookie (30 days)
    const { rawToken } = generateDeviceToken();
    try {
      const cookieStore = await cookies();
      cookieStore.set(DEVICE_COOKIE_NAME, rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    } catch {
      // In test runner without request store
    }

    return {
      success: true,
      message: "Account verified and registered successfully!",
      data: { redirectUrl: "/dashboard" },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to finalize registration.",
    };
  }
}

// ==========================================
// 6. RETURNING USER LOGIN WITH STEP-UP OTP
// ==========================================

export async function loginWithIdentifierAction(params: {
  identifier: string; // username, email, or phone
  password: string;
  rememberMe?: boolean;
}): Promise<
  ActionResult<{
    redirectUrl?: string;
    requiresStepUp?: boolean;
    challengeId?: string;
    maskedTarget?: string;
    channel?: string;
  }>
> {
  const trimmed = params.identifier.trim();
  if (!trimmed || !params.password) {
    return { success: false, message: "ID and password are required." };
  }

  // Find user by username, canonical email, or phone
  const user = await AuthService.getUserByIdentifier(trimmed);
  if (!user) {
    return { success: false, message: "ID or password is incorrect." };
  }

  // Unified Password Verification (Argon2id + legacy bcrypt fallback)
  const passwordCheck = await verifyPasswordUnified(params.password, user.passwordHash);
  if (!passwordCheck.isValid) {
    return { success: false, message: "ID or password is incorrect." };
  }

  // Transparently re-hash legacy bcrypt to Argon2id in background
  if (passwordCheck.needsRehash) {
    hashPasswordArgon2(params.password)
      .then((newHash) => AuthService.updatePasswordHash(user.id, newHash))
      .catch((err) => console.error("Transparent rehash error:", err));
  }

  // Check if current device has valid trusted device token
  let rawDeviceToken: string | undefined;
  try {
    const cookieStore = await cookies();
    rawDeviceToken = cookieStore.get(DEVICE_COOKIE_NAME)?.value;
  } catch {
    // In test runner without request store
  }
  const isTrusted = rawDeviceToken
    ? AuthService.isDeviceTokenTrusted(user.id, rawDeviceToken)
    : false;

  // Case A: Trusted Device -> Direct login
  if (isTrusted) {
    const duration = params.rememberMe
      ? SESSION_DURATION_REMEMBER
      : SESSION_DURATION_DEFAULT;

    const sessionId = `ses_${Date.now()}`;
    const token = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
        course: user.course,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        sessionId,
      },
      duration
    );

    await setSessionCookie(token, duration);
    return { success: true, data: { redirectUrl: "/dashboard" } };
  }

  // Case B: Untrusted Device / New Device -> Issue Step-Up Challenge
  const clientIp = await getClientIp();
  const challengeResult = await OtpChallengeStore.createChallenge({
    purpose: "LOGIN_STEP_UP",
    channel: "EMAIL",
    targetCanonical: user.email,
    clientIp,
  });

  if (!challengeResult.success || !challengeResult.challengeId) {
    return {
      success: false,
      message: "Unable to send step-up verification code. Please try again.",
    };
  }

  return {
    success: true,
    message: "New device detected. Verification code sent to your registered contact.",
    data: {
      requiresStepUp: true,
      challengeId: challengeResult.challengeId,
      maskedTarget: maskEmail(user.email),
      channel: "EMAIL",
    },
  };
}

// ==========================================
// 7. VERIFY STEP-UP OTP & REGISTER DEVICE
// ==========================================

export async function verifyStepUpLoginAction(params: {
  challengeId: string;
  otpCode: string;
  identifier: string;
  rememberDevice?: boolean;
}): Promise<ActionResult<{ redirectUrl: string }>> {
  const cleanCode = params.otpCode.trim();
  const user = await AuthService.getUserByIdentifier(params.identifier.trim());
  if (!user) {
    return { success: false, message: "User session expired." };
  }

  const verifyResult = OtpChallengeStore.verifyChallenge({
    challengeId: params.challengeId,
    submittedCode: cleanCode,
  });

  if (!verifyResult.success) {
    return {
      success: false,
      message: verifyResult.error || "Invalid verification code.",
    };
  }

  // Establish Session
  const sessionId = `ses_${Date.now()}`;
  const token = await createSessionToken(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      college: user.college,
      course: user.course,
      branch: user.branch,
      year: user.year,
      semester: user.semester,
      sessionId,
    },
    SESSION_DURATION_REMEMBER
  );

  await setSessionCookie(token, SESSION_DURATION_REMEMBER);

  // Register Device if rememberDevice is requested
  if (params.rememberDevice !== false) {
    const { rawToken, tokenHash } = generateDeviceToken();
    AuthService.saveTrustedDevice(user.id, tokenHash);

    try {
      const cookieStore = await cookies();
      cookieStore.set(DEVICE_COOKIE_NAME, rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    } catch {
      // In test runner without request store
    }
  }

  return {
    success: true,
    message: "Verification successful! Welcome back.",
    data: { redirectUrl: "/dashboard" },
  };
}
