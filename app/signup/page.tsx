"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startSignupFlowAction,
  verifySignupEmailOtpAction,
  sendSignupPhoneOtpAction,
  verifySignupPhoneOtpAction,
  completeRegistrationAction,
} from "@/features/auth/high-assurance-actions";
import { OtpInput } from "@/components/auth/otp-input";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Lock,
  User,
  Building2,
  BookOpen,
} from "lucide-react";

type SignupStep =
  | "EMAIL_INPUT"
  | "EMAIL_OTP"
  | "PHONE_INPUT"
  | "PHONE_OTP"
  | "PROFILE_INPUT";

const TOP_COLLEGES = [
  "Delhi Technological University (DTU)",
  "Indian Institute of Technology Bombay (IITB)",
  "Indian Institute of Technology Delhi (IITD)",
  "Indian Institute of Technology Madras (IITM)",
  "Birla Institute of Technology and Science (BITS Pilani)",
  "National Institute of Technology Trichy (NITT)",
  "Netaji Subhas University of Technology (NSUT)",
  "Vellore Institute of Technology (VIT)",
  "Manipal Institute of Technology (MIT)",
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
  "University of Delhi (DU)",
  "Anna University",
];

const POPULAR_BRANCHES = [
  "Computer Science & Engineering (CSE)",
  "Information Technology (IT)",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
];

export default function SignupPage() {
  const router = useRouter();

  // Wizard state machine
  const [step, setStep] = React.useState<SignupStep>("EMAIL_INPUT");
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Registration session payload
  const [signupToken, setSignupToken] = React.useState<string>("");
  const [turnstileToken, setTurnstileToken] = React.useState<string>("");

  // Step 1: Email
  const [email, setEmail] = React.useState("");
  const [emailChallengeId, setEmailChallengeId] = React.useState("");
  const [maskedEmail, setMaskedEmail] = React.useState("");
  const [emailOtp, setEmailOtp] = React.useState("");
  const [emailCooldown, setEmailCooldown] = React.useState(0);

  // Step 2: Phone
  const [phoneCountry, setPhoneCountry] = React.useState("+91");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [phoneChannel, setPhoneChannel] = React.useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [phoneChallengeId, setPhoneChallengeId] = React.useState("");
  const [maskedPhone, setMaskedPhone] = React.useState("");
  const [phoneOtp, setPhoneOtp] = React.useState("");
  const [phoneCooldown, setPhoneCooldown] = React.useState(0);
  const allowSkipPhone = process.env.NEXT_PUBLIC_AUTH_REQUIRE_PHONE_OTP === "false";

  // Step 3: Profile & Credentials
  const [username, setUsername] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [college, setCollege] = React.useState("");
  const [course, setCourse] = React.useState("B.Tech");
  const [branch, setBranch] = React.useState("");
  const [year, setYear] = React.useState(1);
  const [semester, setSemester] = React.useState(1);
  const [consentGiven, setConsentGiven] = React.useState(false);

  // Resend Countdown Timers
  React.useEffect(() => {
    if (emailCooldown <= 0) return;
    const interval = setInterval(() => {
      setEmailCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [emailCooldown]);

  React.useEffect(() => {
    if (phoneCooldown <= 0) return;
    const interval = setInterval(() => {
      setPhoneCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneCooldown]);

  // ----------------------------------------------------
  // ACTION: Submit Email & Receive Code
  // ----------------------------------------------------
  const handleStartEmailFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid academic or personal email address.");
      return;
    }

    if (!username) {
      const derived = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      if (derived.length >= 3) {
        setUsername(derived);
      }
    }

    setIsPending(true);
    try {
      const res = await startSignupFlowAction({
        email: cleanEmail,
        turnstileToken: turnstileToken || "dev_bypass_turnstile",
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Failed to dispatch verification code.");
        return;
      }

      setSignupToken(res.data.signupToken);
      setEmailChallengeId(res.data.challengeId);
      setMaskedEmail(res.data.maskedEmail);
      setEmailCooldown(res.data.cooldownSeconds || 30);
      setStep("EMAIL_OTP");
    } catch {
      setErrorMessage("Network error connecting to verification service. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Verify Email OTP
  // ----------------------------------------------------
  const handleVerifyEmailOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || emailOtp).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    try {
      const res = await verifySignupEmailOtpAction({
        signupToken,
        challengeId: emailChallengeId,
        otpCode: code,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Invalid or expired verification code.");
        return;
      }

      setSignupToken(res.data.updatedToken);
      setStep("PHONE_INPUT");
    } catch {
      setErrorMessage("Verification failed. Please check your network connection.");
    } finally {
      setIsPending(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Submit Phone & Receive Mobile Code
  // ----------------------------------------------------
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullPhone = `${phoneCountry}${phoneNumber.replace(/\D/g, "")}`;
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsPending(true);
    try {
      const res = await sendSignupPhoneOtpAction({
        signupToken,
        phone: fullPhone,
        channel: phoneChannel,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Failed to dispatch mobile verification code.");
        return;
      }

      setPhoneChallengeId(res.data.challengeId);
      setMaskedPhone(res.data.maskedPhone);
      setPhoneCooldown(res.data.cooldownSeconds || 30);
      setStep("PHONE_OTP");
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Verify Phone OTP
  // ----------------------------------------------------
  const handleVerifyPhoneOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || phoneOtp).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit mobile verification code.");
      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    try {
      const fullPhone = `${phoneCountry}${phoneNumber.replace(/\D/g, "")}`;
      const res = await verifySignupPhoneOtpAction({
        signupToken,
        phone: fullPhone,
        challengeId: phoneChallengeId,
        otpCode: code,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Invalid mobile verification code.");
        return;
      }

      setSignupToken(res.data.updatedToken);
      setStep("PROFILE_INPUT");
    } catch {
      setErrorMessage("Mobile verification failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Complete Profile & Launch Account
  // ----------------------------------------------------
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 10) {
      setErrorMessage("Password must be at least 10 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!consentGiven) {
      setErrorMessage("Please accept the terms and privacy policy to complete registration.");
      return;
    }

    setIsPending(true);
    try {
      const res = await completeRegistrationAction({
        signupToken,
        formData: {
          username: username.trim().toLowerCase(),
          name: name.trim(),
          password,
          college: college.trim(),
          course: course.trim(),
          branch: branch.trim(),
          year: Number(year),
          semester: Number(semester),
          consentGiven: true,
        },
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Failed to finalize registration.");
        return;
      }

      try {
        localStorage.setItem("gowithstudy_last_email", email.trim().toLowerCase());
        localStorage.setItem("gowithstudy_logged_in", "true");
      } catch {
        // ignore storage quota error
      }

      router.replace(res.data.redirectUrl || "/dashboard");
    } catch {
      setErrorMessage("Failed to finalize student account. Please retry.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-xl">
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
            Create Student Account
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Verified academic profile & dual-factor secured registration
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <div className={`flex items-center gap-1.5 ${step === "EMAIL_INPUT" || step === "EMAIL_OTP" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-emerald-600 dark:text-emerald-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "EMAIL_INPUT" || step === "EMAIL_OTP" ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"}`}>
                {step === "EMAIL_INPUT" || step === "EMAIL_OTP" ? "1" : "✓"}
              </div>
              <span className="hidden sm:inline">1. Email OTP</span>
            </div>

            <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-zinc-200 dark:bg-zinc-800" />

            <div className={`flex items-center gap-1.5 ${step === "PHONE_INPUT" || step === "PHONE_OTP" ? "text-indigo-600 dark:text-indigo-400 font-bold" : (step === "PROFILE_INPUT" ? "text-emerald-600 dark:text-emerald-400" : "")}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "PHONE_INPUT" || step === "PHONE_OTP" ? "bg-indigo-600 text-white" : (step === "PROFILE_INPUT" ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600")}`}>
                {step === "PROFILE_INPUT" ? "✓" : "2"}
              </div>
              <span className="hidden sm:inline">2. Mobile OTP</span>
            </div>

            <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-zinc-200 dark:bg-zinc-800" />

            <div className={`flex items-center gap-1.5 ${step === "PROFILE_INPUT" ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "PROFILE_INPUT" ? "bg-indigo-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600"}`}>
                3
              </div>
              <span className="hidden sm:inline">3. Profile</span>
            </div>
          </div>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 overflow-hidden">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: EMAIL ADDRESS & BOT CHECK */}
          {/* ======================================================== */}
          {step === "EMAIL_INPUT" && (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <span>Enter your email address</span>
                  </CardTitle>
                  <Badge variant="purple">Step 1 of 3</Badge>
                </div>
                <CardDescription>
                  We send a 6-digit one-time password to verify your student identity.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleStartEmailFlow} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Academic or Personal Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu or name@gmail.com"
                      required
                      autoFocus
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Gmail aliases (+) and extra dots are automatically unified. Disposable temporary emails are rejected.
                    </p>
                  </div>

                  {/* Cloudflare Turnstile Bot Guard */}
                  <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full h-11 text-sm font-semibold"
                    isLoading={isPending}
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Already registered?{" "}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* ======================================================== */}
          {/* STEP 1.5: EMAIL OTP VERIFICATION */}
          {/* ======================================================== */}
          {step === "EMAIL_OTP" && (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Verify Email Code</CardTitle>
                  <Badge variant="purple">Email Security</Badge>
                </div>
                <CardDescription>
                  Enter the 6-digit code dispatched to{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">{maskedEmail}</strong>.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Quick deep link for Gmail users on mobile/desktop */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
                  <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>Check inbox or spam folder</span>
                  </div>
                  <a
                    href="https://mail.google.com/mail/u/0/#search/GoWithStudy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <span>Open Gmail</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 6-box OTP input */}
                <div className="py-2">
                  <OtpInput
                    value={emailOtp}
                    onChange={(val) => setEmailOtp(val)}
                    onComplete={(val) => handleVerifyEmailOtp(val)}
                    hasError={Boolean(errorMessage)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("EMAIL_INPUT");
                      setEmailOtp("");
                      setErrorMessage(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Wrong email? Change</span>
                  </button>

                  <button
                    type="button"
                    disabled={emailCooldown > 0 || isPending}
                    onClick={async () => {
                      if (emailCooldown > 0) return;
                      setIsPending(true);
                      try {
                        const res = await startSignupFlowAction({
                          email,
                          turnstileToken: turnstileToken || "dev_bypass_turnstile",
                        });
                        if (res.success && res.data) {
                          setEmailChallengeId(res.data.challengeId);
                          setEmailCooldown(res.data.cooldownSeconds || 30);
                          setErrorMessage(null);
                        } else {
                          setErrorMessage(res.message || "Resend failed.");
                        }
                      } finally {
                        setIsPending(false);
                      }
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {emailCooldown > 0 ? `Resend code in ${emailCooldown}s` : "Resend code"}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="gradient"
                  size="lg"
                  className="w-full h-11 text-sm font-semibold"
                  isLoading={isPending}
                  disabled={emailOtp.length !== 6}
                  onClick={() => handleVerifyEmailOtp()}
                >
                  <span>Verify & Proceed to Mobile</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PHONE NUMBER & CHANNEL SELECTION */}
          {/* ======================================================== */}
          {step === "PHONE_INPUT" && (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <span>Verify Mobile Number</span>
                  </CardTitle>
                  <Badge variant="purple">Step 2 of 3</Badge>
                </div>
                <CardDescription>
                  Indian students receive exam alerts and account recovery directly on WhatsApp or SMS.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  {/* Channel Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Choose Delivery Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPhoneChannel("WHATSAPP")}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          phoneChannel === "WHATSAPP"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>WhatsApp</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded font-medium">Fastest</span>
                          </div>
                          <div className="text-[11px] text-zinc-500">Official Utility Template</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhoneChannel("SMS")}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          phoneChannel === "SMS"
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">Standard SMS</div>
                          <div className="text-[11px] text-zinc-500">TRAI DLT Verified</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Phone input with country code */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Mobile Number (E.164)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountry}
                        onChange={(e) => setPhoneCountry(e.target.value)}
                        className="h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      >
                        <option value="+91">🇮🇳 +91 (India)</option>
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        autoFocus
                        className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full h-11 text-sm font-semibold"
                    isLoading={isPending}
                  >
                    <span>Send {phoneChannel === "WHATSAPP" ? "WhatsApp" : "SMS"} Code</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {allowSkipPhone && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setStep("PROFILE_INPUT")}
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                      >
                        Skip mobile verification for now
                      </button>
                    </div>
                  )}
                </form>
              </CardContent>
            </>
          )}

          {/* ======================================================== */}
          {/* STEP 2.5: PHONE OTP VERIFICATION */}
          {/* ======================================================== */}
          {step === "PHONE_OTP" && (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Verify Mobile Code</CardTitle>
                  <Badge variant="purple">Mobile 2FA</Badge>
                </div>
                <CardDescription>
                  Enter the 6-digit code received on{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">{maskedPhone}</strong> via{" "}
                  {phoneChannel === "WHATSAPP" ? "WhatsApp" : "SMS"}.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* 6-box OTP input with Android WebOTP API */}
                <div className="py-2">
                  <OtpInput
                    value={phoneOtp}
                    onChange={(val) => setPhoneOtp(val)}
                    onComplete={(val) => handleVerifyPhoneOtp(val)}
                    hasError={Boolean(errorMessage)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("PHONE_INPUT");
                      setPhoneOtp("");
                      setErrorMessage(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change mobile number</span>
                  </button>

                  <button
                    type="button"
                    disabled={phoneCooldown > 0 || isPending}
                    onClick={async () => {
                      if (phoneCooldown > 0) return;
                      setIsPending(true);
                      try {
                        const fullPhone = `${phoneCountry}${phoneNumber.replace(/\D/g, "")}`;
                        const res = await sendSignupPhoneOtpAction({
                          signupToken,
                          phone: fullPhone,
                          channel: phoneChannel,
                        });
                        if (res.success && res.data) {
                          setPhoneChallengeId(res.data.challengeId);
                          setPhoneCooldown(res.data.cooldownSeconds || 30);
                          setErrorMessage(null);
                        } else {
                          setErrorMessage(res.message || "Resend failed.");
                        }
                      } finally {
                        setIsPending(false);
                      }
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {phoneCooldown > 0 ? `Resend code in ${phoneCooldown}s` : "Resend code"}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="gradient"
                  size="lg"
                  className="w-full h-11 text-sm font-semibold"
                  isLoading={isPending}
                  disabled={phoneOtp.length !== 6}
                  onClick={() => handleVerifyPhoneOtp()}
                >
                  <span>Verify & Set Up Profile</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {/* ======================================================== */}
          {/* STEP 3: STUDENT PROFILE & CREDENTIALS */}
          {/* ======================================================== */}
          {step === "PROFILE_INPUT" && (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>Academic Profile & Security</span>
                  </CardTitle>
                  <Badge variant="purple">Step 3 of 3</Badge>
                </div>
                <CardDescription>
                  Personalize your semester timetable, notes syllabus, and secure credentials.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  {/* Full Name & Unique Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Unique Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 font-mono">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                          placeholder="rahul_sharma"
                          required
                          className="w-full h-10 pl-8 pr-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* College Name with Popular Datalist */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>College / University</span>
                    </label>
                    <input
                      type="text"
                      list="college-suggestions"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Delhi Technological University"
                      required
                      className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <datalist id="college-suggestions">
                      {TOP_COLLEGES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  {/* Course & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Course
                      </label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      >
                        <option value="B.Tech">B.Tech / B.E.</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="B.Sc">B.Sc Computer Science</option>
                        <option value="Other">Other Degree</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Branch / Department</span>
                      </label>
                      <input
                        type="text"
                        list="branch-suggestions"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="Computer Science"
                        required
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <datalist id="branch-suggestions">
                        {POPULAR_BRANCHES.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Year & Semester */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Academic Year
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      >
                        <option value={1}>1st Year (Fresher)</option>
                        <option value={2}>2nd Year (Sophomore)</option>
                        <option value={3}>3rd Year (Junior)</option>
                        <option value={4}>4th Year (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Current Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Choose Secure Password</span>
                        </span>
                        <span className="text-[11px] font-normal text-zinc-500">Min 10 characters</span>
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                        I agree to the Terms of Service and Privacy Policy. I confirm that I am an enrolled student and will adhere to academic integrity guidelines.
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full h-11 text-sm font-semibold"
                    isLoading={isPending}
                    disabled={!consentGiven || password.length < 10}
                  >
                    <span>Complete Registration & Launch Hub</span>
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
