export const siteConfig = {
  name: "CampusFlow",
  tagline: "One platform for your college life, learning and career.",
  description:
    "A production-style student SaaS platform combining academics, study resources, timetable, assignments, career preparation, and AI-powered learning.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
