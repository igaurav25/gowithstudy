import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { createSessionToken } from "@/lib/auth";

describe("E2E: Edge Proxy, Route Protection & Security Headers", () => {
  it("Step 1: Should redirect unauthenticated visitor from /dashboard to /login with callbackUrl", async () => {
    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("callbackUrl=%2Fdashboard");
  });

  it("Step 2: Should permit authenticated student session to access /dashboard", async () => {
    const sessionToken = await createSessionToken({
      userId: "usr_student_01",
      email: "student@campusflow.edu",
      name: "Aarav Sharma",
      role: "USER",
      sessionId: "ses_student_test",
    });

    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: `campusflow_session=${sessionToken}`,
      },
    });

    const response = await proxy(request);
    // Not redirected to /login
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("Step 3: Should forbid regular student (USER role) from accessing /dashboard/admin and redirect to /dashboard", async () => {
    const studentToken = await createSessionToken({
      userId: "usr_student_01",
      email: "student@campusflow.edu",
      name: "Aarav Sharma",
      role: "USER",
      sessionId: "ses_student_test",
    });

    const request = new NextRequest("http://localhost:3000/dashboard/admin", {
      headers: {
        cookie: `campusflow_session=${studentToken}`,
      },
    });

    const response = await proxy(request);
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/dashboard");
    expect(location).not.toContain("/dashboard/admin");
  });

  it("Step 4: Should permit ADMIN user session to access /dashboard/admin", async () => {
    const adminToken = await createSessionToken({
      userId: "usr_admin_01",
      email: "admin@campusflow.edu",
      name: "Dr. Admin",
      role: "ADMIN",
      sessionId: "ses_admin_test",
    });

    const request = new NextRequest("http://localhost:3000/dashboard/admin", {
      headers: {
        cookie: `campusflow_session=${adminToken}`,
      },
    });

    const response = await proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("Step 5: Should block path traversal attacks with 400 Bad Request", async () => {
    const maliciousRequest = new NextRequest(
      "http://localhost:3000/api/download?file=..%2F..%2Fetc%2Fpasswd"
    );

    const response = await proxy(maliciousRequest);
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Malicious path traversal pattern detected");
  });

  it("Step 6: Should neutralize open redirect attacks in callbackUrl parameter", async () => {
    const openRedirectReq = new NextRequest(
      "http://localhost:3000/login?callbackUrl=//evil.com/steal"
    );

    const response = await proxy(openRedirectReq);
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("callbackUrl=%2Fdashboard");
    expect(location).not.toContain("evil.com");
  });

  it("Step 7: Should enforce strict security headers on all responses", async () => {
    const request = new NextRequest("http://localhost:3000/");
    const response = await proxy(request);

    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=63072000");
  });
});
