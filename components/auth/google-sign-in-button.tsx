"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { googleSignInAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Check, X, ShieldAlert, Mail } from "lucide-react";

interface GoogleSignInButtonProps {
  label?: string;
  className?: string;
}

const subscribeNoop = () => () => {};
function getRememberedEmailSnapshot(): string | null {
  try {
    const stored =
      localStorage.getItem("gowithstudy_last_identifier") ||
      localStorage.getItem("gowithstudy_last_email");
    return stored && stored.includes("@") ? stored : null;
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: number;
              text?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  label = "Continue with Google",
  className = "",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const rememberedEmail = React.useSyncExternalStore(
    subscribeNoop,
    getRememberedEmailSnapshot,
    () => null
  );

  const [emailInput, setEmailInput] = React.useState<string | null>(null);
  const email = emailInput ?? rememberedEmail ?? "";
  const setEmail = (val: string) => setEmailInput(val);

  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isDevOrBypass =
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL &&
    process.env.NEXT_PUBLIC_ALLOW_DEV_BYPASS === "true";

  // Initialize Google Identity Services if client ID is configured
  React.useEffect(() => {
    if (!googleClientId || typeof window === "undefined") return;

    const handleCredentialResponse = async (response: { credential?: string }) => {
      if (!response.credential) return;
      setIsPending(true);
      setError(null);
      try {
        const res = await googleSignInAction({ idToken: response.credential });
        if (res.success && res.data) {
          router.replace(res.data.redirectUrl || "/dashboard");
        } else {
          setError(res.message || "Google authentication failed.");
        }
      } catch {
        setError("Network error connecting to Google authentication service.");
      } finally {
        setIsPending(false);
      }
    };

    const loadGis = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });
      }
    };

    if (window.google?.accounts?.id) {
      loadGis();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = loadGis;
      document.head.appendChild(script);
    }
  }, [googleClientId, router]);

  const handleButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    if (isDevOrBypass) {
      setIsOpen(true);
    } else {
      setError(
        "Institutional Google Workspace Sign-In is currently in private preview. Please use Username, Email, or Mobile to sign in."
      );
    }
  };

  const handleDevSubmit = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please provide a valid Gmail or university address.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const res = await googleSignInAction({ email: cleanEmail });

      if (res.success && res.data) {
        setSuccessMsg(res.message || "Logged in successfully!");
        try {
          localStorage.setItem("gowithstudy_last_identifier", res.data.email);
          localStorage.setItem("gowithstudy_logged_in", "true");
        } catch {
          // ignore
        }

        const redirectUrl = res.data.redirectUrl || "/dashboard";
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 300);
      } else {
        setError(res.message || "Sign in failed. Please try again.");
      }
    } catch {
      setError("Network error during simulated sign-in. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
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

      {error && !isOpen && (
        <p className="mt-2 text-xs text-rose-500 font-medium text-center">{error}</p>
      )}

      {/* Dev Mode Simulated Sign-In Dialog (Never active in pure production) */}
      {isOpen && isDevOrBypass && (
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Dev Mode: Simulated Google Sign-In
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Local developer sandbox simulation
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDevSubmit(email);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Enter Simulated Address
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
                  <span>Simulate Sign-In</span>
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
