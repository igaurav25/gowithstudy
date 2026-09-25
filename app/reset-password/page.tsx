"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction, ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowRight, CheckCircle2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      const res = await resetPasswordAction(null, formData);
      setResult(res);
    });
  };

  if (!token) {
    return (
      <div className="text-center p-6 space-y-4">
        <p className="text-sm text-rose-500 font-medium">
          Missing password reset token in URL. Please request a new link.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline" size="sm">
            Request Password Reset
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <CardContent>
      {result?.success ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            Password Reset Complete!
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            {result.message}
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="gradient" size="sm" className="w-full">
                Sign in with new password
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {result?.message && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {result.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              New Password
            </label>
            <Input
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
              error={result?.errors?.password}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Confirm New Password
            </label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
              error={result?.errors?.confirmPassword}
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full mt-2"
            isLoading={isPending}
          >
            <span>Update Password</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}
    </CardContent>
  );
}

export default function ResetPasswordPage() {
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
            Set new password
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Choose a strong password with letters, numbers, and symbols
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Update Credentials</CardTitle>
              <Badge variant="purple">Secure Session Revocation</Badge>
            </div>
            <CardDescription>
              All active sessions will be invalidated for security upon reset.
            </CardDescription>
          </CardHeader>

          <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading token...</div>}>
            <ResetPasswordForm />
          </React.Suspense>
        </Card>
      </div>
    </div>
  );
}
