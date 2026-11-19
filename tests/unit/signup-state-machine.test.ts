import { describe, it, expect, beforeEach } from "vitest";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";
import { SignupStateMachine } from "@/services/auth/signup-state-machine";
import { ConsoleOtpSender } from "@/services/otp/otp-sender";

describe("Unit: Server-Side Registration State Machine & OTP Challenge Store", () => {
  beforeEach(() => {
    ConsoleOtpSender.lastDispatches = [];
  });

  describe("OtpChallengeStore Operations & Attempt Locking", () => {
    it("should issue an OTP challenge, store HMAC, and enforce maximum 5 attempts", async () => {
      const email = "rahul.state.test@gmail.com";
      const created = await OtpChallengeStore.createChallenge({
        purpose: "SIGNUP_EMAIL",
        channel: "EMAIL",
        targetCanonical: email,
        clientIp: "127.0.0.1",
      });

      expect(created.success).toBe(true);
      expect(created.challengeId).toBeDefined();

      const lastDispatch = ConsoleOtpSender.lastDispatches.find(
        (d) => d.target === email
      );
      expect(lastDispatch).toBeDefined();
      const code = lastDispatch!.code;

      // 1. Submit wrong code 4 times
      for (let i = 1; i <= 4; i++) {
        const wrongRes = OtpChallengeStore.verifyChallenge({
          challengeId: created.challengeId!,
          submittedCode: "000000",
        });
        expect(wrongRes.success).toBe(false);
        expect(wrongRes.remainingAttempts).toBe(5 - i);
      }

      // 2. 5th wrong attempt locks the challenge
      const lockRes = OtpChallengeStore.verifyChallenge({
        challengeId: created.challengeId!,
        submittedCode: "000000",
      });
      expect(lockRes.success).toBe(false);
      expect(lockRes.remainingAttempts).toBe(0);
      expect(lockRes.error).toContain("locked");

      // 3. Even correct code is rejected once challenge is locked
      const lateCorrect = OtpChallengeStore.verifyChallenge({
        challengeId: created.challengeId!,
        submittedCode: code,
      });
      expect(lateCorrect.success).toBe(false);
      expect(lateCorrect.error).toContain("locked");
    });

    it("should reject replayed OTP codes once consumed", async () => {
      const email = "replay.test@dtu.ac.in";
      const created = await OtpChallengeStore.createChallenge({
        purpose: "SIGNUP_EMAIL",
        channel: "EMAIL",
        targetCanonical: email,
        clientIp: "127.0.0.1",
      });

      const lastDispatch = ConsoleOtpSender.lastDispatches.find(
        (d) => d.target === email
      );
      const code = lastDispatch!.code;

      // First verification succeeds
      const firstVerify = OtpChallengeStore.verifyChallenge({
        challengeId: created.challengeId!,
        submittedCode: code,
      });
      expect(firstVerify.success).toBe(true);

      // Replay attempt fails immediately
      const replayVerify = OtpChallengeStore.verifyChallenge({
        challengeId: created.challengeId!,
        submittedCode: code,
      });
      expect(replayVerify.success).toBe(false);
      expect(replayVerify.error).toContain("already been used");
    });
  });

  describe("SignupStateMachine Transitions", () => {
    it("should strictly progress through PENDING_EMAIL -> PENDING_PHONE -> PENDING_PROFILE", async () => {
      const email = "kavya.machine@gmail.com";
      const phone = "+919876543210";

      // 1. Start registration
      const initialToken = await SignupStateMachine.startRegistration(
        email,
        "dummy_ip_hash"
      );
      const initialPayload = await SignupStateMachine.verifyToken(initialToken);
      expect(initialPayload?.state).toBe("PENDING_EMAIL");
      expect(initialPayload?.emailCanonical).toBe(email);

      // Cannot complete yet
      expect(SignupStateMachine.assertCanComplete(initialPayload!).canComplete).toBe(
        false
      );

      // 2. Create and verify Email OTP
      const emailClg = await OtpChallengeStore.createChallenge({
        purpose: "SIGNUP_EMAIL",
        channel: "EMAIL",
        targetCanonical: email,
        clientIp: "127.0.0.1",
      });
      const emailCode = ConsoleOtpSender.lastDispatches.find(
        (d) => d.target === email
      )!.code;

      const emailStep = await SignupStateMachine.verifyEmailAndAdvance(
        initialToken,
        emailClg.challengeId!,
        emailCode
      );
      expect(emailStep.success).toBe(true);
      expect(emailStep.updatedToken).toBeDefined();

      const phoneStepPayload = await SignupStateMachine.verifyToken(
        emailStep.updatedToken!
      );
      expect(phoneStepPayload?.state).toBe("PENDING_PHONE");
      expect(phoneStepPayload?.emailVerifiedAt).toBeDefined();

      // 3. Create and verify Phone OTP
      const phoneClg = await OtpChallengeStore.createChallenge({
        purpose: "SIGNUP_PHONE",
        channel: "WHATSAPP",
        targetCanonical: phone,
        clientIp: "127.0.0.1",
      });
      const phoneCode = ConsoleOtpSender.lastDispatches.find(
        (d) => d.target === phone
      )!.code;

      const phoneStep = await SignupStateMachine.verifyPhoneAndAdvance(
        emailStep.updatedToken!,
        phone,
        phoneClg.challengeId!,
        phoneCode
      );
      expect(phoneStep.success).toBe(true);

      const profilePayload = await SignupStateMachine.verifyToken(
        phoneStep.updatedToken!
      );
      expect(profilePayload?.state).toBe("PENDING_PROFILE");
      expect(profilePayload?.emailVerifiedAt).toBeDefined();
      expect(profilePayload?.phoneVerifiedAt).toBeDefined();

      // Now account creation is authorized
      const completeCheck = SignupStateMachine.assertCanComplete(profilePayload!);
      expect(completeCheck.canComplete).toBe(true);
    });

    it("should prevent skipping the email step directly to phone step", async () => {
      const email = "attacker.skip@gmail.com";
      const initialToken = await SignupStateMachine.startRegistration(
        email,
        "dummy_ip_hash"
      );

      // Attempting to verify phone before email
      const bypassAttempt = await SignupStateMachine.verifyPhoneAndAdvance(
        initialToken,
        "+919988776655",
        "invalid_clg",
        "123456"
      );
      expect(bypassAttempt.success).toBe(false);
      expect(bypassAttempt.error).toContain("verify your email first");
    });
  });
});
