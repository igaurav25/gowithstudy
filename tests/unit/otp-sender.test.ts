import { describe, it, expect, beforeEach } from "vitest";
import {
  ConsoleOtpSender,
  OtpSenderGateway,
} from "@/services/otp/otp-sender";

describe("Unit: Multi-Channel OTP Gateway & Sender Providers", () => {
  beforeEach(() => {
    ConsoleOtpSender.lastDispatches = [];
  });

  describe("ConsoleOtpSender (Dev & Test Mode)", () => {
    it("should safely dispatch email OTP and mask the recipient address", async () => {
      const sender = new ConsoleOtpSender();
      const res = await sender.send({
        channel: "EMAIL",
        target: "rahul.sharma@gmail.com",
        code: "839102",
        purpose: "SIGNUP",
      });

      expect(res.success).toBe(true);
      expect(res.channel).toBe("EMAIL");
      expect(res.targetMasked).toBe("ra***@gmail.com");
      expect(ConsoleOtpSender.lastDispatches.length).toBe(1);
      expect(ConsoleOtpSender.lastDispatches[0].code).toBe("839102");
    });

    it("should safely dispatch mobile SMS OTP and mask the phone number", async () => {
      const sender = new ConsoleOtpSender();
      const res = await sender.send({
        channel: "SMS",
        target: "+919876543210",
        code: "194820",
        purpose: "SIGNUP",
        originDomain: "gowithstudy.vercel.app",
      });

      expect(res.success).toBe(true);
      expect(res.channel).toBe("SMS");
      expect(res.targetMasked).toBe("+9198****3210");
    });
  });

  describe("OtpSenderGateway Routing & Circuit-Breaker", () => {
    it("should route email OTP requests successfully through gateway", async () => {
      const res = await OtpSenderGateway.sendOtp({
        channel: "EMAIL",
        target: "priya.patel@dtu.ac.in",
        code: "482910",
        purpose: "SIGNUP",
      });

      expect(res.success).toBe(true);
      expect(res.channel).toBe("EMAIL");
      expect(res.targetMasked).toContain("pr***@dtu.ac.in");
    });

    it("should activate circuit breaker when phone verification is disabled via environment flag", async () => {
      const originalFlag = process.env.AUTH_REQUIRE_PHONE_OTP;
      process.env.AUTH_REQUIRE_PHONE_OTP = "false";

      try {
        const res = await OtpSenderGateway.sendOtp({
          channel: "SMS",
          target: "+919988776655",
          code: "591023",
          purpose: "SIGNUP",
        });

        expect(res.success).toBe(false);
        expect(res.circuitBreakerActive).toBe(true);
        expect(res.error).toContain("Phone OTP verification is currently disabled");
      } finally {
        process.env.AUTH_REQUIRE_PHONE_OTP = originalFlag;
      }
    });
  });
});
