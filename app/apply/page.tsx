"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Mail,
  Smartphone,
  User,
  Sparkles,
  School,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OtpInput } from "@/components/auth/otp-input";
import {
  sendApplicationEmailOtpAction,
  verifyApplicationEmailOtpAction,
  submitStudentApplicationAction,
  submitTeacherApplicationAction,
} from "@/features/application/actions";

const POPULAR_COLLEGES = [
  "Delhi Technological University (DTU)",
  "Indian Institute of Technology Bombay (IITB)",
  "Indian Institute of Technology Delhi (IITD)",
  "Indian Institute of Technology Madras (IITM)",
  "Netaji Subhas University of Technology (NSUT)",
  "Birla Institute of Technology and Science (BITS Pilani)",
  "National Institute of Technology Trichy (NITT)",
  "Vellore Institute of Technology (VIT)",
  "Manipal Institute of Technology (MIT)",
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
  "Other",
];

const POPULAR_BRANCHES = [
  "Computer Science & Engineering (CSE)",
  "Information Technology (IT)",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Other",
];

export default function ApplyPage() {
  const [tab, setTab] = React.useState<"STUDENT" | "TEACHER">("STUDENT");
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Common contact & verification
  const [email, setEmail] = React.useState("");
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [emailChallengeId, setEmailChallengeId] = React.useState("");
  const [emailOtp, setEmailOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Student specific
  const [collegeSelect, setCollegeSelect] = React.useState(POPULAR_COLLEGES[0]);
  const [customCollege, setCustomCollege] = React.useState("");
  const [course, setCourse] = React.useState("B.Tech");
  const [branchSelect, setBranchSelect] = React.useState(POPULAR_BRANCHES[0]);
  const [customBranch, setCustomBranch] = React.useState("");
  const [year, setYear] = React.useState(1);
  const [rollNumber, setRollNumber] = React.useState("");

  // Teacher specific
  const [institution, setInstitution] = React.useState("");
  const [designation, setDesignation] = React.useState("Assistant Professor");
  const [qualification, setQualification] = React.useState("Ph.D");
  const [department, setDepartment] = React.useState("Computer Science");
  const [experienceYears, setExperienceYears] = React.useState(3);
  const [teacherIdNumber, setTeacherIdNumber] = React.useState("");

  // Result state
  const [submittedRefId, setSubmittedRefId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Resend Countdown Timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendEmailOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid institutional or personal email address.");
      return;
    }

    setErrorMessage(null);
    setIsPending(true);
    try {
      const res = await sendApplicationEmailOtpAction({ email: cleanEmail });
      if (res.success && res.data) {
        setEmailChallengeId(res.data.challengeId);
        setCooldown(res.data.cooldownSeconds || 30);
        setOtpSent(true);
      } else {
        setErrorMessage(res.message || "Failed to dispatch verification code.");
      }
    } catch {
      setErrorMessage("Network error sending code. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || emailOtp).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setErrorMessage(null);
    setIsPending(true);
    try {
      const res = await verifyApplicationEmailOtpAction({
        challengeId: emailChallengeId,
        email: email.trim(),
        otpCode: code,
      });

      if (res.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
      } else {
        setErrorMessage(res.message || "Invalid verification code.");
      }
    } catch {
      setErrorMessage("Verification failed due to a network error.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setErrorMessage("Please verify your email address before submitting.");
      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    try {
      if (tab === "STUDENT") {
        const selectedCollege = collegeSelect === "Other" ? customCollege : collegeSelect;
        const selectedBranch = branchSelect === "Other" ? customBranch : branchSelect;

        if (!selectedCollege.trim() || !selectedBranch.trim() || !rollNumber.trim()) {
          setErrorMessage("Please fill out all academic fields.");
          setIsPending(false);
          return;
        }

        const res = await submitStudentApplicationAction({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: selectedCollege.trim(),
          course: course.trim(),
          branch: selectedBranch.trim(),
          year: Number(year),
          rollNumber: rollNumber.trim(),
        });

        if (res.success && res.data?.referenceId) {
          setSubmittedRefId(res.data.referenceId);
        } else {
          setErrorMessage(res.message || "Failed to submit student application.");
        }
      } else {
        if (!institution.trim() || !designation.trim() || !department.trim()) {
          setErrorMessage("Please fill out all educator fields.");
          setIsPending(false);
          return;
        }

        const res = await submitTeacherApplicationAction({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          institution: institution.trim(),
          designation: designation.trim(),
          qualification: qualification.trim(),
          department: department.trim(),
          experienceYears: Number(experienceYears),
          teacherIdNumber: teacherIdNumber.trim() || undefined,
        });

        if (res.success && res.data?.referenceId) {
          setSubmittedRefId(res.data.referenceId);
        } else {
          setErrorMessage(res.message || "Failed to submit educator application.");
        }
      }
    } catch {
      setErrorMessage("Submission failed due to a network error.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = () => {
    if (submittedRefId) {
      navigator.clipboard.writeText(submittedRefId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-xl py-6">
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
            Institutional Admission
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Submit your student or educator credentials for administrative review and activation.
          </p>
        </div>

        {/* SUBMISSION SUCCESS VIEW */}
        {submittedRefId ? (
          <Card className="border-emerald-200/80 dark:border-emerald-900/60 shadow-2xl shadow-emerald-500/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Application Submitted!</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your application has been logged for administrative verification.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Reference ID Pill */}
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  Your Application Reference ID
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {submittedRefId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Copy Reference ID"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                  Save this Reference ID to track your status at any time.
                </p>
              </div>

              {/* Workflow Roadmap */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">What Happens Next</h4>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">1. Application Under Review</span>
                      <span>The Super Admin reviews your identity, college, and enrollment details within 24-48 hours.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">2. Secure Activation Link via Email</span>
                      <span>Once approved, you will receive an email with a secure link (valid for 48h) to create your password.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">3. Full Access to GoWithStudy</span>
                      <span>Log in to access your course syllabus, AI study assistant, assignments, and placement tracker.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    setSubmittedRefId(null);
                    setIsEmailVerified(false);
                    setEmail("");
                  }}
                >
                  Submit Another Application
                </Button>
                <Link href="/apply/status" className="w-full">
                  <Button
                    variant="gradient"
                    className="w-full text-xs font-semibold"
                  >
                    <span>Track Status Now</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* APPLICATION FORM */
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 overflow-hidden">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTab("STUDENT");
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  tab === "STUDENT"
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Admission</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("TEACHER");
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  tab === "TEACHER"
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Teacher / Educator</span>
              </button>
            </div>

            <CardContent className="pt-5 space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {/* 1. Email Verification Section */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{tab === "STUDENT" ? "Student Email (Gmail / College)" : "Institutional Email"}</span>
                    </label>
                    {isEmailVerified && (
                      <Badge variant="success" className="gap-1 text-[10px] py-0.5">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      disabled={isEmailVerified || isPending}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tab === "STUDENT" ? "student.name@gmail.com" : "faculty@university.ac.in"}
                      required
                      className="flex-1 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70"
                    />
                    {!isEmailVerified && !otpSent && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        isLoading={isPending}
                        onClick={handleSendEmailOtp}
                        className="h-10 text-xs px-3"
                      >
                        Send OTP
                      </Button>
                    )}
                  </div>

                  {otpSent && !isEmailVerified && (
                    <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Enter the 6-digit verification code sent to your email:
                      </p>
                      <OtpInput
                        value={emailOtp}
                        onChange={(v) => setEmailOtp(v)}
                        onComplete={(v) => handleVerifyOtp(v)}
                        disabled={isPending}
                      />
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-zinc-400">
                          {cooldown > 0 ? `Resend in ${cooldown}s` : ""}
                        </span>
                        {cooldown === 0 && (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                          >
                            Resend Code
                          </button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="gradient"
                          isLoading={isPending}
                          disabled={emailOtp.length !== 6}
                          onClick={() => handleVerifyOtp()}
                          className="h-8 text-xs"
                        >
                          Verify Code
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Full Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Mobile Number (+91)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* STUDENT SPECIFIC FIELDS */}
                {tab === "STUDENT" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        College / University
                      </label>
                      <select
                        value={collegeSelect}
                        onChange={(e) => setCollegeSelect(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {POPULAR_COLLEGES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {collegeSelect === "Other" && (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Enter College Name
                        </label>
                        <input
                          type="text"
                          value={customCollege}
                          onChange={(e) => setCustomCollege(e.target.value)}
                          placeholder="e.g. SRM Institute of Science and Technology"
                          required
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Degree / Course
                        </label>
                        <select
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="B.Tech">B.Tech</option>
                          <option value="B.E.">B.E.</option>
                          <option value="BCA">BCA</option>
                          <option value="MCA">MCA</option>
                          <option value="M.Tech">M.Tech</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="M.Sc">M.Sc</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Current Year
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value={1}>1st Year</option>
                          <option value={2}>2nd Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={4}>4th Year</option>
                          <option value={5}>5th Year</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Branch / Specialization
                      </label>
                      <select
                        value={branchSelect}
                        onChange={(e) => setBranchSelect(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {POPULAR_BRANCHES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {branchSelect === "Other" && (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Enter Branch Name
                        </label>
                        <input
                          type="text"
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          placeholder="e.g. Mechatronics Engineering"
                          required
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Student ID / Roll Number
                      </label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. 2K21/CO/245"
                        required
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </>
                ) : (
                  /* TEACHER SPECIFIC FIELDS */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Institution / University Name
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. Delhi Technological University"
                        required
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="e.g. Associate Professor"
                          required
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Highest Qualification
                        </label>
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          placeholder="e.g. Ph.D (Computer Science)"
                          required
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Computer Engineering"
                          required
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(Number(e.target.value))}
                          required
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Teacher / Faculty ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={teacherIdNumber}
                        onChange={(e) => setTeacherIdNumber(e.target.value)}
                        placeholder="e.g. FAC-2018-88"
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 text-sm font-semibold"
                  isLoading={isPending}
                  disabled={!isEmailVerified}
                >
                  <span>Submit Application for Review</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>

              <div className="pt-2 text-center text-xs text-zinc-500">
                Already submitted?{" "}
                <Link href="/apply/status" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Track Application Status
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
