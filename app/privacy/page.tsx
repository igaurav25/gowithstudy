import { Navbar } from "@/components/shared/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GoWithStudy",
  description: "Learn how GoWithStudy collects, uses, and protects student data, lecture notes, and study records.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Legal & Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: November 2026 • Effective immediately for all users.
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">1. Introduction</h2>
            <p>
              Welcome to <strong>GoWithStudy</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to protecting the privacy and personal academic records of university students who use our platform. This Privacy Policy outlines our transparent practices regarding data collection, usage, and protection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, student email address, hashed passwords, university/college, branch, semester, and academic year.
              </li>
              <li>
                <strong>Academic & Study Data:</strong> Lecture notes and documents you upload (PDFs), timetable schedules, assignment deadlines, and personal attendance tracking metrics.
              </li>
              <li>
                <strong>Career Tracking Records:</strong> DSA topic completion status, solved problem logs, and job or internship application stages saved in your personal tracker.
              </li>
              <li>
                <strong>Technical Information:</strong> Device type, browser user-agent, session identifiers, and error diagnostics for troubleshooting.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">3. How We Use Your Information</h2>
            <p>We use your data strictly to deliver and improve platform services, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Powering the AI Study Assistant to ground answers in your uploaded course materials using retrieval-augmented generation.</li>
              <li>Synchronizing your timetable, exam reminders, and academic schedules across your devices.</li>
              <li>Maintaining secure, persistent session authentication via encrypted cookies.</li>
              <li>Displaying verified campus announcements and notices relevant to your registered department.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">4. Data Isolation & Security</h2>
            <p>
              Your academic files, notes, and career tracking pipelines are strictly private. All queries and document lookups enforce strict server-side role and user ID authorization checks. Your uploaded course notes are never shared with or exposed to other students unless you explicitly post them to the public community repository.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">5. AI Model Processing</h2>
            <p>
              When you submit questions to the AI Study Assistant, relevant text extracts from your documents are passed to our language model provider (Google Gemini API) solely to generate your study response. We do not sell your academic data or use your personal study notes to train public third-party foundational models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">6. Data Retention & Deletion</h2>
            <p>
              You maintain full ownership of your data. You may delete individual notes, timetable entries, or request full account and data erasure at any time by contacting our support team or navigating to your profile settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">7. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or your data, please reach out to us at{" "}
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
