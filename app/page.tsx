import { Navbar } from "@/components/shared/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features-grid";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingAIShowcase } from "@/components/landing/ai-showcase";
import { LandingCareerSection } from "@/components/landing/career-section";
import { LandingSecuritySection } from "@/components/landing/security-section";
import { LandingFAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* 1. Global Navigation Bar with Theme Switcher */}
      <Navbar />

      {/* 2. Hero Section with Live Mockup */}
      <LandingHero />

      {/* 3. Core Pillars Feature Showcase */}
      <LandingFeatures />

      {/* 4. 4-Step Interactive Workflow */}
      <LandingHowItWorks />

      {/* 5. AI Study Copilot & Document RAG Grounding */}
      <LandingAIShowcase />

      {/* 6. Placement & DSA Tracker + Job Application Kanban */}
      <LandingCareerSection />

      {/* 7. Security, Access Control & Privacy Guarantees */}
      <LandingSecuritySection />

      {/* 8. Frequently Asked Questions */}
      <LandingFAQSection />

      {/* 9. Comprehensive Product Footer */}
      <LandingFooter />
    </div>
  );
}
