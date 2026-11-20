"use server";

import { ApplicationService } from "@/services/application-service";
import { hashPasswordArgon2 } from "@/lib/crypto-auth";
import {
  createSessionToken,
  setSessionCookie,
  SESSION_DURATION_DEFAULT,
} from "@/lib/auth";
import type { ActionResult } from "@/features/auth/actions";

/**
 * Validates the activation token on page load.
 */
export async function checkActivationTokenAction(
  token: string
): Promise<ActionResult<{ applicantName: string; email: string; type: string }>> {
  const res = await ApplicationService.validateActivationToken(token);
  if (!res.valid || !res.application) {
    return { success: false, message: res.message || "Invalid activation link." };
  }

  return {
    success: true,
    data: {
      applicantName: res.application.fullName,
      email: res.application.email,
      type: res.application.type,
    },
  };
}

/**
 * Consumes the activation token via POST, hashes password with Argon2id,
 * activates the user, and signs them in.
 */
export async function completeActivationAction(params: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult<{ redirectUrl: string }>> {
  const { token, password, confirmPassword } = params;

  if (!token || token.trim().length < 32) {
    return { success: false, message: "Invalid activation token." };
  }

  if (!password || password.length < 10) {
    return { success: false, message: "Password must be at least 10 characters." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  // Hash password using high-assurance Argon2id
  const passwordHash = await hashPasswordArgon2(password);

  const activationRes = await ApplicationService.activateAccount({
    rawToken: token.trim(),
    passwordHash,
  });

  if (!activationRes.success || !activationRes.user) {
    return { success: false, message: activationRes.message };
  }

  const user = activationRes.user;

  // Issue session cookie so student/educator lands straight on their dashboard
  const sessionToken = await createSessionToken(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      sessionId: `ses_act_${Date.now()}`,
    },
    SESSION_DURATION_DEFAULT
  );

  await setSessionCookie(sessionToken, SESSION_DURATION_DEFAULT);

  const redirectUrl = user.role === "TEACHER" ? "/teacher" : "/dashboard";

  return {
    success: true,
    message: "Account activated successfully! Redirecting to your dashboard...",
    data: { redirectUrl },
  };
}
