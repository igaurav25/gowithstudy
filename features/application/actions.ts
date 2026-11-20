"use server";

import { headers } from "next/headers";
import {
  studentApplicationSchema,
  teacherApplicationSchema,
  applicationLookupSchema,
  StudentApplicationInput,
  TeacherApplicationInput,
  ApplicationLookupInput,
} from "@/schemas/application";
import { ApplicationService } from "@/services/application-service";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";
import { canonicalizeEmail } from "@/lib/canonicalize";
import { verifyTurnstileToken } from "@/lib/turnstile";
import type { ActionResult } from "@/features/auth/actions";

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

async function getUserAgent(): Promise<string> {
  try {
    const h = await headers();
    return h.get("user-agent") || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Dispatches an email OTP for verifying applicant contact before application submission.
 */
export async function sendApplicationEmailOtpAction(params: {
  email: string;
  turnstileToken?: string;
}): Promise<ActionResult<{ challengeId: string; cooldownSeconds: number }>> {
  const cleanEmail = params.email.trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  const clientIp = await getClientIp();

  // Validate Turnstile bot check if configured
  if (params.turnstileToken) {
    const turnstileOk = await verifyTurnstileToken(params.turnstileToken, clientIp);
    if (!turnstileOk.success) {
      return { success: false, message: "Bot verification check failed." };
    }
  }

  const canonical = canonicalizeEmail(cleanEmail);
  const result = await OtpChallengeStore.createChallenge({
    purpose: "APPLICATION_EMAIL",
    channel: "EMAIL",
    targetCanonical: canonical,
    clientIp,
  });

  if (!result.success || !result.challengeId) {
    return { success: false, message: result.error || "Failed to dispatch verification code." };
  }

  return {
    success: true,
    message: "A 6-digit verification code has been sent to your email.",
    data: {
      challengeId: result.challengeId,
      cooldownSeconds: result.cooldownSeconds || 30,
    },
  };
}

/**
 * Verifies the 6-digit OTP code sent to the applicant's email.
 */
export async function verifyApplicationEmailOtpAction(params: {
  challengeId: string;
  email: string;
  otpCode: string;
}): Promise<ActionResult<{ verified: boolean }>> {
  const cleanCode = params.otpCode.trim();
  if (cleanCode.length !== 6) {
    return { success: false, message: "Please enter the complete 6-digit code." };
  }

  const clientIp = await getClientIp();
  const canonical = canonicalizeEmail(params.email);

  const verification = OtpChallengeStore.verifyChallenge({
    challengeId: params.challengeId,
    submittedCode: cleanCode,
  });

  if (!verification.success) {
    return { success: false, message: verification.error || "Invalid or expired code." };
  }

  return {
    success: true,
    message: "Email address verified successfully.",
    data: { verified: true },
  };
}

/**
 * Submits a validated student application.
 */
export async function submitStudentApplicationAction(
  data: StudentApplicationInput
): Promise<ActionResult<{ referenceId: string }>> {
  const parsed = studentApplicationSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid application fields.";
    return { success: false, message: msg };
  }

  const ip = await getClientIp();
  const userAgent = await getUserAgent();

  const res = await ApplicationService.submitStudentApplication(parsed.data, { ip, userAgent });
  if (!res.success) {
    return { success: false, message: res.message };
  }

  return {
    success: true,
    message: res.message,
    data: { referenceId: res.referenceId! },
  };
}

/**
 * Submits a validated teacher/educator application.
 */
export async function submitTeacherApplicationAction(
  data: TeacherApplicationInput
): Promise<ActionResult<{ referenceId: string }>> {
  const parsed = teacherApplicationSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid application fields.";
    return { success: false, message: msg };
  }

  const ip = await getClientIp();
  const userAgent = await getUserAgent();

  const res = await ApplicationService.submitTeacherApplication(parsed.data, { ip, userAgent });
  if (!res.success) {
    return { success: false, message: res.message };
  }

  return {
    success: true,
    message: res.message,
    data: { referenceId: res.referenceId! },
  };
}

/**
 * Looks up status of a submitted application using Reference ID and Email.
 */
export async function lookupApplicationStatusAction(
  data: ApplicationLookupInput
): Promise<ActionResult<{ application: any }>> {
  const parsed = applicationLookupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Please enter a valid Reference ID and Email." };
  }

  const res = await ApplicationService.lookupStatus(parsed.data);
  if (!res.success || !res.application) {
    return { success: false, message: res.message };
  }

  return {
    success: true,
    message: res.message,
    data: { application: res.application },
  };
}
