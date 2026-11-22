"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Download,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import {
  sendAdminSetupOtpAction,
  completeAdminSetupAction,
  verifyInitialTotpCodeAction,
} from "@/features/admin/setup-recovery-actions";

export function AdminSetupWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<"DETAILS" | "OTP" | "TOTP_ENROLL" | "SUCCESS">("DETAILS");
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [otpMessage, setOtpMessage] = React.useState<string | null>(null);

  // Form inputs
  const [setupToken, setSetupToken] = React.useState("");
  const [adminId, setAdminId] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("+91");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [emailOtp, setEmailOtp] = React.useState("");

  // Result data
  const [totpSecret, setTotpSecret] = React.useState("");
  const [totpUri, setTotpUri] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [testTotpCode, setTestTotpCode] = React.useState("");
  const [totpVerified, setTotpVerified] = React.useState(false);
  const [savedBackupCodesChecked, setSavedBackupCodesChecked] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState(false);

  // Password strength
  const isLengthValid = password.length >= 6;
  const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasDigitOrSymbol = /[0-9!@#$%^&*]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!setupToken.trim()) {
      setErrorMessage("Please enter the ADMIN_SETUP_TOKEN from your environment variables.");
      return;
    }
    if (!adminId.trim() || adminId.length < 3) {
      setErrorMessage("Admin ID must be at least 3 characters.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid Gmail address.");
      return;
    }
    if (!isLengthValid || !isMatch) {
      setErrorMessage("Password must be at least 6 characters and match the confirmation.");
      return;
    }

    setIsPending(true);
    try {
      const res = await sendAdminSetupOtpAction(email.trim());
      if (res.success) {
        if (res.data?.previewCode) {
          setEmailOtp(res.data.previewCode);
        }
        if (res.message) {
          setOtpMessage(res.message);
        }
        setStep("OTP");
      } else {
        setErrorMessage(res.message || null);
      }
    } catch {
      setErrorMessage("Network error sending email verification code.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCompleteSetup = async () => {
    setErrorMessage(null);
    if (emailOtp.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsPending(true);
    try {
      const res = await completeAdminSetupAction({
        setupToken: setupToken.trim(),
        adminId: adminId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        emailOtp: emailOtp.trim(),
      });

      if (res.success && res.data) {
        setTotpSecret(res.data.totpSecret);
        setTotpUri(res.data.totpUri);
        setBackupCodes(res.data.backupCodes);
        setStep("TOTP_ENROLL");
      } else {
        setErrorMessage(res.message || null);
      }
    } catch {
      setErrorMessage("Error finalizing admin initialization.");
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyTotp = async () => {
    setErrorMessage(null);
    if (testTotpCode.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit code shown in your authenticator app.");
      return;
    }

    setIsPending(true);
    try {
      const res = await verifyInitialTotpCodeAction(totpSecret, testTotpCode.trim());
      if (res.success) {
        setTotpVerified(true);
      } else {
        setErrorMessage(res.message || null);
      }
    } catch {
      setErrorMessage("Failed to verify authenticator code.");
    } finally {
      setIsPending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const downloadBackupCodes = () => {
    const content = `GOWITHSTUDY - SUPER ADMIN BACKUP RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nEmail: ${email}\n\n${backupCodes.map((c, i) => `[${i + 1}] ${c}`).join("\n")}\n\nKeep these codes strictly private. Each code is single-use.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gowithstudy-admin-backup-codes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/90 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold text-white tracking-tight">
          One-Time Super Admin Provisioning
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Initialize the central administrator account with Argon2id password hashing and RFC 6238 TOTP 2FA.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS & DETAILS */}
        {step === "DETAILS" && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                ADMIN_SETUP_TOKEN
              </label>
              <input
                type="password"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                placeholder="Enter secret setup token from env"
                required
                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Admin ID (Username)
                </label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. superadmin"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Lead Administrator"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Admin Gmail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mobile Number (E.164)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Strength meter */}
            <div className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isLengthValid ? "bg-emerald-500" : "bg-zinc-600"}`} />
                <span>At least 6 characters long</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${hasMixed && hasDigitOrSymbol ? "bg-emerald-500" : "bg-zinc-600"}`} />
                <span>Mixed uppercase, lowercase & numbers/symbols</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isMatch ? "bg-emerald-500" : "bg-zinc-600"}`} />
                <span>Passwords match</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs mt-2"
              isLoading={isPending}
              disabled={!isLengthValid || !isMatch}
            >
              <span>Verify Gmail & Proceed</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION */}
        {step === "OTP" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              {otpMessage || (
                <>A 6-digit verification code was dispatched to <strong>{email}</strong>. Enter it below to prove mailbox ownership.</>
              )}
            </div>

            <div className="py-2">
              <OtpInput
                value={emailOtp}
                onChange={setEmailOtp}
                onComplete={() => {}}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-1/3 text-xs"
                onClick={() => setStep("DETAILS")}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                className="w-2/3 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                isLoading={isPending}
                disabled={emailOtp.length !== 6}
                onClick={handleCompleteSetup}
              >
                <span>Create Super Admin</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: TOTP ENROLLMENT & BACKUP CODES */}
        {step === "TOTP_ENROLL" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Super Admin account created in database! Enroll your authenticator to finalize.</span>
            </div>

            {/* TOTP Key */}
            <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2">
              <p className="text-xs font-semibold text-zinc-300">1. Authenticator Secret Key (Base32):</p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-xs text-indigo-400">
                <span className="truncate">{totpSecret}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(totpSecret)}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Copy secret"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedKey && <p className="text-[10px] text-emerald-400">Copied to clipboard!</p>}
              <p className="text-[11px] text-zinc-400">
                Add this key to Google Authenticator, Microsoft Authenticator, or 1Password.
              </p>
            </div>

            {/* Verify 1st Code */}
            <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2">
              <p className="text-xs font-semibold text-zinc-300">2. Enter 6-digit code from your app:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={testTotpCode}
                  onChange={(e) => setTestTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-32 h-10 px-3 text-center tracking-widest font-mono text-base font-bold rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-indigo-500"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-10 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  isLoading={isPending}
                  disabled={testTotpCode.length !== 6 || totpVerified}
                  onClick={handleVerifyTotp}
                >
                  {totpVerified ? "Verified ✓" : "Verify Code"}
                </Button>
              </div>
            </div>

            {/* 10 Backup Codes */}
            <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-300">3. One-Time Backup Recovery Codes:</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(backupCodes.join("\n"))}
                    className="p-1 text-zinc-400 hover:text-white"
                    title="Copy all backup codes"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className="p-1 text-zinc-400 hover:text-white"
                    title="Download codes as text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="p-1 rounded bg-zinc-800/50 text-center font-bold">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="savedBackup"
                  checked={savedBackupCodesChecked}
                  onChange={(e) => setSavedBackupCodesChecked(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 mt-0.5 cursor-pointer"
                />
                <label htmlFor="savedBackup" className="text-[11px] text-zinc-400 select-none cursor-pointer leading-tight">
                  I have safely saved these 10 one-time recovery codes in a secure password manager.
                </label>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Important Deployment Security Rule:
              </p>
              <p>
                Now delete <code>ADMIN_SETUP_TOKEN</code> from your Vercel Environment Variables and redeploy so this setup endpoint remains permanently disabled.
              </p>
            </div>

            <Button
              type="button"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              disabled={!totpVerified || !savedBackupCodesChecked}
              onClick={() => router.push("/login?mode=admin")}
            >
              <span>Setup Complete — Go to Administrator Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
