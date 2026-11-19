import { Navbar } from "@/components/shared/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Code2, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | GoWithStudy",
  description: "Built for Indian college students balancing BTech/BCA academics, 75% attendance rules, exam prep, and placement season.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Built for college students, by engineers who survived engineering.
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            GoWithStudy was created to replace chaotic WhatsApp class groups, lost Google Drive links, and stressful night-before-exam scrambles with one reliable academic workspace.
          </p>
        </div>

        <div className="space-y-12 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              The Reality of Indian College Life
            </h2>
            <p>
              Most student software is designed for Western universities with monolithic learning management systems, high-speed campus Wi-Fi, and desktop laptops in every lecture hall.
            </p>
            <p>
              The reality for over 15 million Indian undergraduate students is very different:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> 75% Attendance Pressure
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Daily tracking to prevent detention or debars, balancing morning commutes and long lab hours.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> Scattered Lecture Notes
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Massive PDFs, scanned faculty handouts, and handwritten class notes buried in chat history.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Placement & DSA Grind
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Managing online assessments, interview stages, and coding sheets alongside semester exams.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-500" /> Finding Capstone Teams
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Connecting with competent batchmates across branches for hackathons and final-year projects.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Our Core Principles
            </h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Mobile-First & Data-Light:</strong> Engineered to load fast on 3G/4G connections and function smoothly on Android smartphones with 3-4 GB RAM.
              </li>
              <li>
                <strong>Grounded AI, Zero Hallucinations:</strong> The AI Study Assistant uses Retrieval-Augmented Generation (RAG) to search your uploaded syllabus and lecture PDFs directly, always providing verifiable citations.
              </li>
              <li>
                <strong>Student Privacy First:</strong> Your notes, attendance records, and job tracker are strictly private to your authenticated account.
              </li>
            </ul>
          </section>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                Ready to organize your semester?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Join thousands of students staying ahead with GoWithStudy.
              </p>
            </div>
            <Link href="/signup">
              <Button variant="gradient" className="shrink-0">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
