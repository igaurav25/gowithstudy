"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowRight, Lock, Sparkles, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(null, formData);
      setResult(res);
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-md">
        {/* Brand Header */}
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
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Access your courses, AI notes & placement dashboard
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Secure Login</CardTitle>
              <Badge variant="purple">Encrypted Session</Badge>
            </div>
            <CardDescription>
              Sign in with your registered college credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Quick Demo Credentials for Fast Evaluation */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span>Demo Quick-Fill</span>
                <span className="text-indigo-600 dark:text-indigo-400">Password123!</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemo("student@campusflow.edu")}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                >
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("moderator@campusflow.edu")}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  <span>Moderator</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("admin@campusflow.edu")}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium hover:border-indigo-500 transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {result?.message && (
                <div
                  className={`p-3.5 rounded-xl text-sm font-medium border ${
                    result.success
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {result.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campusflow.edu"
                  required
                  error={result?.errors?.email}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  error={result?.errors?.password}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="rememberMe" className="text-xs text-zinc-600 dark:text-zinc-400 select-none">
                  Keep me signed in for 30 days
                </label>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2"
                isLoading={isPending}
              >
                <span>Sign In to GoWithStudy</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              New to GoWithStudy?{" "}
              <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
