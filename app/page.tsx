import { siteConfig } from "@/config/site";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Code2,
  Briefcase,
  Users2,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const coreModules = [
    {
      icon: BookOpen,
      title: "Academics & Study Notes",
      desc: "Smart note taking, PDF uploads, categorization & search.",
    },
    {
      icon: Sparkles,
      title: "AI Study Assistant & RAG",
      desc: "Ask conceptual questions and query your own uploaded PDFs.",
    },
    {
      icon: Calendar,
      title: "Timetable & Assignments",
      desc: "Class schedules, deadline tracking, and status reminders.",
    },
    {
      icon: Code2,
      title: "Placement & DSA Tracker",
      desc: "Curated topic breakdowns, difficulty filters, and revision queues.",
    },
    {
      icon: Briefcase,
      title: "Internship & Job Pipeline",
      desc: "Track applications, stages, resumes, and upcoming deadlines.",
    },
    {
      icon: Users2,
      title: "Campus Community & Teams",
      desc: "Find hackathon teammates, share discussions, and collaborate.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                {siteConfig.name}
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Phase 0 Initialized
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="hidden sm:inline-block">Next.js 14+ • TypeScript • Tailwind</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60 mb-6">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Baseline Architecture & Project Setup Verified</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl leading-tight sm:leading-tight">
          One platform for your college life,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500">
            learning and career.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
          {siteConfig.description}
        </p>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
          {coreModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.title}
                className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {module.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Architecture Status Badge */}
        <div className="mt-16 w-full max-w-3xl p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Phase 0 Complete: Initial Structure & Toolchain
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Next: Phase 1 (Design System & Tokens) → Phase 2 (Public Landing Page)
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Ready for Next Phase</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 bg-zinc-50/50 dark:bg-zinc-950/50 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusFlow. Built with Next.js, TypeScript & Tailwind CSS.</p>
          <p>Production Student Platform Architecture</p>
        </div>
      </footer>
    </div>
  );
}
