"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupAction, ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { GraduationCap, ArrowRight, CheckCircle2, Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult<{ verificationToken: string; email: string }> | null>(null);
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signupAction(null, formData);
      setResult(res);
      if (res.success) {
        // Optional quick redirect or allow user to see verification token
      }
    });
  };

  // Password strength checks
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-2xl">
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
            Create your student account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Join your college learning & placement hub
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Academic & Security Registration</CardTitle>
              <Badge variant="purple">Phase 3 Auth</Badge>
            </div>
            <CardDescription>
              Fill out your university credentials to personalize your course timetable and notes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {result?.success ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  Account Created Successfully!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                  We sent a confirmation token to <strong>{result.data?.email}</strong>. In production this triggers an email; for development testing, click below:
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href={`/verify-email?token=${result.data?.verificationToken}`}>
                    <Button variant="gradient" size="sm">
                      <Mail className="w-4 h-4 mr-1.5" />
                      Verify Email (Dev Sim)
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard")}
                  >
                    Proceed to Dashboard
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1-Click Fast Google / Gmail Registration */}
                <div className="space-y-3">
                  <GoogleSignInButton label="Sign Up Instantly with Google / Gmail" />
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-400 font-medium">
                        or fill out manual registration
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {result?.message && !result.success && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
                      {result.message}
                    </div>
                  )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g. Aarav Sharma"
                      required
                      error={result?.errors?.name}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      College / University Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="aarav@college.edu"
                      required
                      error={result?.errors?.email}
                    />
                  </div>
                </div>

                {/* College & Course */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      College / University Name
                    </label>
                    <Input
                      name="college"
                      placeholder="Delhi Technological University"
                      required
                      error={result?.errors?.college}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Course / Degree
                    </label>
                    <Input
                      name="course"
                      placeholder="B.Tech"
                      required
                      error={result?.errors?.course}
                    />
                  </div>
                </div>

                {/* Branch, Year, Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Branch / Stream
                    </label>
                    <Input
                      name="branch"
                      placeholder="CSE / IT"
                      required
                      error={result?.errors?.branch}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Academic Year
                    </label>
                    <Input
                      name="year"
                      type="number"
                      min={1}
                      max={5}
                      defaultValue={3}
                      required
                      error={result?.errors?.year}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Semester
                    </label>
                    <Input
                      name="semester"
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={6}
                      required
                      error={result?.errors?.semester}
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Create Password
                    </label>
                    <Input
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      error={result?.errors?.password}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Confirm Password
                    </label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-type password"
                      required
                      error={result?.errors?.confirmPassword}
                    />
                  </div>
                </div>

                {/* Password Strength Checklist */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-500">
                  <span className={hasLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                    ✓ 8+ Characters
                  </span>
                  <span className={hasUpper && hasLower ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                    ✓ Upper & Lower
                  </span>
                  <span className={hasNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                    ✓ 1+ Number
                  </span>
                  <span className={hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                    ✓ 1+ Symbol (@$!%*?&)
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  isLoading={isPending}
                >
                  <span>Complete Student Registration</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </div>
          )}

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
