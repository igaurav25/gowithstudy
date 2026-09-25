import { siteConfig } from "@/config/site";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${siteConfig.url}/#webapp`,
        name: siteConfig.name,
        alternateName: ["Go with Study", "GoWithStudy App", "GoWithStudy Student OS"],
        url: siteConfig.url,
        description: siteConfig.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        featureList: [
          "AI-Powered Study Assistant with Document RAG",
          "B.Tech CSE Syllabus & Full Topic Notes PDF",
          "Smart College Timetable with Live Reminders",
          "DSA Practice & Placement Tracker with Striver Sheet Integration",
          "Internship & Job Application Kanban Pipeline",
          "Student Community & Peer Doubts Forum",
        ],
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        sameAs: [siteConfig.links.github],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
