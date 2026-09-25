import { describe, it, expect } from "vitest";
import { AuthService } from "@/services/auth-service";

describe("Integration: Full Authentication & Account Security Lifecycle", () => {
  const uniqueId = Date.now().toString(36);
  const testStudent = {
    name: "Dev Sharma",
    email: `dev.sharma_${uniqueId}@campusflow.edu`,
    password: "Password123!",
    confirmPassword: "Password123!",
    college: "Netaji Subhas University of Technology",
    course: "B.Tech",
    branch: "Computer Engineering",
    year: 2,
    semester: 4,
  };

  let verificationToken = "";
  let currentSessionId = "";

  it("Step 1: Should register a new student and generate single-use verification token", async () => {
    const signupResult = await AuthService.signup(testStudent);

    expect(signupResult.user).toBeDefined();
    expect(signupResult.user.id.startsWith("usr_")).toBe(true);
    expect(signupResult.user.email).toBe(testStudent.email);
    expect(signupResult.user.emailVerified).toBe(false);
    expect(signupResult.verificationToken).toBeDefined();
    expect(signupResult.verificationToken.length).toBe(64); // 32 bytes hex

    verificationToken = signupResult.verificationToken;
  });

  it("Step 2: Should reject duplicate registration with same email address", async () => {
    await expect(AuthService.signup(testStudent)).rejects.toThrow(
      "An account with this email address already exists."
    );
  });

  it("Step 3: Should verify email address and invalidate the single-use token", async () => {
    const verifiedUser = await AuthService.verifyEmail(verificationToken);
    expect(verifiedUser.emailVerified).toBe(true);

    // Reusing the same token must fail
    await expect(AuthService.verifyEmail(verificationToken)).rejects.toThrow(
      "Invalid or expired verification token."
    );
  });

  it("Step 4: Should authenticate with valid credentials and establish active session", async () => {
    const loginResult = await AuthService.login({
      email: testStudent.email,
      password: testStudent.password,
      rememberMe: false,
    });

    expect(loginResult.user.email).toBe(testStudent.email);
    expect(loginResult.sessionId).toBeDefined();
    expect(loginResult.sessionId.startsWith("ses_")).toBe(true);

    currentSessionId = loginResult.sessionId;
  });

  it("Step 5: Should reject authentication with incorrect password", async () => {
    await expect(
      AuthService.login({
        email: testStudent.email,
        password: "WrongPassword999!",
        rememberMe: false,
      })
    ).rejects.toThrow("Invalid email or password.");
  });

  it("Step 6: Should handle forgot-password flow with anti-enumeration defense", async () => {
    // Non-existent email returns success without token
    const nonExistentResult = await AuthService.requestPasswordReset("unknown_phantom@campusflow.edu");
    expect(nonExistentResult.token).toBeUndefined();

    // Registered email generates reset token
    const resetResult = await AuthService.requestPasswordReset(testStudent.email);
    expect(resetResult.token).toBeDefined();
    expect(typeof resetResult.token).toBe("string");

    const resetToken = resetResult.token!;

    // Perform password reset
    const newPassword = "NewSecurePassword456!";
    await expect(AuthService.resetPassword(resetToken, newPassword)).resolves.not.toThrow();

    // Reset token cannot be reused
    await expect(AuthService.resetPassword(resetToken, "AnotherPassword789!")).rejects.toThrow(
      "Invalid or expired password reset token."
    );

    // Old password must now fail
    await expect(
      AuthService.login({
        email: testStudent.email,
        password: testStudent.password,
        rememberMe: false,
      })
    ).rejects.toThrow("Invalid email or password.");

    // New password must succeed
    const newLoginResult = await AuthService.login({
      email: testStudent.email,
      password: newPassword,
      rememberMe: false,
    });
    expect(newLoginResult.user.email).toBe(testStudent.email);
  });

  it("Step 7: Should support session invalidation and multi-device session logout", async () => {
    // Invalidate single session
    await AuthService.logout(currentSessionId);

    // Invalidate all sessions for user
    const user = await AuthService.getUserByEmail(testStudent.email);
    expect(user).toBeDefined();
    if (user) {
      await AuthService.logoutAllDevices(user.id);
    }
  });
});
