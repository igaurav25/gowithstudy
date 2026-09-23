"use client";

import * as React from "react";
import Link from "next/link";
import { forgotPasswordAction, ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowLeft, Mail, KeyRound, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult<{ resetToken?: string }> | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await forgotPasswordAction(null, formData);
      setResult(res);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              CampusFlow
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Forgot your password?
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            We will send you a secure link to reset it
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Reset Password Request</CardTitle>
              <Badge variant="purple">Token Expiry: 1h</Badge>
            </div>
            <CardDescription>
              Enter the email associated with your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {result?.success ? (
              <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {result.message}
                </p>

                {/* Dev Mode Reset Link Helper */}
                {result.data?.resetToken && (
                  <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-800/60">
                    <p className="text-[11px] text-zinc-500 mb-2">Development Helper Link:</p>
                    <Link href={`/reset-password?token=${result.data.resetToken}`}>
                      <Button variant="gradient" size="sm" className="w-full">
                        <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                        Open Reset Password Form
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {result?.message && !result.success && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
                    {result.message}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="student@campusflow.edu"
                    required
                    error={result?.errors?.email}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  isLoading={isPending}
                >
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
