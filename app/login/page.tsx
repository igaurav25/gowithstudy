"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loginWithIdentifierAction,
  verifyStepUpLoginAction,
} from "@/features/auth/high-assurance-actions";
import {
  adminLoginStep1Action,
  adminLoginStep2TotpAction,
  adminSendEmailOtpFallbackAction,
} from "@/features/admin/auth-actions";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  X,
  KeyRound,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin";

  const [isAdminMode, setIsAdminMode] = React.useState(initialMode);
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Student Form Inputs
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

  // Student Step-Up OTP Modal State
  const [stepUpOpen, setStepUpOpen] = React.useState(false);
  const [stepUpChallengeId, setStepUpChallengeId] = React.useState("");
  const [stepUpMaskedTarget, setStepUpMaskedTarget] = React.useState("");
  const [stepUpChannel, setStepUpChannel] = React.useState("");
  const [stepUpOtp, setStepUpOtp] = React.useState("");
  const [stepUpRememberDevice, setStepUpRememberDevice] = React.useState(true);
  const [stepUpError, setStepUpError] = React.useState<string | null>(null);

  // Admin Mode State
  const [adminStep, setAdminStep] = React.useState<"CREDENTIALS" | "TOTP">("CREDENTIALS");
  const [adminId, setAdminId] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [adminPendingToken, setAdminPendingToken] = React.useState("");
  const [adminMaskedEmail, setAdminMaskedEmail] = React.useState("");
  const [adminTotpCode, setAdminTotpCode] = React.useState("");
  const [adminUseBackupCode, setAdminUseBackupCode] = React.useState(false);
  const [adminBackupCode, setAdminBackupCode] = React.useState("");
  const [adminEmailFallbackAvailable, setAdminEmailFallbackAvailable] = React.useState(false);
  const [adminEmailOtp, setAdminEmailOtp] = React.useState("");
  const [adminUsingEmailOtp, setAdminUsingEmailOtp] = React.useState(false);

  // Reset errors when toggling modes
  const toggleAdminMode = (toAdmin: boolean) => {
    setIsAdminMode(toAdmin);
    setErrorMessage(null);
    setAdminStep("CREDENTIALS");
    setAdminPendingToken("");
    setAdminTotpCode("");
    setAdminBackupCode("");
    setAdminUseBackupCode(false);
  };

  // --- Student Form Handler ---
  const handleStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (res.data?.requiresStepUp && res.data.challengeId) {
        setStepUpChallengeId(res.data.challengeId);
        setStepUpMaskedTarget(res.data.maskedTarget || "your verified contact");
        setStepUpChannel(res.data.channel || "EMAIL");
        setStepUpOtp("");
        setStepUpError(null);
        setStepUpOpen(true);
        return;
      }

      try {
        localStorage.setItem("gowithstudy_last_identifier", cleanIdentifier);
        localStorage.setItem("gowithstudy_logged_in", "true");
      } catch {}

      router.push(res.data?.redirectUrl || "/dashboard");
    } catch {
      setErrorMessage("Network error during sign in. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyStepUp = async (otpOverride?: string) => {
    const code = (otpOverride || stepUpOtp).trim();
    if (code.length !== 6) return;

    setIsPending(true);
    setStepUpError(null);

    try {
      const res = await verifyStepUpLoginAction({
        challengeId: stepUpChallengeId,
        otpCode: code,
        identifier: identifier.trim(),
        rememberDevice: stepUpRememberDevice,
      });

      if (!res.success) {
        setStepUpError(res.message || "Invalid verification code.");
        return;
      }

      setStepUpOpen(false);
      try {
        localStorage.setItem("gowithstudy_last_identifier", identifier.trim());
        localStorage.setItem("gowithstudy_logged_in", "true");
      } catch {}

      router.push(res.data?.redirectUrl || "/dashboard");
    } catch {
      setStepUpError("Verification failed due to a network error.");
    } finally {
      setIsPending(false);
    }
  };

  // --- Admin Form Handlers ---
  const handleAdminStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminId.trim() || !adminPassword) {
      setErrorMessage("Please provide administrator ID and password.");
      return;
    }

    setIsPending(true);
    try {
      const res = await adminLoginStep1Action({
        identifier: adminId.trim(),
        password: adminPassword,
      });

      if (res.success && res.data?.pendingToken) {
        setAdminPendingToken(res.data.pendingToken);
        setAdminMaskedEmail(res.data.maskedEmail || "");
        setAdminEmailFallbackAvailable(Boolean(res.data.emailOtpFallbackAvailable));
        setAdminStep("TOTP");
      } else {
        setErrorMessage(res.message || "ID or password is incorrect.");
      }
    } catch {
      setErrorMessage("Network error during administrator authentication.");
    } finally {
      setIsPending(false);
    }
  };

  const handleAdminStep2 = async (overrideCode?: string) => {
    setErrorMessage(null);

    setIsPending(true);
    try {
      const res = await adminLoginStep2TotpAction({
        pendingToken: adminPendingToken,
        totpCode: !adminUseBackupCode && !adminUsingEmailOtp ? (overrideCode || adminTotpCode) : undefined,
        backupCode: adminUseBackupCode ? adminBackupCode.trim() : undefined,
        emailOtp: adminUsingEmailOtp ? adminEmailOtp.trim() : undefined,
      });

      if (res.success && res.data?.redirectUrl) {
        router.push(res.data.redirectUrl);
      } else {
        setErrorMessage(res.message || "Invalid authentication code.");
      }
    } catch {
      setErrorMessage("Network error verifying admin code.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSendAdminEmailOtp = async () => {
    setErrorMessage(null);
    setIsPending(true);
    try {
      const res = await adminSendEmailOtpFallbackAction({
        pendingToken: adminPendingToken,
      });
      if (res.success) {
        setAdminUsingEmailOtp(true);
      } else {
        setErrorMessage(res.message || null);
      }
    } catch {
      setErrorMessage("Failed to send email verification code.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      {/* Top-Right Discreet Admin Link */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={() => toggleAdminMode(!isAdminMode)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isAdminMode
              ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800"
          }`}
          title="Toggle Administrator Access"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{isAdminMode ? "Student Login" : "Admin"}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform ${
                isAdminMode
                  ? "bg-gradient-to-tr from-zinc-800 via-indigo-900 to-indigo-600 border border-indigo-500/30"
                  : "bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 shadow-indigo-500/20 group-hover:scale-105"
              }`}
            >
              {isAdminMode ? <ShieldCheck className="w-5 h-5 text-indigo-300" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              GoWithStudy
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isAdminMode ? "Administrator Sign In" : "Welcome back"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isAdminMode
              ? "Super Admin & Campus Governance Console Access"
              : "Access your courses, AI notes & placement dashboard"}
          </p>
        </div>

        {/* ======================================================== */}
        {/* A. ADMIN LOGIN CARD */}
        {/* ======================================================== */}
        {isAdminMode ? (
          <Card className="border-indigo-500/30 dark:border-indigo-600/40 bg-white dark:bg-zinc-900/95 shadow-2xl shadow-indigo-500/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 text-indigo-400">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span>Admin Mode</span>
                </CardTitle>
                <Badge variant="purple" className="text-[10px] bg-indigo-950 text-indigo-300 border-indigo-800">
                  2FA Mandatory
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {adminStep === "CREDENTIALS"
                  ? "Sign in with your Admin ID, Gmail, or Mobile number."
                  : "Two-factor authentication required for administrative clearance."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ADMIN STEP 1: CREDENTIALS */}
              {adminStep === "CREDENTIALS" ? (
                <form onSubmit={handleAdminStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Admin ID, Gmail or Mobile
                    </label>
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. superadmin, admin@gmail.com, or +91..."
                      required
                      autoFocus
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs mt-2"
                    isLoading={isPending}
                  >
                    <span>Verify Credentials</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              ) : (
                /* ADMIN STEP 2: TOTP / BACKUP CODE / EMAIL OTP */
                <div className="space-y-4">
                  {!adminUseBackupCode && !adminUsingEmailOtp && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300 text-center">
                        Enter 6-digit Authenticator (TOTP) Code:
                      </label>
                      <div className="py-2">
                        <OtpInput
                          value={adminTotpCode}
                          onChange={setAdminTotpCode}
                          onComplete={(val) => handleAdminStep2(val)}
                          disabled={isPending}
                        />
                      </div>
                    </div>
                  )}

                  {adminUseBackupCode && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Enter One-Time Backup Code:
                      </label>
                      <input
                        type="text"
                        value={adminBackupCode}
                        onChange={(e) => setAdminBackupCode(e.target.value.toUpperCase())}
                        placeholder="e.g. 8492-4912"
                        className="w-full h-11 px-3.5 text-center font-mono font-bold tracking-wider rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {adminUsingEmailOtp && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300 text-center">
                        Enter code sent to {adminMaskedEmail}:
                      </label>
                      <div className="py-2">
                        <OtpInput
                          value={adminEmailOtp}
                          onChange={setAdminEmailOtp}
                          onComplete={() => handleAdminStep2()}
                          disabled={isPending}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fallback & Alternate Options */}
                  <div className="pt-1 flex flex-col gap-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminUseBackupCode(!adminUseBackupCode);
                        setAdminUsingEmailOtp(false);
                      }}
                      className="text-xs text-indigo-400 hover:underline font-medium"
                    >
                      {adminUseBackupCode
                        ? "Use authenticator app (TOTP) instead"
                        : "Use a one-time backup recovery code instead"}
                    </button>

                    {adminEmailFallbackAvailable && !adminUsingEmailOtp && (
                      <button
                        type="button"
                        onClick={handleSendAdminEmailOtp}
                        className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 font-medium mt-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send OTP to registered Gmail ({adminMaskedEmail})</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-1/3 text-xs"
                      onClick={() => setAdminStep("CREDENTIALS")}
                      disabled={isPending}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="w-2/3 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      isLoading={isPending}
                      onClick={() => handleAdminStep2()}
                    >
                      <span>Authorize Session</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Back to student login */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <button
                  type="button"
                  onClick={() => toggleAdminMode(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1.5 font-medium"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to student & faculty login</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ======================================================== */
          /* B. STUDENT & TEACHER LOGIN CARD (STANDARD) */
          /* ======================================================== */
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Secure Login</CardTitle>
                <Badge variant="purple">Multi-Identifier</Badge>
              </div>
              <CardDescription>
                Sign in with your registered Username, Email address, or Mobile number.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4">
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

              <div className="pt-2">
                <GoogleSignInButton label="Continue with Google" />
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                New to GoWithStudy?{" "}
                <Link href="/apply" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Submit Admission Application
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Footer Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => toggleAdminMode(!isAdminMode)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>{isAdminMode ? "Return to student & faculty login" : "Administrator Portal"}</span>
          </button>
        </div>
      </div>

      {/* STEP-UP 2FA MODAL (FOR STUDENT UNRECOGNIZED DEVICE) */}
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
