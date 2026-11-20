# Security Policy — GoWithStudy 🛡️

GoWithStudy takes software security, student and educator privacy, and credential safety with absolute seriousness. This policy outlines our zero-trust security architecture, admission workflow safeguards, and responsible vulnerability disclosure process.

---

## 🔒 Supported Versions

Only the latest release on the primary `main` branch receives active security updates and patches.

| Version | Supported |
|---|---|
| `v1.x` (main) | ✅ Yes |
| `< 1.0.0` | ❌ No |

---

## 🚨 Reporting a Vulnerability

**Please do NOT file public GitHub issues for security vulnerabilities.**

If you discover a potential security flaw, please responsibly disclose it by emailing the project maintainers or creating a [Private Security Advisory](https://github.com/igaurav25/gowithstudy/security/advisories/new) on GitHub.

### When submitting a report, please include:
1. A detailed description of the vulnerability.
2. Step-by-step reproduction instructions or a minimal proof-of-concept (PoC).
3. Affected routes, components, API endpoints, or database models.
4. Potential security impact (e.g., privilege escalation, unauthorized admission bypass, credential exposure, XSS, SSRF).

### Response Timelines:
- **Initial Acknowledgment**: Within 24–48 hours.
- **Triage & Assessment**: Within 72 hours.
- **Fix & Patch Release**: Typically within 7–14 business days, depending on severity.

---

## 🛡️ Built-in Security Architecture in GoWithStudy

GoWithStudy implements a defense-in-depth, zero-trust security architecture across the entire stack:

### 1. Zero Self-Service Registration Barrier
- **No Self-Service Accounts**: Self-service student and teacher signups are disabled via `NEXT_PUBLIC_DISABLE_PUBLIC_SIGNUP=true`.
- **Application & Approval Pipeline**: All applicants must apply at `/apply` (Student or Faculty) and verify their email via a 6-digit OTP. Applications are recorded as `PENDING` and must be reviewed and approved by an authorized administrator before any account or password can be created.
- **Secure 48-Hour Activation Link**: Upon approval, a single-use cryptographically random 32-byte activation token is generated (`SHA-256` hashed at rest). The applicant sets their own password at `/activate?token=...`, burning the token and activating the account.

### 2. High-Assurance Password Hashing (Argon2id)
- **Primary Algorithm**: Uses `Argon2id` (RFC 9106) with memory cost 64 MB, time cost 3 iterations, and parallelism 4 threads.
- **Transparent Migration**: Legacy `bcrypt` hashes are transparently verified upon login and automatically rehashed to `Argon2id` without user disruption.

### 3. Super Admin Hardening & 2FA (RFC 6238 TOTP)
- **Independent Admin Portal**: Isolated at `/admin` and `/admin/login`, protected by `robots: { index: false, follow: false }`.
- **Single Super Admin Invariant**: Enforced at the database engine level via PostgreSQL partial unique index `idx_user_single_super_admin WHERE role = 'SUPER_ADMIN'`.
- **Mandatory TOTP 2FA**: Super administrators must authenticate via two-step login: password followed by RFC 6238 TOTP (with $\pm 1$ step drift allowance) or pre-hashed backup codes.
- **Encrypted Secrets**: TOTP shared secrets are encrypted at rest using AES-256-GCM authenticated encryption.
- **Dedicated Admin Cookie**: Issues an isolated `__Host-gws_admin` session cookie (`SameSite=Strict`, `HttpOnly`, `Secure`, `Path=/`, max duration 8 hours).

### 4. Database Concurrency & Immutability
- **Anti-Duplication Partial Indexes**:
  - `idx_application_unique_pending_email`: Prevents multiple pending applications from the same canonical email.
  - `idx_application_unique_pending_phone`: Prevents duplicate mobile applications in E.164 format.
  - `idx_application_unique_roll_number`: Guarantees roll number uniqueness per college for enrolled students.
- **Append-Only Immutable Audit Log**: A PostgreSQL engine trigger `trg_audit_log_immutable` raises an exception on any `UPDATE` or `DELETE` query targeting the `AuditLog` table, preventing audit tampering.

### 5. Multi-Layer File Validation
- Multi-layer file inspection combining MIME type whitelisting, file extension verification, and **Magic Byte** binary signature checks (e.g. verifying `%PDF-1.` magic header before reading or ingesting PDFs).

### 6. Edge Rate Limiting & Proxy Protection
- Distributed Redis sliding-window rate limiting protecting public endpoints against brute-force attacks, OTP flooding, and credential stuffing.
- Reverse proxy hardening with automated TLS, HSTS (`max-age=63072000`), `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.
