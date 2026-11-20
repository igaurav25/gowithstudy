"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { lookupApplicationStatusAction } from "@/features/application/actions";

export default function ApplicationStatusPage() {
  const [referenceId, setReferenceId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [application, setApplication] = React.useState<any | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setApplication(null);

    const ref = referenceId.trim().toUpperCase();
    const mail = email.trim();

    if (!ref || !mail) {
      setErrorMessage("Please enter both Reference ID and registered Email.");
      return;
    }

    setIsPending(true);
    try {
      const res = await lookupApplicationStatusAction({
        referenceId: ref,
        email: mail,
      });

      if (res.success && res.data?.application) {
        setApplication(res.data.application);
      } else {
        setErrorMessage(res.message || "No matching application found.");
      }
    } catch {
      setErrorMessage("Lookup failed due to a network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-zinc-50/60 dark:bg-zinc-950/80">
      <div className="w-full max-w-lg py-6">
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
            Application Status
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Check the live review progress of your admission application.
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Track Review State</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enter your Application Reference ID (e.g. GWS-XXXXXXXX) and registered email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Reference ID
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
                  placeholder="e.g. GWS-7X9B2K4L"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-10 text-xs font-semibold"
                isLoading={isPending}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                <span>Check Status</span>
              </Button>
            </form>

            {/* STATUS RESULT CARD */}
            {application && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Application Review Result
                  </span>
                  {application.status === "PENDING" && (
                    <Badge variant="warning" className="gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Under Review</span>
                    </Badge>
                  )}
                  {application.status === "APPROVED" && (
                    <Badge variant="success" className="gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved</span>
                    </Badge>
                  )}
                  {application.status === "REJECTED" && (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejected</span>
                    </Badge>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Applicant:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{application.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Type:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{application.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">College / Institution:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[200px]">
                      {application.college || application.institution}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Submitted On:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {application.status === "REJECTED" && application.rejectionReason && (
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400">
                      <span className="font-semibold block">Decision Reason:</span>
                      <p className="mt-0.5">{application.rejectionReason}</p>
                    </div>
                  )}

                  {application.status === "APPROVED" && (
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <span className="font-semibold block">Activation Link Dispatched</span>
                      <p className="mt-0.5">
                        Please check your email inbox for the activation link to create your password and log in.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-xs text-zinc-500">
              Need to submit a new application?{" "}
              <Link href="/apply" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Apply Here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
