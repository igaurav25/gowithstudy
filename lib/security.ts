/**
 * CampusFlow Security Utilities
 * Implements defenses for XSS, Open Redirects, IDOR, and File Upload integrity.
 */

/**
 * Escapes dangerous HTML characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes user input text by stripping HTML tags, scripts, and javascript: links.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    // Strip <script>...</script> tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip all HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove javascript: URI attempts
    .replace(/javascript\s*:/gi, "")
    // Remove data: URI attempts that could execute script
    .replace(/data\s*:\s*text\/html/gi, "")
    // Remove dangerous inline event handlers (onerror=, onload=, onclick=)
    .replace(/\bon\w+\s*=/gi, "")
    .trim();
}

/**
 * Validates and normalizes redirect URLs to prevent Open Redirect attacks.
 * Accepts only internal relative paths starting with a single '/' and not '//'.
 */
export function validateSafeRedirect(url: string | null | undefined, defaultUrl: string = "/dashboard"): string {
  if (!url) return defaultUrl;

  const trimmed = url.trim();

  // Reject protocol-relative URLs (e.g. "//evil.com")
  if (trimmed.startsWith("//")) {
    return defaultUrl;
  }

  // Reject URLs with schemes (e.g. "http:", "https:", "javascript:", "data:")
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultUrl;
  }

  // Must start with a single '/'
  if (!trimmed.startsWith("/")) {
    return defaultUrl;
  }

  // Reject carriage returns / line breaks (HTTP Response Splitting)
  if (/[\r\n]/.test(trimmed)) {
    return defaultUrl;
  }

  return trimmed;
}

/**
 * Sanitizes file names to prevent directory traversal and null byte injections.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return "unnamed_file";

  return fileName
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove path traversal sequences
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "_")
    // Keep only alphanumeric characters, dots, underscores, and dashes
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    // Strip leading dots, underscores, and dashes to prevent hidden files and separator artifacts
    .replace(/^[._-]+/, "")
    .trim();
}

/**
 * Validates PDF Magic Bytes: checks that the first 5 bytes are "%PDF-" (0x25, 0x50, 0x44, 0x46, 0x2D).
 */
export function validatePdfMagicBytes(buffer: Uint8Array): boolean {
  if (!buffer || buffer.length < 5) return false;

  // %PDF- in ASCII: [0x25, 0x50, 0x44, 0x46, 0x2D]
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
}

/**
 * IDOR Defense: Asserts that the authenticated user owns the resource or has administrative authority.
 */
export function assertResourceOwnership(
  resourceOwnerId: string,
  sessionUserId: string,
  userRole?: string
): void {
  if (userRole === "ADMIN") {
    return; // Admins have system-wide governance access
  }

  if (!resourceOwnerId || resourceOwnerId !== sessionUserId) {
    throw new Error("Access Denied: You do not have permission to view or modify this resource.");
  }
}
