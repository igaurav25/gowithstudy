"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  loginWithIdentifierAction,
  verifyStepUpLoginAction,
} from "@/features/auth/high-assurance-actions";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Lock,
  X,
} from "lucide-react";

const subscribeNoop = () => () => {};
function getStoredIdentifierSnapshot(): string {
  try {
    const stored =
      localStorage.getItem("gowithstudy_last_identifier") ||
      localStorage.getItem("gowithstudy_last_email") ||
      localStorage.getItem("campusflow_last_email");
    return stored || "";
  } catch {
    return "";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const storedId = React.useSyncExternalStore(
    subscribeNoop,
    getStoredIdentifierSnapshot,
    () => ""
  );

  const [identifierInput, setIdentifierInput] = React.useState<string | null>(null);
  const identifier = identifierInput ?? storedId;
  const setIdentifier = (val: string) => setIdentifierInput(val);
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);

  // Step-Up OTP Modal State
  const [stepUpOpen, setStepUpOpen] = React.useState(false);
  const [stepUpChallengeId, setStepUpChallengeId] = React.useState("");
  const [stepUpMaskedTarget, setStepUpMaskedTarget] = React.useState("");
  const [stepUpChannel, setStepUpChannel] = React.useState("");
  const [stepUpOtp, setStepUpOtp] = React.useState("");
  const [stepUpRememberDevice, setStepUpRememberDevice] = React.useState(true);
  const [stepUpError, setStepUpError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage("Please enter your identifier and password.");
      return;
    }

    setIsPending(true);
    try {
      const res = await loginWithIdentifierAction({
        identifier: cleanIdentifier,
        password,
        rememberMe,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Invalid credentials. Please verify your ID and password.");
        return;
      }

      // Check if step-up challenge is required (new or unrecognized device)
      if (res.data?.requiresStepUp && res.data.challengeId) {
        setStepUpChallengeId(res.data.challengeId);
        setStepUpMaskedTarget(res.data.maskedTarget || "your verified contact");
        setStepUpChannel(res.data.channel || "EMAIL");
        setStepUpOtp("");
        setStepUpError(null);
        setStepUpOpen(true);
        return;
      }

      // Direct login on trusted device
      try {
        localStorage.setItem("gowithstudy_last_identifier", cleanIdentifier);
        localStorage.setItem("gowithstudy_logged_in", "true");
      } catch {
        // ignore storage error
      }

      router.replace(res.data?.redirectUrl || "/dashboard");
    } catch {
      setErrorMessage("Authentication failed due to a network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyStepUp = async (codeToVerify?: string) => {
    const code = (codeToVerify || stepUpOtp).trim();
    if (code.length !== 6) {
      setStepUpError("Please enter the complete 6-digit verification code.");
      return;
    }

    setStepUpError(null);
    setIsPending(true);

    try {
      const res = await verifyStepUpLoginAction({
        challengeId: stepUpChallengeId,
        otpCode: code,
        identifier: identifier.trim(),
        rememberDevice: stepUpRememberDevice,
      });

      if (!res.success) {
        setStepUpError(res.message || "Invalid or expired verification code.");
        return;
      }

      try {
        localStorage.setItem("gowithstudy_last_identifier", identifier.trim());
        localStorage.setItem("gowithstudy_logged_in", "true");
      } catch {
        // ignore
      }

      setStepUpOpen(false);
      router.replace(res.data?.redirectUrl || "/dashboard");
    } catch {
      setStepUpError("Verification failed. Please check your network connection.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              GoWithStudy
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Access your courses, AI notes & placement dashboard
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Secure Student Login</CardTitle>
              <Badge variant="purple">Multi-Identifier</Badge>
            </div>
            <CardDescription>
              Sign in with your registered Username, Email address, or Mobile number.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Username, Email, or Mobile
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rahul_sharma, student@dtu.ac.in, or +919876543210"
                  required
                  autoFocus
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Password</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-zinc-600 dark:text-zinc-400 select-none cursor-pointer"
                >
                  Remember this device for 30 days
                </label>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-sm font-semibold"
                isLoading={isPending}
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Optional Google Sign-In */}
            <div className="pt-2">
              <GoogleSignInButton label="Continue with Google" />
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              New to GoWithStudy?{" "}
              <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* STEP-UP 2FA MODAL (NEW / UNTRUSTED DEVICE DETECTED) */}
      {/* ======================================================== */}
      {stepUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => {
                if (!isPending) setStepUpOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  New Device Detected
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Step-Up Security Verification
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Because this device is not yet recognized, enter the 6-digit one-time code sent to{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{stepUpMaskedTarget}</strong> via{" "}
              {stepUpChannel === "WHATSAPP" ? "WhatsApp" : stepUpChannel === "SMS" ? "SMS" : "Email"}.
            </p>

            {stepUpError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400">
                {stepUpError}
              </div>
            )}

            <div className="py-3">
              <OtpInput
                value={stepUpOtp}
                onChange={(val) => setStepUpOtp(val)}
                onComplete={(val) => handleVerifyStepUp(val)}
                hasError={Boolean(stepUpError)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center gap-2 pt-2 mb-4">
              <input
                type="checkbox"
                id="stepUpRemember"
                checked={stepUpRememberDevice}
                onChange={(e) => setStepUpRememberDevice(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="stepUpRemember"
                className="text-xs text-zinc-600 dark:text-zinc-400 select-none cursor-pointer"
              >
                Trust this device for 30 days (No OTP next time)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => setStepUpOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                isLoading={isPending}
                disabled={stepUpOtp.length !== 6}
                onClick={() => handleVerifyStepUp()}
              >
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
