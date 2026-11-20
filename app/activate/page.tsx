"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  checkActivationTokenAction,
  completeActivationAction,
} from "@/features/application/activation-actions";

export default function ActivatePage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ActivateContent />
    </React.Suspense>
  );
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [isValidating, setIsValidating] = React.useState(true);
  const [applicantInfo, setApplicantInfo] = React.useState<{
    applicantName: string;
    email: string;
    type: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setErrorMessage("No activation token provided. Please use the link sent to your email.");
      setIsValidating(false);
      return;
    }

    checkActivationTokenAction(token)
      .then((res) => {
        if (res.success && res.data) {
          setApplicantInfo(res.data);
        } else {
          setErrorMessage(res.message || "Activation link is invalid or expired.");
        }
      })
      .catch(() => {
        setErrorMessage("Network error verifying token. Please try again.");
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 10) {
      setErrorMessage("Password must be at least 10 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      const res = await completeActivationAction({
        token,
        password,
        confirmPassword,
      });

      if (res.success && res.data?.redirectUrl) {
        setIsSuccess(true);
        setTimeout(() => {
          router.replace(res.data!.redirectUrl);
        }, 1200);
      } else {
        setErrorMessage(res.message || "Failed to activate account.");
      }
    } catch {
      setErrorMessage("Network error during activation. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-md py-6">
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
            Account Activation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Set your permanent password to complete admission.
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              <span>Create Your Password</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your institutional application has been verified by the administrator.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isValidating ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Validating your secure activation token...</span>
              </div>
            ) : errorMessage && !isSuccess ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Activation Link Issue</span>
                </div>
                <p>{errorMessage}</p>
                <div className="pt-2">
                  <Link href="/apply" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Submit a new application →
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-2 text-center animate-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-sm">Account Activated!</h4>
                <p>Welcome to GoWithStudy. Launching your workspace...</p>
              </div>
            ) : (
              <>
                {applicantInfo && (
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-zinc-700 dark:text-zinc-300 space-y-0.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Welcome, {applicantInfo.applicantName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {applicantInfo.email} · {applicantInfo.type} Account
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      New Password (min 10 characters)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoFocus
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-10 text-xs font-semibold"
                    isLoading={isPending}
                    disabled={password.length < 10 || password !== confirmPassword}
                  >
                    <span>Activate Account & Log In</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
