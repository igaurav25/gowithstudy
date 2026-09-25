import Link from "next/link";
import { Compass, ArrowLeft, LayoutDashboard, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 - Page Not Found | GoWithStudy",
  description: "The requested study page or resource could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Compass Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        {/* Status & Title */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Error 404 • Destination Unknown
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Lost on Campus?
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The page, study material, or directory link you were trying to access does not exist or may have been relocated.
          </p>
        </div>

        {/* Quick Navigation Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/dashboard" className="w-full">
            <Button variant="default" className="w-full gap-2 shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-4 h-4" />
              <span>Student Dashboard</span>
            </Button>
          </Link>
          <Link href="/dashboard/college-info" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <Building2 className="w-4 h-4" />
              <span>University Portal</span>
            </Button>
          </Link>
        </div>

        {/* Secondary Back Link */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to GoWithStudy Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
