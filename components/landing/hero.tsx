import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  FileText,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background radial gradient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-sky-400/20 blur-[120px] rounded-full pointer-events-none -z-10"
      />

      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="purple" className="px-3.5 py-1 text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>AI-Powered Academic & Career Hub</span>
          </Badge>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-5xl leading-[1.15] sm:leading-[1.15]">
          Everything you need for college, learning and your career —{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500">
            in one place.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Manage your lectures, timetable, study notes, and assignments. Ask AI questions grounded in your uploaded PDFs, solve DSA challenges, and track internship applications seamlessly.
        </p>

        {/* Call to Actions */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <Button variant="gradient" size="lg" className="shadow-lg shadow-indigo-500/25">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg">
              Explore CampusFlow
            </Button>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Strict Student Privacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            <span>Document RAG AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-violet-500" />
            <span>Engineered for BTech & Higher Ed</span>
          </div>
        </div>

        {/* Interactive SaaS Platform Mockup Preview */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 p-2 sm:p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
          <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
            {/* Mockup Window Header */}
            <div className="h-11 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs font-mono text-zinc-400">campusflow.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Card 1: Today's Schedule & Deadlines */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Today&apos;s Lectures</span>
                  <Badge variant="purple" className="text-[10px]">3 Classes</Badge>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Database Management Systems</p>
                    <p className="text-[11px] text-zinc-500">10:00 AM • Room 302 • Dr. Sharma</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Design & Analysis of Algorithms</p>
                    <p className="text-[11px] text-zinc-500">01:30 PM • CS Lab 2 • Prof. Mehta</p>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Study Copilot (RAG) */}
              <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-900 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>AI Study Copilot</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">RAG Grounded</Badge>
                </div>
                <div className="text-xs space-y-2">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">You: </span>
                    Explain ACID properties from my lecture notes.
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 border border-indigo-100 dark:border-indigo-900">
                    <p className="text-[11px] leading-relaxed">
                      Based on <span className="font-medium text-indigo-600 dark:text-indigo-400 underline">DBMS_Unit3.pdf (p.14)</span>: ACID guarantees Atomicity, Consistency, Isolation, and Durability in transaction processing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Career & DSA Tracker */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Career & DSA Prep</span>
                  <Badge variant="secondary" className="text-[10px]">142 Solved</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-zinc-600 dark:text-zinc-400">Dynamic Programming</span>
                      <span className="text-emerald-600 dark:text-emerald-400">75%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-3/4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-zinc-600 dark:text-zinc-400">Trees & Graphs</span>
                      <span className="text-indigo-600 dark:text-indigo-400">60%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-3/5" />
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Google SWE Intern: Applied</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">OA Round</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
