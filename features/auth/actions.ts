"use server";

import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/schemas/auth";
import { AuthService } from "@/services/auth-service";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  SESSION_DURATION_DEFAULT,
  SESSION_DURATION_REMEMBER,
} from "@/lib/auth";
import { redirect } from "next/navigation";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Handles student registration.
 */
export async function signupAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ verificationToken: string; email: string }>> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    college: formData.get("college"),
    course: formData.get("course"),
    branch: formData.get("branch"),
    year: formData.get("year"),
    semester: formData.get("semester"),
  };

  const validation = signupSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    const { user, verificationToken } = await AuthService.signup(validation.data);

    // Automatically create session for smooth onboarding with 60-day longevity
    const sessionToken = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        sessionId: `ses_${Date.now()}`,
      },
      SESSION_DURATION_REMEMBER
    );

    await setSessionCookie(sessionToken, SESSION_DURATION_REMEMBER);

    return {
      success: true,
      message: "Account created successfully! Check your email to verify your address.",
      data: { verificationToken, email: user.email },
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed.",
    };
  }
}

/**
 * Handles student/admin login with persistent cross-device cookies.
 */
export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on" || formData.get("rememberMe") === "true",
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    const { user, sessionId } = await AuthService.login(validation.data);
    const duration = validation.data.rememberMe
      ? SESSION_DURATION_REMEMBER
      : SESSION_DURATION_DEFAULT;

    const token = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        sessionId,
      },
      duration
    );

    await setSessionCookie(token, duration);

    return { success: true, message: "Welcome back! Redirecting to dashboard..." };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed.",
    };
  }
}

/**
 * Handles seamless Google / Gmail login and auto-registration.
 * Once a student signs in with Gmail on desktop or mobile, their session is permanently saved.
 */
export async function googleSignInAction(params: {
  email: string;
  name?: string;
  avatarUrl?: string;
}): Promise<ActionResult<{ email: string; name: string; redirectUrl: string }>> {
  try {
    const email = params.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please provide a valid Gmail address." };
    }

    const { user, sessionId, isNewUser } = await AuthService.googleAuth({
      email,
      name: params.name,
      avatarUrl: params.avatarUrl,
    });

    const duration = SESSION_DURATION_REMEMBER; // 60 days
    const sessionToken = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        sessionId,
      },
      duration
    );

    await setSessionCookie(sessionToken, duration);

    return {
      success: true,
      message: isNewUser
        ? `Welcome to GoWithStudy, ${user.name}! Your account has been prepared.`
        : `Welcome back, ${user.name}! Redirecting to dashboard...`,
      data: {
        email: user.email,
        name: user.name,
        redirectUrl: "/dashboard",
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Google authentication failed.",
    };
  }
}

/**
 * Logs out the current device.
 */
export async function logoutAction(): Promise<void> {
  const session = await getSession();
  if (session?.sessionId) {
    await AuthService.logout(session.sessionId);
  }
  await clearSessionCookie();
  redirect("/");
}

/**
 * Logs out across all devices by invalidating all user sessions.
 */
export async function logoutAllDevicesAction(): Promise<void> {
  const session = await getSession();
  if (session?.userId) {
    await AuthService.logoutAllDevices(session.userId);
  }
  await clearSessionCookie();
  redirect("/login");
}

/**
 * Requests a password reset link without leaking account existence.
 */
export async function forgotPasswordAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ resetToken?: string }>> {
  const rawData = { email: formData.get("email") };
  const validation = forgotPasswordSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: { email: validation.error.issues[0]?.message || "Invalid email" },
    };
  }

  const result = await AuthService.requestPasswordReset(validation.data.email);

  return {
    success: true,
    message:
      "If an account exists with this email, you will receive password reset instructions shortly.",
    data: { resetToken: result.token },
  };
}

/**
 * Resets the password with a valid token.
 */
export async function resetPasswordAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    await AuthService.resetPassword(validation.data.token, validation.data.password);
    return {
      success: true,
      message: "Password updated successfully! You can now log in with your new credentials.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Password reset failed.",
    };
  }
}

/**
 * Verifies email token.
 */
export async function verifyEmailAction(token: string): Promise<ActionResult> {
  const validation = verifyEmailSchema.safeParse({ token });
  if (!validation.success) {
    return { success: false, message: "Invalid verification token format." };
  }

  try {
    const user = await AuthService.verifyEmail(token);
    return {
      success: true,
      message: `Email verified successfully for ${user.email}!`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Verification failed.",
    };
  }
}
