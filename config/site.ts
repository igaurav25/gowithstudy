export const siteConfig = {
  name: "GoWithStudy",
  tagline: "Your All-in-One College Life, Study & Career Platform",
  description:
    "GoWithStudy is a unified student operating system and academic SaaS platform combining academics, syllabus curriculum, verified study notes, timetable, AI study copilot, DSA practice tracker, internship pipeline, and student community.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://gowithstudy.vercel.app",
  links: {
    github: "https://github.com",
  },
  nav: [
    { title: "Features", href: "#features" },
    { title: "How It Works", href: "#how-it-works" },
    { title: "AI Assistant", href: "#ai-assistant" },
    { title: "Career", href: "#career" },
    { title: "FAQ", href: "#faq" },
  ],
};

export type SiteConfig = typeof siteConfig;
