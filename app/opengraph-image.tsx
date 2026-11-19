import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GoWithStudy — Your All-in-One College Life, Study & Career Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)",
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#fafafa",
        }}
      >
        {/* Top Header Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              color: "#ffffff",
              boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
            }}
          >
            🎓
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            GoWithStudy
          </span>
          <div
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(129, 140, 248, 0.3)",
              color: "#a5b4fc",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Engineered for B.Tech & Higher Ed
          </div>
        </div>

        {/* Center Main Punchline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "980px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: 0,
              color: "#ffffff",
            }}
          >
            Everything you need for college, learning & your career —{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              in one place.
            </span>
          </h1>
          <p
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            AI Study Copilot with cited notes • Smart Timetable • DSA Placement Tracker • Internship Kanban
          </p>
        </div>

        {/* Bottom Feature Badges Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#e4e4e7" }}>
              <span style={{ color: "#10b981" }}>✓</span> Grounded Document RAG
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#e4e4e7" }}>
              <span style={{ color: "#6366f1" }}>✓</span> 155+ Striver DSA Roadmap
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#e4e4e7" }}>
              <span style={{ color: "#8b5cf6" }}>✓</span> Multilingual Hinglish AI Tutor
            </div>
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#818cf8",
              fontFamily: "monospace",
            }}
          >
            gowithstudy.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
