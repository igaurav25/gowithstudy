"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { googleSignInAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Check, X, ShieldCheck, Mail } from "lucide-react";

interface GoogleSignInButtonProps {
  label?: string;
  className?: string;
}

export function GoogleSignInButton({
  label = "Continue with Google",
  className = "",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [rememberedEmail] = React.useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("campusflow_last_email");
        if (stored && stored.includes("@")) return stored;
      } catch {
        // localStorage restricted
      }
    }
    return null;
  });
  const [email, setEmail] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("campusflow_last_email");
        if (stored && stored.includes("@")) return stored;
      } catch {
        // localStorage restricted
      }
    }
    return "";
  });
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleGoogleSubmit = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please provide a valid Gmail or email address.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const res = await googleSignInAction({ email: cleanEmail });

      if (res.success && res.data) {
        setSuccessMsg(res.message || "Logged in successfully!");
        try {
          localStorage.setItem("campusflow_last_email", res.data.email);
          localStorage.setItem("campusflow_user_name", res.data.name);
          localStorage.setItem("campusflow_logged_in", "true");
        } catch {
          // ignore
        }

        setTimeout(() => {
          router.push(res.data?.redirectUrl || "/dashboard");
          router.refresh();
        }, 500);
      } else {
        setError(res.message || "Sign in failed. Please try again.");
      }
    } catch {
      setError("Network error during Google sign-in. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`w-full relative h-11 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium text-zinc-800 dark:text-zinc-200 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 ${className}`}
      >
        <span className="flex items-center justify-center gap-3 w-full">
          {/* Official Google 'G' SVG Logo */}
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-sm">{label}</span>
        </span>
      </Button>

      {/* Gmail / Google One-Click Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => {
                if (!isPending) setIsOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Google Account Sign-In
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Desktop & Mobile Persistent Authentication
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Quick One-Tap for Remembered Email */}
            {rememberedEmail && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
                <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
                  Remembered on this device:
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGoogleSubmit(rememberedEmail)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 text-left text-xs transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      {rememberedEmail[0]}
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {rememberedEmail}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        1-Tap Instant Sign-In
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGoogleSubmit(email);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Enter your Gmail / Google Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.name@gmail.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    New accounts are automatically created. Sessions persist for 60 days.
                  </span>
                </p>
              </div>

              {/* Sample Google accounts for quick one-click testing */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-500 font-medium">Quick Test Accounts:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("aarav.student@gmail.com");
                      handleGoogleSubmit("aarav.student@gmail.com");
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    aarav.student@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("riya.developer@gmail.com");
                      handleGoogleSubmit("riya.developer@gmail.com");
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    riya.developer@gmail.com
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  isLoading={isPending}
                >
                  <span>Continue with Gmail</span>
                  <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
