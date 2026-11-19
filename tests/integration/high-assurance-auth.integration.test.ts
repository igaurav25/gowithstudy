import { describe, it, expect, beforeEach } from "vitest";
import {
  startSignupFlowAction,
  verifySignupEmailOtpAction,
  sendSignupPhoneOtpAction,
  verifySignupPhoneOtpAction,
  completeRegistrationAction,
  loginWithIdentifierAction,
  verifyStepUpLoginAction,
} from "@/features/auth/high-assurance-actions";
import { ConsoleOtpSender } from "@/services/otp/otp-sender";
import { AuthService } from "@/services/auth-service";
import { canonicalizeEmail } from "@/lib/canonicalize";

describe("Integration: High-Assurance End-to-End Authentication Lifecycle", () => {
  const timestamp = Date.now().toString(36);
  const testEmail = `student.lifecycle_${timestamp}@gmail.com`;
  const testPhone = "+919876543210";
  const testUsername = `student_${timestamp}`;
  const testPassword = "VerySecureStudentPassword123!";

  beforeEach(() => {
    ConsoleOtpSender.lastDispatches = [];
  });

  it("Full 4-Step Registration Flow: Email OTP -> Phone OTP -> Profile Completion -> Active User", async () => {
    // ==========================================
    // STEP 1: Submit Email & Receive Email OTP
    // ==========================================
    const step1 = await startSignupFlowAction({
      email: testEmail,
      turnstileToken: "dummy_valid_turnstile",
    });

    expect(step1.success).toBe(true);
    expect(step1.data?.signupToken).toBeDefined();
    expect(step1.data?.challengeId).toBeDefined();
    expect(step1.data?.maskedEmail).toContain("st***@gmail.com");

    const emailOtp = ConsoleOtpSender.lastDispatches.find(
      (d) => d.channel === "EMAIL"
    )!.code;
    expect(emailOtp).toMatch(/^\d{6}$/);

    // ==========================================
    // STEP 2: Verify Email OTP & Advance
    // ==========================================
    const step2 = await verifySignupEmailOtpAction({
      signupToken: step1.data!.signupToken,
      challengeId: step1.data!.challengeId,
      otpCode: emailOtp,
    });

    expect(step2.success).toBe(true);
    expect(step2.data?.updatedToken).toBeDefined();
    expect(step2.data?.nextStep).toBe("PHONE");

    // ==========================================
    // STEP 3: Submit Phone, Receive and Verify OTP
    // ==========================================
    const step3Send = await sendSignupPhoneOtpAction({
      signupToken: step2.data!.updatedToken,
      phone: testPhone,
      channel: "WHATSAPP",
    });

    expect(step3Send.success).toBe(true);
    expect(step3Send.data?.challengeId).toBeDefined();

    const phoneOtp = ConsoleOtpSender.lastDispatches.find(
      (d) => d.channel === "WHATSAPP"
    )!.code;
    expect(phoneOtp).toMatch(/^\d{6}$/);

    const step3Verify = await verifySignupPhoneOtpAction({
      signupToken: step2.data!.updatedToken,
      phone: testPhone,
      challengeId: step3Send.data!.challengeId,
      otpCode: phoneOtp,
    });

    expect(step3Verify.success).toBe(true);
    expect(step3Verify.data?.updatedToken).toBeDefined();

    // ==========================================
    // STEP 4: Finalize Profile & Create Account
    // ==========================================
    const step4 = await completeRegistrationAction({
      signupToken: step3Verify.data!.updatedToken,
      formData: {
        username: testUsername,
        name: "Arjun Verma",
        password: testPassword,
        college: "Delhi Technological University",
        course: "B.Tech",
        branch: "Computer Science",
        year: 3,
        semester: 6,
        consentGiven: true,
      },
    });

    expect(step4.success).toBe(true);
    expect(step4.data?.redirectUrl).toBe("/dashboard");

    // Verify user exists and has Argon2id hash
    const createdUser = await AuthService.getUserByIdentifier(testUsername);
    expect(createdUser).not.toBeNull();
    expect(createdUser?.username).toBe(testUsername);
    expect(createdUser?.email).toBe(canonicalizeEmail(testEmail));
    expect(createdUser?.passwordHash).toContain("$argon2id$");
  });

  it("Returning User Login: Step-Up Challenge on Untrusted Device & Direct Login on Trusted Device", async () => {
    // 1. First login from untrusted device triggers Step-Up OTP
    const loginAttempt = await loginWithIdentifierAction({
      identifier: testUsername,
      password: testPassword,
      rememberMe: true,
    });

    expect(loginAttempt.success).toBe(true);
    expect(loginAttempt.data?.requiresStepUp).toBe(true);
    expect(loginAttempt.data?.challengeId).toBeDefined();

    const stepUpOtp = ConsoleOtpSender.lastDispatches.find(
      (d) => d.purpose === "LOGIN_STEP_UP"
    )!.code;

    // 2. Complete Step-Up verification and register device
    const stepUpVerify = await verifyStepUpLoginAction({
      challengeId: loginAttempt.data!.challengeId!,
      otpCode: stepUpOtp,
      identifier: testUsername,
      rememberDevice: true,
    });

    expect(stepUpVerify.success).toBe(true);
    expect(stepUpVerify.data?.redirectUrl).toBe("/dashboard");
  });

  it("Multi-Identifier Login: Can log in via Canonical Email, Phone number, or Username", async () => {
    const byEmail = await AuthService.getUserByIdentifier(testEmail);
    expect(byEmail).not.toBeNull();
    expect(byEmail?.username).toBe(testUsername);

    const byPhone = await AuthService.getUserByIdentifier("+91 98765-43210");
    expect(byPhone).not.toBeNull();
    expect(byPhone?.email).toBe(canonicalizeEmail(testEmail));

    const byUsername = await AuthService.getUserByIdentifier(testUsername.toUpperCase());
    expect(byUsername).not.toBeNull();
    expect(byUsername?.email).toBe(canonicalizeEmail(testEmail));
  });
});
