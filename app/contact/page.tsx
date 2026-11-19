import { Navbar } from "@/components/shared/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Mail, HelpCircle, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | GoWithStudy",
  description: "Get in touch with the GoWithStudy team for support, feature suggestions, or college partnerships.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            We are here to help.
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Have a question about your account, encountered a bug, or want your college or branch supported? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Email Support */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Student Support & Inquiries
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                For login issues, account deletion requests, or general feedback. We typically respond within 24 hours.
              </p>
            </div>
            <a href="mailto:support@gowithstudy.app">
              <Button variant="outline" className="w-full">
                support@gowithstudy.app
              </Button>
            </a>
          </div>

          {/* Card 2: GitHub Open Source / Issues */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Bug Reports & Feature Requests
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Found a technical issue or have ideas for attendance and timetable features? Track issues on GitHub.
              </p>
            </div>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                GitHub Repository
              </Button>
            </a>
          </div>

          {/* Card 3: Community Discussions */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Campus Community
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ask questions to fellow students, find project partners, and share lecture materials in the student forum.
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Join Student Discussion
              </Button>
            </Link>
          </div>

          {/* Card 4: FAQ */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Quick answers on PDF file size limits, RAG AI grounding, and attendance tracking policies.
              </p>
            </div>
            <Link href="/#faq">
              <Button variant="outline" className="w-full">
                Read FAQ
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
