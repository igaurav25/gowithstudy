import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const lastModified = new Date();

  const routes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/signup", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/forgot-password", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/dashboard", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/dashboard/notes", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/dashboard/syllabus", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/dashboard/timetable", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/dashboard/assignments", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/dashboard/ai", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/dashboard/placement", changeFrequency: "daily" as const, priority: 0.85 },
    { path: "/dashboard/internships", changeFrequency: "daily" as const, priority: 0.85 },
    { path: "/dashboard/community", changeFrequency: "hourly" as const, priority: 0.8 },
    { path: "/dashboard/projects", changeFrequency: "weekly" as const, priority: 0.75 },
    { path: "/dashboard/college-info", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
