import { Navbar } from "@/components/shared/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | GoWithStudy",
  description: "Terms and conditions governing the use of the GoWithStudy academic companion platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Terms & Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: November 2026 • Please read carefully before using GoWithStudy.
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">1. Agreement to Terms</h2>
            <p>
              By accessing or using <strong>GoWithStudy</strong> (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">2. Description of Service</h2>
            <p>
              GoWithStudy is an all-in-one productivity, note-taking, AI-assisted study, timetable organization, and career tracking platform designed for university and college students. The service provides document reading, schedule reminders, community discussion forums, and job application tracking tools.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">3. User Accounts and Security</h2>
            <p>
              When creating an account, you agree to provide true, accurate, and current information. You are responsible for safeguarding your login credentials and for all activities that occur under your account. Notify us immediately if you suspect unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">4. Academic Integrity & Acceptable Use</h2>
            <p>
              GoWithStudy is designed to support honest academic learning. You agree NOT to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the AI Assistant to commit academic dishonesty or cheat during proctored examinations.</li>
              <li>Upload malicious files, virus payloads, or documents that infringe on intellectual property or copyright laws.</li>
              <li>Attempt to scrape, reverse-engineer, exploit rate limits, or disrupt platform infrastructure and databases.</li>
              <li>Harass, abuse, or post defamatory content in peer community discussion boards or team listings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">5. Fair Usage & AI Limits</h2>
            <p>
              To maintain reliable and high-speed availability for all students on mobile and shared networks, free accounts are subject to fair usage policies, including daily limits on AI generation requests and file upload sizes (up to 25MB per document).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that repeatedly violate these Terms of Service, engage in automated abuse, or compromise system security for other students.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">7. Questions & Contact</h2>
            <p>
              For inquiries regarding these Terms of Service, please contact{" "}
              <a href="mailto:support@gowithstudy.app" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                support@gowithstudy.app
              </a>.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
