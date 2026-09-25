# Security Policy — CampusFlow 🛡️

CampusFlow takes software security, student privacy, and credential safety seriously. This policy outlines how vulnerabilities should be handled and reported.

---

## 🔒 Supported Versions

Only the latest release on the primary development branch receives active security updates and patches.

| Version | Supported |
|---|---|
| `v1.x` (main) | ✅ Yes |
| `< 1.0.0` | ❌ No |

---

## 🚨 Reporting a Vulnerability

**Please do NOT file public GitHub issues for security vulnerabilities.**

If you discover a potential security flaw, please responsibly disclose it by emailing the project maintainers or creating a [Private Security Advisory](https://github.com/your-username/campusflow/security/advisories/new) on GitHub.

### When submitting a report, please include:
1. A detailed description of the vulnerability.
2. Steps to reproduce or proof-of-concept (PoC) payload.
3. Affected routes, components, or API endpoints.
4. Potential security impact (e.g., privilege escalation, unauthorized data access, XSS, SSRF).

### Response Timelines:
- **Initial Acknowledgment**: Within 24–48 hours.
- **Triage & Assessment**: Within 72 hours.
- **Fix & Patch Release**: Depending on severity, typically within 7–14 business days.

---

## 🛡️ Built-in Security Architecture in CampusFlow

CampusFlow implements multiple defense-in-depth security layers:
- **Authentication**: Salted Bcrypt (`12` work factor) password hashing; no plaintext credentials stored.
- **Session Security**: Cryptographically signed `__Host-` HTTP-only, `SameSite=Lax`, `Secure` cookies with active session tracking in PostgreSQL and remote revocation capabilities.
- **File Validation**: Strict multi-layer file upload inspection combining MIME type verification, file extension whitelisting, and **Magic Byte** binary signature checks (e.g., `%PDF-1.` verification).
- **Edge Rate Limiting**: Sliding-window rate limiting protecting public endpoints against brute-force attacks and credential stuffing.
- **Reverse Proxy Hardening**: Automated Caddy TLS with HSTS (`max-age=63072000`), X-Frame-Options (`DENY`), and X-Content-Type-Options (`nosniff`).
