"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Download,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import {
  sendAdminRecoveryOtpAction,
  completeAdminRecoveryAction,
} from "@/features/admin/setup-recovery-actions";

export function AdminRecoveryWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<"TOKEN" | "RESET" | "SUCCESS">("TOKEN");
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [recoveryToken, setRecoveryToken] = React.useState("");
  const [maskedEmail, setMaskedEmail] = React.useState("");
  const [emailOtp, setEmailOtp] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [totpSecret, setTotpSecret] = React.useState("");
  const [totpUri, setTotpUri] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [copiedKey, setCopiedKey] = React.useState(false);

  const isPasswordValid = newPassword.length >= 6 && newPassword === confirmPassword;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recoveryToken.trim()) {
      setErrorMessage("Please enter the ADMIN_RECOVERY_TOKEN from your environment variables.");
      return;
    }

    setIsPending(true);
    try {
      const res = await sendAdminRecoveryOtpAction();
      if (res.success && res.data) {
        setMaskedEmail(res.data.maskedEmail || "your registered Gmail");
        setStep("RESET");
      } else {
        setErrorMessage(res.message || null);
      }
    } catch {
      setErrorMessage("Network error requesting recovery verification.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCompleteRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (emailOtp.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code sent to your email.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage("New password must be at least 6 characters and match.");
      return;
    }

    setIsPending(true);
    try {
      const res = await completeAdminRecoveryAction({
        recoveryToken: recoveryToken.trim(),
        emailOtp: emailOtp.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.success && res.data) {
        setTotpSecret(res.data.totpSecret);
        setTotpUri(res.data.totpUri);
        setBackupCodes(res.data.backupCodes);
        setStep("SUCCESS");
      } else {
        setErrorMessage(res.message || null);
      }
    } catch {
      setErrorMessage("Failed to process administrator recovery.");
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
    const content = `GOWITHSTUDY - SUPER ADMIN RECOVERY CODES\nReset Date: ${new Date().toISOString()}\n\n${backupCodes.map((c, i) => `[${i + 1}] ${c}`).join("\n")}\n\nKeep these codes strictly private.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gowithstudy-admin-recovery-codes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-lg border-rose-900/60 bg-zinc-900/95 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-2">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold text-white tracking-tight">
          Super Admin Emergency Recovery
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Reset password, re-enroll TOTP 2FA, and invalidate all existing active admin sessions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: TOKEN & DISPATCH OTP */}
        {step === "TOKEN" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                ADMIN_RECOVERY_TOKEN
              </label>
              <input
                type="password"
                value={recoveryToken}
                onChange={(e) => setRecoveryToken(e.target.value)}
                placeholder="Enter recovery token from Vercel env"
                required
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Must match the <code>ADMIN_RECOVERY_TOKEN</code> configured in your deployment environment.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              isLoading={isPending}
              disabled={!recoveryToken.trim()}
            >
              <span>Dispatch Recovery Code to Admin Gmail</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP & RESET PASSWORD */}
        {step === "RESET" && (
          <form onSubmit={handleCompleteRecovery} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300">
              A 6-digit recovery code was sent to <strong>{maskedEmail}</strong>.
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Email Recovery Code
              </label>
              <OtpInput
                value={emailOtp}
                onChange={setEmailOtp}
                onComplete={() => {}}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  New Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-1/3 text-xs"
                onClick={() => setStep("TOKEN")}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-2/3 h-10 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                isLoading={isPending}
                disabled={emailOtp.length !== 6 || !isPasswordValid}
              >
                <span>Reset Admin Access</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS & RE-ENROLLED TOTP */}
        {step === "SUCCESS" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Recovery Succeeded! All active admin sessions revoked.
              </p>
              <p className="text-[11px] text-emerald-400/80">
                A security alert has been dispatched to your email address.
              </p>
            </div>

            {/* Fresh TOTP Key */}
            <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2">
              <p className="text-xs font-semibold text-zinc-300">New Authenticator Secret Key (Base32):</p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-xs text-indigo-400">
                <span className="truncate">{totpSecret}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(totpSecret)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedKey && <p className="text-[10px] text-emerald-400">Copied to clipboard!</p>}
            </div>

            {/* Fresh Backup Codes */}
            <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-300">New One-Time Backup Codes:</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(backupCodes.join("\n"))}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                {backupCodes.map((c, i) => (
                  <div key={i} className="p-1 rounded bg-zinc-800/50 text-center font-bold">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <strong>Security Action:</strong> Remove or rotate <code>ADMIN_RECOVERY_TOKEN</code> in your Vercel Environment Variables now.
            </div>

            <Button
              type="button"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              onClick={() => router.push("/login?mode=admin")}
            >
              <span>Go to Administrator Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
