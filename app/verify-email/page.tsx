"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmailAction, ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = React.useState(true);
  const [result, setResult] = React.useState<ActionResult | null>(null);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setResult({ success: false, message: "Missing verification token in URL." });
      return;
    }

    verifyEmailAction(token).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Verifying your college credentials...
        </p>
      </div>
    );
  }

  return (
    <CardContent className="pt-4 text-center space-y-5">
      {result?.success ? (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Email Verified Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Your student account is now fully verified. You can access all academic notes, AI copilot, and placement tools.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="gradient" className="w-full">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Verification Failed
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {result?.message || "The verification link is invalid or has expired."}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Create new account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full text-xs">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      )}
    </CardContent>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              GoWithStudy
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Email Verification
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Confirming student institutional affiliation
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Token Validation</CardTitle>
              <Badge variant="purple">One-Time Token</Badge>
            </div>
            <CardDescription>
              Confirming your email address for campus announcements.
            </CardDescription>
          </CardHeader>

          <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Checking verification...</div>}>
            <VerifyEmailContent />
          </React.Suspense>
        </Card>
      </div>
    </div>
  );
}
