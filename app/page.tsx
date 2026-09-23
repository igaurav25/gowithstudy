import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Code2,
  Briefcase,
  Users2,
  CheckCircle2,
  ArrowRight,
  Palette,
  SunMoon,
  Laptop,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const coreModules = [
    {
      icon: BookOpen,
      title: "Academics & Study Notes",
      desc: "Smart note taking, PDF uploads, categorization & search.",
      tag: "Academics",
    },
    {
      icon: Sparkles,
      title: "AI Study Assistant & RAG",
      desc: "Ask conceptual questions and query your own uploaded PDFs.",
      tag: "AI Powered",
    },
    {
      icon: Calendar,
      title: "Timetable & Assignments",
      desc: "Class schedules, deadline tracking, and status reminders.",
      tag: "Productivity",
    },
    {
      icon: Code2,
      title: "Placement & DSA Tracker",
      desc: "Curated topic breakdowns, difficulty filters, and revision queues.",
      tag: "Career",
    },
    {
      icon: Briefcase,
      title: "Internship & Job Pipeline",
      desc: "Track applications, stages, resumes, and upcoming deadlines.",
      tag: "Opportunities",
    },
    {
      icon: Users2,
      title: "Campus Community & Teams",
      desc: "Find hackathon teammates, share discussions, and collaborate.",
      tag: "Networking",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Phase Status Pill */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="purple" className="px-3.5 py-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phase 1 Verified: Design System & Theme Engine Active</span>
          </Badge>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl leading-tight sm:leading-tight">
          One platform for your college life,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500">
            learning and career.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {siteConfig.description}
        </p>

        {/* Action CTAs using UI Button Primitives */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <Button variant="gradient" size="lg">
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In to Account
            </Button>
          </Link>
        </div>

        {/* Design System & Theme Showcase Card */}
        <Card glass className="mt-12 w-full max-w-3xl text-left border border-zinc-200/90 dark:border-zinc-800/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle>Design System Specification</CardTitle>
              </div>
              <Badge variant="success">Light / Dark / System</Badge>
            </div>
            <CardDescription>
              Tailored tokens adhering to Section 7 & 8: High contrast, smooth transitions, glassmorphic panels, and accessible typography.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <SunMoon className="w-4 h-4 text-amber-500" />
                Adaptive Colors
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Seamless light/dark switching with persistent system preference.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Laptop className="w-4 h-4 text-indigo-500" />
                Responsive Primitives
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Mobile-first layout with accessible touch targets and focus rings.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Component Variants
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Strict TypeScript Button, Badge, Card, and Input primitives.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid using Card Primitives */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
          {coreModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.title}
                className="group hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-800 dark:text-zinc-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {module.tag}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 bg-zinc-50/50 dark:bg-zinc-950/50 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusFlow. Built with Next.js, TypeScript & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <Link href="#features" className="hover:underline">Features</Link>
            <Link href="#how-it-works" className="hover:underline">Workflow</Link>
            <Link href="#privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
