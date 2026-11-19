export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "https://gowithstudy.vercel.app";
}

export const siteConfig = {
  name: "GoWithStudy",
  tagline: "Your All-in-One College Life, Study & Career Platform",
  description:
    "GoWithStudy is the all-in-one college student platform: AI study assistant with cited notes, smart timetable, DSA tracker, and internship Kanban.",
  url: getSiteUrl(),
  links: {
    github: "https://github.com/igaurav25/gowithstudy",
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
