import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

// Common temporary / disposable email providers to prevent abuse of free AI & student perks
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "getairmail.com",
  "yopmail.com",
  "dispostable.com",
  "trashmail.com",
  "mytemp.email",
  "throwawaymail.com",
  "mohmal.com",
  "temp-mail.org",
  "fakeinbox.com",
  "generator.email",
]);

/**
 * Normalizes an email address according to provider-specific canonicalization rules.
 * For Gmail/Googlemail:
 *  - Strips all dots ('.') in the username portion: rahul.sharma -> rahulsharma
 *  - Strips '+alias' suffixes: rahul+study -> rahul
 *  - Normalizes googlemail.com to gmail.com
 * For all domains:
 *  - Lowercases the email and trims whitespace
 */
export function canonicalizeEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  const parts = clean.split("@");
  if (parts.length !== 2) return clean;

  let [localPart, domain] = parts;

  // Normalize googlemail.com to gmail.com
  if (domain === "googlemail.com") {
    domain = "gmail.com";
  }

  // Gmail-specific deduplication
  if (domain === "gmail.com") {
    // Strip everything after '+'
    localPart = localPart.split("+")[0] || localPart;
    // Strip all '.'
    localPart = localPart.replace(/\./g, "");
  }

  return `${localPart}@${domain}`;
}

/**
 * Checks whether an email belongs to a known temporary/disposable domain.
 */
export function isDisposableEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

export interface NormalizedPhoneResult {
  isValid: boolean;
  e164: string;
  nationalNumber: string;
  countryCode: string;
  errorMessage?: string;
}

/**
 * Normalizes a phone number to strict E.164 format (e.g. +919876543210).
 * Defaults country code to 'IN' (+91) if not explicitly provided with a '+' prefix.
 */
export function canonicalizePhone(
  rawPhone: string,
  defaultCountry: "IN" = "IN"
): NormalizedPhoneResult {
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return {
      isValid: false,
      e164: "",
      nationalNumber: "",
      countryCode: "",
      errorMessage: "Phone number is required.",
    };
  }

  try {
    if (!isValidPhoneNumber(trimmed, defaultCountry)) {
      return {
        isValid: false,
        e164: "",
        nationalNumber: "",
        countryCode: "",
        errorMessage: "Please enter a valid 10-digit mobile number.",
      };
    }

    const parsed = parsePhoneNumber(trimmed, defaultCountry);
    if (!parsed) {
      return {
        isValid: false,
        e164: "",
        nationalNumber: "",
        countryCode: "",
        errorMessage: "Invalid phone number format.",
      };
    }

    return {
      isValid: true,
      e164: parsed.number, // e.g. "+919876543210"
      nationalNumber: parsed.nationalNumber, // e.g. "9876543210"
      countryCode: `+${parsed.countryCallingCode}`, // e.g. "+91"
    };
  } catch {
    return {
      isValid: false,
      e164: "",
      nationalNumber: "",
      countryCode: "",
      errorMessage: "Failed to parse phone number.",
    };
  }
}

/**
 * Masks an email for safe display in UI and non-sensitive logs.
 * Example: rahul.sharma@gmail.com -> ra***@gmail.com
 */
export function maskEmail(email: string): string {
  const clean = email.trim();
  const parts = clean.split("@");
  if (parts.length !== 2) return "***@***";

  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Masks an E.164 phone number for safe display in UI and non-sensitive logs.
 * Example: +919876543210 -> +91 98****3210
 */
export function maskPhone(e164Phone: string): string {
  const clean = e164Phone.trim().replace(/\s+/g, "");
  if (clean.length < 8) return "+91 ********";

  const prefix = clean.slice(0, 5); // "+9198" or "+91 98"
  const suffix = clean.slice(-4); // "3210"
  return `${prefix}****${suffix}`;
}
