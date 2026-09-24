import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { validateSafeRedirect } from "@/lib/security";

const AUTH_SECRET = process.env.AUTH_SECRET || "campusflow-super-secure-dev-session-key-32chars";
const SECRET_KEY = new TextEncoder().encode(AUTH_SECRET);
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "campusflow_session";

// Helper function to append strict security headers to any outgoing response
function applySecurityHeaders(res: NextResponse): NextResponse {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' https: data:;
    connect-src 'self' https:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  res.headers.set("Content-Security-Policy", cspHeader);
  res.headers.set("X-Frame-Options", "DENY"); // Clickjacking defense
  res.headers.set("X-Content-Type-Options", "nosniff"); // MIME-sniffing prevention
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("X-DNS-Prefetch-Control", "on");

  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Path Traversal & Injection Defense
  const decodedUrl = decodeURIComponent(request.url);
  if (
    decodedUrl.includes("../") ||
    decodedUrl.includes("..\\") ||
    decodedUrl.includes("\0") ||
    decodedUrl.includes("%00") ||
    decodedUrl.includes("%2e%2e")
  ) {
    const badReqResponse = new NextResponse(
      "Bad Request: Malicious path traversal pattern detected",
      { status: 400, headers: { "Content-Type": "text/plain" } }
    );
    return applySecurityHeaders(badReqResponse);
  }

  // 2. Open Redirect Defense: Validate callbackUrl if present
  if (searchParams.has("callbackUrl")) {
    const rawCallback = searchParams.get("callbackUrl");
    const safeCallback = validateSafeRedirect(rawCallback);
    if (rawCallback !== safeCallback) {
      const sanitizedUrl = request.nextUrl.clone();
      sanitizedUrl.searchParams.set("callbackUrl", safeCallback);
      return applySecurityHeaders(NextResponse.redirect(sanitizedUrl));
    }
  }

  // 3. Client IP Extraction
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "127.0.0.1";

  // 4. Rate Limiting for Auth POST Actions
  const isAuthPost =
    request.method === "POST" &&
    (pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password");

  if (isAuthPost) {
    const rateLimit = checkRateLimit(clientIp, "AUTH");
    if (!rateLimit.success) {
      const limitResponse = NextResponse.json(
        {
          success: false,
          error: "Too many authentication requests. Please wait before retrying.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
      return applySecurityHeaders(limitResponse);
    }
  }

  // API rate limiting
  if (pathname.startsWith("/api/")) {
    const rateLimit = checkRateLimit(clientIp, "API");
    if (!rateLimit.success) {
      const limitResponse = NextResponse.json(
        {
          success: false,
          error: "API rate limit exceeded. Please throttle your requests.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit),
        }
      );
      return applySecurityHeaders(limitResponse);
    }
  }

  // 5. Session Verification
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY, {
        algorithms: ["HS256"],
      });
      session = payload;
    } catch {
      session = null;
    }
  }

  // Protected student routes: /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // Protected admin routes: /dashboard/admin
  if (pathname.startsWith("/dashboard/admin")) {
    if (!session) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }
    if (session.role !== "ADMIN" && session.role !== "MODERATOR") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
    }
  }

  // Auth pages (login/signup) redirect to dashboard if already logged in
  if ((pathname === "/login" || pathname === "/signup") && session) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
