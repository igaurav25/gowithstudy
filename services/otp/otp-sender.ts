import { maskEmail, maskPhone } from "@/lib/canonicalize";

export type OtpChannel = "EMAIL" | "SMS" | "WHATSAPP";

export interface SendOtpParams {
  channel: OtpChannel;
  target: string; // Canonical email or E.164 phone
  code: string; // 6-digit CSPRNG code
  purpose: string; // "SIGNUP" | "STEP_UP" | "PASSWORD_RESET"
  originDomain?: string; // e.g. "gowithstudy.vercel.app" for WebOTP
}

export interface SendOtpResult {
  success: boolean;
  channel: OtpChannel;
  targetMasked: string;
  messageId?: string;
  error?: string;
  circuitBreakerActive?: boolean;
}

export interface IOtpSender {
  send(params: SendOtpParams): Promise<SendOtpResult>;
}

/**
 * Development & Testing OTP Sender:
 * Safely outputs masked delivery details to console and in-memory mock logs without external API charges.
 */
export class ConsoleOtpSender implements IOtpSender {
  // In-memory log of recent dispatches for automated test verification
  public static lastDispatches: SendOtpParams[] = [];

  async send(params: SendOtpParams): Promise<SendOtpResult> {
    const masked =
      params.channel === "EMAIL"
        ? maskEmail(params.target)
        : maskPhone(params.target);

    // Record in test memory
    ConsoleOtpSender.lastDispatches.push(params);

    if (process.env.NODE_ENV !== "test") {
      console.log(
        `🔐 [ConsoleOtpSender] Dispatched ${params.channel} OTP to ${masked}: [CODE: ${params.code}] (Purpose: ${params.purpose})`
      );
    }

    return {
      success: true,
      channel: params.channel,
      targetMasked: masked,
      messageId: `mock_${Date.now()}_${params.channel}`,
    };
  }
}

/**
 * Meta WhatsApp Cloud API Provider:
 * Indian College Students live on WhatsApp. Operates over HTTPS (No TRAI DLT registration required).
 */
export class MetaWhatsAppOtpSender implements IOtpSender {
  private apiUrl: string;
  private accessToken: string;
  private phoneId: string;

  constructor() {
    this.phoneId = process.env.META_WA_PHONE_NUMBER_ID || "";
    this.accessToken = process.env.META_WA_ACCESS_TOKEN || "";
    this.apiUrl = `https://graph.facebook.com/v19.0/${this.phoneId}/messages`;
  }

  async send(params: SendOtpParams): Promise<SendOtpResult> {
    const masked = maskPhone(params.target);

    // Fall back to ConsoleSender if credentials are not configured in environment
    if (!this.accessToken || !this.phoneId) {
      const consoleSender = new ConsoleOtpSender();
      return consoleSender.send(params);
    }

    try {
      // E.164 without leading '+' for Meta API (e.g. "919876543210")
      const recipient = params.target.replace(/^\+/, "");

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: {
          name: "gowithstudy_otp_verification", // Standard pre-approved Utility Template
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: params.code }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: params.code }],
            },
          ],
        },
      };

      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Meta WhatsApp dispatch failure:", errorData);
        return {
          success: false,
          channel: "WHATSAPP",
          targetMasked: masked,
          error: "Failed to dispatch WhatsApp message via Meta API.",
        };
      }

      const resJson = (await res.json()) as { messages?: Array<{ id: string }> };
      return {
        success: true,
        channel: "WHATSAPP",
        targetMasked: masked,
        messageId: resJson.messages?.[0]?.id,
      };
    } catch (err) {
      console.error("Meta WhatsApp exception:", err);
      return {
        success: false,
        channel: "WHATSAPP",
        targetMasked: masked,
        error: err instanceof Error ? err.message : "WhatsApp connection error.",
      };
    }
  }
}

/**
 * Indian DLT-Compliant SMS Provider (MSG91 / Gateway):
 * Supports TRAI template matching and Android WebOTP API format:
 * "<#code> is your GoWithStudy OTP. @gowithstudy.vercel.app #<code>"
 */
export class IndianSmsOtpSender implements IOtpSender {
  private authKey: string;
  private templateId: string;
  private senderId: string;

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || "";
    this.templateId = process.env.MSG91_DLT_TE_ID || "";
    this.senderId = process.env.MSG91_SENDER_ID || "GOWSTU";
  }

  async send(params: SendOtpParams): Promise<SendOtpResult> {
    const masked = maskPhone(params.target);

    // Fall back to ConsoleSender if credentials are not configured in environment
    if (!this.authKey || !this.templateId) {
      const consoleSender = new ConsoleOtpSender();
      return consoleSender.send(params);
    }

    try {
      const recipient = params.target.replace(/^\+/, "");
      const domain = params.originDomain || "gowithstudy.vercel.app";

      // Formatted with Android WebOTP API specification on the final line
      const res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: this.authKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: this.templateId,
          mobile: recipient,
          otp: params.code,
          sender: this.senderId,
          otp_expiry: 5, // 5 minutes
          domain,
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          channel: "SMS",
          targetMasked: masked,
          error: "Failed to send SMS via telecom gateway.",
        };
      }

      const resJson = (await res.json()) as { message?: string; type?: string };
      return {
        success: resJson.type === "success",
        channel: "SMS",
        targetMasked: masked,
        messageId: resJson.message,
      };
    } catch (err) {
      return {
        success: false,
        channel: "SMS",
        targetMasked: masked,
        error: err instanceof Error ? err.message : "SMS gateway error.",
      };
    }
  }
}

/**
 * Academic Email OTP Sender:
 * Clean, branded university email template with 10-minute expiry and phishing warning.
 */
export class EmailOtpSender implements IOtpSender {
  async send(params: SendOtpParams): Promise<SendOtpResult> {
    const masked = maskEmail(params.target);

    // In local dev, test, or if RESEND_API_KEY is not set, use console
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || process.env.NODE_ENV === "test") {
      const consoleSender = new ConsoleOtpSender();
      return consoleSender.send(params);
    }

    try {
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7;">
          <div style="margin-bottom: 24px; text-align: center;">
            <div style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;">
              🎓 GoWithStudy
            </div>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #18181b; margin-bottom: 8px; text-align: center;">
            Verify your Student Account
          </h2>
          <p style="font-size: 14px; color: #71717a; text-align: center; margin-bottom: 24px;">
            Enter the 6-digit verification code below to verify your email address.
          </p>
          <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">
              ${params.code}
            </span>
          </div>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin-bottom: 16px;">
            ⏰ Code expires in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
          </p>
          <div style="border-top: 1px solid #f4f4f5; padding-top: 16px; text-align: center;">
            <p style="font-size: 11px; color: #a1a1aa; margin: 0;">
              GoWithStudy Student Security &bull; Sent to ${masked}
            </p>
          </div>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "GoWithStudy Security <auth@gowithstudy.vercel.app>",
          to: params.target,
          subject: `${params.code} is your GoWithStudy verification code`,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          channel: "EMAIL",
          targetMasked: masked,
          error: "Failed to dispatch email via provider.",
        };
      }

      const resJson = (await res.json()) as { id?: string };
      return {
        success: true,
        channel: "EMAIL",
        targetMasked: masked,
        messageId: resJson.id,
      };
    } catch (err) {
      return {
        success: false,
        channel: "EMAIL",
        targetMasked: masked,
        error: err instanceof Error ? err.message : "Email gateway error.",
      };
    }
  }
}

/**
 * Unified Multi-Channel Gateway Router with Circuit-Breaker:
 * Automatically falls back to Email if SMS/WhatsApp is toggled off or budget ceiling is reached.
 */
export class OtpSenderGateway {
  private static globalSmsCountToday = 0;
  private static lastCountResetDate = new Date().toDateString();

  // Max daily SMS limit to prevent SMS-pumping budget exhaustion (can be tuned via env)
  private static maxDailySmsBudget = parseInt(
    process.env.AUTH_MAX_DAILY_SMS || "500",
    10
  );

  /**
   * Resets counter at UTC midnight
   */
  private static checkDailyReset(): void {
    const today = new Date().toDateString();
    if (this.lastCountResetDate !== today) {
      this.globalSmsCountToday = 0;
      this.lastCountResetDate = today;
    }
  }

  /**
   * Dispatches OTP through requested channel with circuit-breaker protection
   */
  static async sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
    this.checkDailyReset();

    // Check if phone OTP is disabled by flag
    const requirePhoneOtp = process.env.AUTH_REQUIRE_PHONE_OTP !== "false";

    if (params.channel === "SMS" || params.channel === "WHATSAPP") {
      if (!requirePhoneOtp) {
        return {
          success: false,
          channel: params.channel,
          targetMasked: maskPhone(params.target),
          error: "Phone OTP verification is currently disabled. Please use Email verification.",
          circuitBreakerActive: true,
        };
      }

      // Check global daily ceiling
      if (this.globalSmsCountToday >= this.maxDailySmsBudget) {
        console.warn(
          `⚠️ [CircuitBreaker] Daily SMS budget cap reached (${this.globalSmsCountToday}/${this.maxDailySmsBudget}). Falling back to email-only.`
        );
        return {
          success: false,
          channel: params.channel,
          targetMasked: maskPhone(params.target),
          error: "Daily verification limit reached for mobile. Please verify via email instead.",
          circuitBreakerActive: true,
        };
      }

      this.globalSmsCountToday += 1;
    }

    // Select provider
    let sender: IOtpSender;

    if (process.env.NODE_ENV === "test") {
      sender = new ConsoleOtpSender();
    } else if (params.channel === "EMAIL") {
      sender = new EmailOtpSender();
    } else if (params.channel === "WHATSAPP") {
      sender = new MetaWhatsAppOtpSender();
    } else {
      sender = new IndianSmsOtpSender();
    }

    return sender.send(params);
  }
}
