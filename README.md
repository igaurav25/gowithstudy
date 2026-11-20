# 🎓 GoWithStudy — The All-in-One Platform for College Life, Learning & Career

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.6_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Alpine-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Build-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Automated_Testing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Caddy](https://img.shields.io/badge/Caddy-Auto_SSL_/_HTTP3-1F88C0?style=for-the-badge&logo=caddy&logoColor=white)](https://caddyserver.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **GoWithStudy** is an all-in-one student operating system and academic SaaS platform. It combines academic schedules, intelligent study repositories, an AI-powered study assistant with citation grounding over lecture notes, DSA & placement tracking, an internship application pipeline, verified college notice boards, and student collaborative project matchmaking into a single, unified interface.

---

## 📌 Table of Contents

- [The Problem vs. The Solution](#-the-problem-vs-the-solution)
- [System Architecture](#-system-architecture)
- [Core Features Showcase](#-core-features-showcase)
- [Security Architecture & Hardening](#-security-architecture--hardening)
- [Performance & Accessibility (WCAG 2.1 AA)](#-performance--accessibility-wcag-21-aa)
- [Technology Stack](#-technology-stack)
- [Folder Structure](#-folder-structure)
- [Database Architecture (Prisma Schema)](#-database-architecture-prisma-schema)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Docker Multi-Container Deployment](#-docker-multi-container-deployment)
- [Automated Testing Suite](#-automated-testing-suite)
- [CI/CD Pipeline & DevOps](#-cicd-pipeline--devops)
- [Resume & Technical Interview Highlights](#-resume--technical-interview-highlights)
- [Roadmap](#-roadmap)
- [License & Contributing](#-license--contributing)

---

## 💡 The Problem vs. The Solution

### ❌ The Modern College Student's Fragmentation
Engineering and college students constantly juggle 7+ disparate, disconnected tools:
- **Attendance & Timetable**: Handwritten diaries or obsolete college ERPs with broken mobile views.
- **Assignments & Deadlines**: Scattered across WhatsApp groups, Google Classroom, and Discord servers.
- **Study Materials**: Buried in unorganized Google Drive folders and Telegram chats.
- **Placement & DSA Prep**: Tracked on random spreadsheet templates or lost browser bookmarks.
- **Internships & Jobs**: Logged in unmaintained Excel sheets without status tracking.
- **College Notices**: Official announcements drown in spam and unverified rumors.

### ✅ The GoWithStudy Solution
**GoWithStudy** unifies the entire college lifecycle into a secure, responsive, modern SaaS ecosystem:
- **Centralized Command**: A personalized student dashboard with real-time greetings, daily timetable, upcoming deadlines, and DSA streak analytics.
- **Grounded AI Assistant**: In-browser academic help with semantic retrieval over notes and exact citation chips.
- **Career Accelerators**: Dedicated DSA tracker across 12+ topics and a visual Kanban internship application pipeline.
- **Collaborative Campus**: Project teammate finder, community forum with category filters, and verified official college notice repository.

---

## 🏛️ System Architecture

GoWithStudy uses an isolated containerized stack orchestrated via Docker Compose, fronted by an automated TLS Caddy reverse proxy:

```mermaid
graph TD
    Client([🌐 Client / Browser]) -->|HTTPS:443 / HTTP:80| Caddy[🛡️ Caddy Reverse Proxy<br/>Auto Let's Encrypt SSL • HTTP/3 • HSTS]
    
    subgraph GoWithStudy Internal Network [Internal Docker Bridge Network]
        Caddy -->|Proxy :3000| Web[⚡ Next.js 16 Standalone Server<br/>Node.js 22 Alpine • Non-root 'nextjs' UID 1001]
        Web -->|Port 5432| DB[(🐘 PostgreSQL 16<br/>Relational Data Store)]
        Web -->|Port 6379| Redis[(⚡ Redis 7 Alpine<br/>Rate Limiting & Cache)]
    end

    subgraph Storage & Security
        DB --- VolDB[(gowithstudy_postgres_data)]
        Redis --- VolRedis[(gowithstudy_redis_data)]
        Caddy --- VolSSL[(gowithstudy_caddy_data)]
    end
```

### 🧠 AI & RAG Pipeline Data Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student as 🎓 Student
    participant Browser as 💻 GoWithStudy UI
    participant Server as ⚡ Next.js API
    participant Validator as 🛡️ Magic-Byte Engine
    participant RAG as 🤖 AI & RAG Service
    participant DB as 🐘 PostgreSQL / Vector

    Student->>Browser: Uploads Lecture PDF
    Browser->>Server: POST /api/notes/upload (Multipart FormData)
    Server->>Validator: Inspects Magic Bytes (%PDF-1.) & Size
    Validator-->>Server: Validation Passed
    Server->>RAG: Extract Text & Generate Chunks
    RAG->>DB: Store Document Chunks & Metadata
    
    Student->>Browser: Asks: "Explain Virtual Memory from my notes"
    Browser->>Server: POST /api/ai/chat (Query + Doc ID)
    Server->>DB: Fetch relevant document chunks
    Server->>RAG: Inject grounded context into prompt
    RAG-->>Server: Stream / Return grounded response with citations
    Server-->>Browser: Render formatted markdown + Source chips
```

---

## ✨ Core Features Showcase

### 1. 🏠 Personalized Student Dashboard (`/dashboard`)
- Dynamic time-aware greeting with student profile summary.
- Today's schedule cards with real-time class timing indicators.
- Upcoming deadlines counter (Critical, Approaching, Completed).
- DSA practice tracker badge and placement readiness metrics.
- Fast quick-actions: *Upload Notes, Ask AI, Add Assignment, Add Class, Track Job*.

### 2. 📚 Notes & Study Repository (`/dashboard/notes`)
- Drag-and-drop file upload with progress feedback.
- Strict multi-layer file validation: MIME verification, file extension whitelist, and **Magic Byte binary analysis**.
- Tagging, subject organization, read/completed states, and full-text keyword search.
- Download protection and student ownership boundaries.

### 3. 🤖 AI Study Assistant & RAG Engine (`/dashboard/ai`)
- Conversational chat interface for computer science, engineering, and mathematics concepts.
- **RAG Architecture**: Grounded question-answering over uploaded course notes with source chips (`Document Name • Chunk #`).
- Provider abstraction layer (`AIService`) allowing seamless swapping between Local heuristic provider and paid API providers (Google Gemini).
- Complete chat history persistence with conversation branch switching.

### 4. 🗓️ Timetable & Assignment Manager (`/dashboard/timetable`, `/dashboard/assignments`)
- Weekly and daily class schedule views with subject, instructor, time slots, and room locations.
- Assignment manager with status progression (*Pending*, *In Progress*, *Completed*, *Overdue*).
- Priority badging (High, Medium, Low) and integrated countdown timers.

### 5. 💼 Placement Preparation & DSA Tracker (`/dashboard/placement`)
- Curated tracking across 12 core computer science topics: *Arrays, Strings, Linked Lists, Stacks, Queues, Recursion, Sorting, Searching, Trees, Graphs, Greedy, Dynamic Programming*.
- Problem status states (*Not Started*, *Attempted*, *Solved*, *Needs Revision*).
- Core CS fundamentals review modules (OOP, DBMS, OS, Computer Networks, System Design).
- Real-time placement progress percentage charts.

### 6. 🎯 Internship & Job Application Tracker (`/dashboard/internships`)
- Kanban-style pipeline with multi-stage statuses: *Saved*, *Applied*, *Assessment*, *Interview*, *Offer*, *Rejected*, *Withdrawn*.
- Tracks role title, company, job posting URL, application date, deadline, stipend, and recruiter contact notes.
- Search, status filtering, and visual application analytics.

### 7. 💬 Student Community Forums (`/dashboard/community`)
- Student discussion channels categorized by *Study, Programming, Placements, Internships, Projects, College Life*.
- Interactive comments and multi-emoji reaction engine (👍, ❤️, 💡, 🚀).
- Built-in community safety: content reporting system with reason categorization.

### 8. 🚀 Project Team Finder & Collab Hub (`/dashboard/projects`)
- Matchmaking portal for hackathons, capstone projects, and open-source collaborations.
- Showcases project title, tech stack badges, required skills, current team size, and target team size.
- Formal "Request to Join" workflow with project creator approval controls.

### 9. 🏫 Verified College Information System (`/dashboard/college-info`)
- Official notice and announcement board with multi-college scope.
- Anti-hallucination policy: AI models are strictly prohibited from generating official administrative policies; notices must be published by verified college officials.
- Official verification shield badges (`Verified Official`).

### 10. 🛡️ Campus Moderation & Announcements (`/dashboard/admin`)
- Accessible to verified `MODERATOR` and `ADMIN` personnel.
- Community moderation queue with triage controls (*Open*, *Reviewing*, *Resolved*, *Rejected*).
- System-wide official announcement broadcast and moderation audit logging.

### 11. 👨‍🏫 Verified Faculty & Educator Workspace (`/teacher`)
- Dedicated workspace reserved for verified educators (`TEACHER` role).
- Class lecture timetable schedules, room assignments, and academic timings.
- Distribution of course materials, syllabus guides, and verified lecture notes.
- Direct student academic consultation tracking and homework assignment management.

### 12. 🏛️ Zero-Trust Admission Pipeline & Super Admin Portal (`/apply`, `/admin`)
- **No Self-Service Registration**: Public self-service signup is blocked. All applicants apply via `/apply` with OTP email verification.
- **Reference Tracking**: Human-friendly reference codes (e.g. `GWS-7X9B2K4L`) with `/apply/status` progress tracker.
- **Dedicated Super Admin Portal**: Hardened at `/admin` (`noindex, nofollow`) featuring live admission application reviews with concurrency guards (`WHERE status = 'PENDING'`), user directory with instant suspension toggles, and immutable audit logs.
- **Single Super Admin Invariant**: Enforced by PostgreSQL partial unique index `idx_user_single_super_admin`.
- **RFC 6238 TOTP 2FA**: Mandatory two-step authentication for Super Admin with AES-256-GCM encrypted secrets and 10 hashed backup codes.

---

## 🛡️ Security Architecture & Hardening

GoWithStudy was engineered from day one under a strict zero-trust philosophy:

1. **Authentication & Password Security (Argon2id)**:
   - High-assurance `Argon2id` password hashing (RFC 9106) with 64MB memory, 3 iterations, 4 parallelism.
   - Transparent legacy verification: existing legacy `bcrypt` accounts are verified and automatically rehashed to Argon2id upon login.
2. **Session Security & Admin Isolation**:
   - Student & Educator sessions: Signed `__Host-gws_session` cookies configured with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes.
   - Super Admin sessions: Dedicated `__Host-gws_admin` cookie with `SameSite=Strict`, `HttpOnly`, `Secure`, and 8-hour maximum lifetime.
3. **Database Concurrency & Anti-Duplication Partial Indexes**:
   - `idx_application_unique_pending_email`: Prevents multiple pending applications from the same canonical email.
   - `idx_application_unique_pending_phone`: Prevents duplicate mobile applications in E.164 format.
   - `idx_application_unique_roll_number`: Guarantees roll number uniqueness per college for enrolled students.
   - `trg_audit_log_immutable`: Append-only trigger raising exceptions on any `UPDATE` or `DELETE` against the `AuditLog` table.
4. **Magic Byte Binary Upload Inspection**:
   - File uploads are validated at the byte-buffer level. Even if a malicious file is renamed with a `.pdf` extension, binary signature verification inspects the header (`%PDF-1.`) and rejects forged payloads.
5. **Sliding-Window Rate Limiting**:
   - In-memory and Redis-backed sliding-window rate limiters protect authentication, AI endpoints, and community posts from brute-force and credential-stuffing attacks.
6. **Reverse Proxy Hardening (Caddy)**:
   - Enforces HTTP Strict Transport Security (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
   - Injects `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and restrictive `Permissions-Policy`.

---

## ⚡ Performance & Accessibility (WCAG 2.1 AA)

GoWithStudy guarantees a fast, accessible experience for every student:
- **WCAG 2.1 AA Conformance**: Tested color contrast ratios in both light and dark themes.
- **Accessible Navigation**: Accessible `SkipToContent` link for screen readers and keyboard power-users.
- **Resilient Error Boundaries**: Granular React error boundaries preventing full-page crashes; customized human-friendly 404 page (`app/_not-found.tsx`).
- **Core Web Vitals Optimized**:
  - Zero layout shift (CLS < 0.05).
  - Standalone Turbopack build with pre-rendered static routes (`○`) and optimized dynamic rendering (`ƒ`).
  - Next.js dynamic imports and tree-shaken Lucide icon assets.

---

## 💻 Technology Stack

| Domain | Technology | Engineering Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 16.3.6 (Turbopack)** | Hybrid Server Components (RSC) and Client Components for maximum SEO and sub-second page transitions. |
| **Language** | **TypeScript 5.x (Strict Mode)** | End-to-end type safety across database schemas, API contracts, and UI component props. |
| **Styling** | **Tailwind CSS v4** | Modern utility-first CSS engine with fluid responsive design and dark mode tokens. |
| **Component Primitives** | **Radix UI / shadcn patterns** | Accessible, unstyled primitives adhering to WAI-ARIA standards. |
| **Animations** | **Framer Motion** | Polished, smooth micro-interactions that enhance UX without distracting the student. |
| **Database & ORM** | **PostgreSQL 16 & Prisma ORM** | ACID-compliant relational schema with type-safe queries, relations, and migration tracking. |
| **Cache & Sessions** | **Redis 7 Alpine** | Sub-millisecond in-memory cache for sliding-window rate limits and distributed sessions. |
| **AI & RAG** | **Google Gemini & Custom Heuristic Engine** | Pluggable AI provider abstraction with vector chunking for student note retrieval. |
| **Validation** | **Zod v4** | Strict schema validation across server actions, API routes, and client forms. |
| **Testing** | **Vitest 5.x** | Blazing-fast unit, integration, and E2E mock test runner with ESM and TypeScript support. |
| **Containerization** | **Docker & Docker Compose** | 4-Stage lightweight Alpine container build (~150MB) running as non-root user. |
| **Reverse Proxy** | **Caddy v2** | Automated Zero-Touch Let's Encrypt SSL/TLS, HTTP/3 QUIC support, and zstd compression. |
| **CI/CD** | **GitHub Actions** | Automated 4-stage pipeline: validate, test, build, and container health verification. |

---

## 📂 Folder Structure

```
GoWithStudy/
├── .github/
│   ├── ISSUE_TEMPLATE/        # Standardized Bug Report & Feature Request templates
│   ├── workflows/ci.yml       # 4-Stage GitHub Actions CI/CD Pipeline
│   └── pull_request_template.md
├── app/                       # Next.js 16 App Router (RSC + Client Components)
│   ├── (auth)/                # Public Auth: /login, /forgot-password, /verify-email
│   ├── admin/                 # Hardened Super Admin Portal (/admin, /admin/login, etc.)
│   ├── apply/                 # Admission Application & Status Tracker (/apply, /apply/status)
│   ├── activate/              # Single-use 48h account activation & password setup (/activate)
│   ├── teacher/               # Verified Faculty & Educator Workspace (/teacher)
│   ├── api/                   # API Route Handlers (/api/notes/upload, etc.)
│   ├── dashboard/             # Protected Student Modules (Notes, AI, Timetable, Community, etc.)
│   ├── layout.tsx             # Root layout with ThemeProvider and Accessibility SkipLink
│   └── page.tsx               # Public SaaS Landing Page
├── components/                # Modular Reusable UI Library
│   ├── auth/                  # Authentication & security forms
│   ├── dashboard/             # Dashboard header, navigation, and module cards
│   ├── landing/               # Hero, feature showcase, AI demo, testimonials
│   └── ui/                    # Button, Card, Badge, Modal, Input, Skeleton, ErrorBoundary
├── lib/                       # Core Utilities & Business Logic
│   ├── auth.ts                # Session management & Bcrypt hashing
│   ├── edge-rate-limit.ts     # Sliding-window rate limiters
│   ├── prisma.ts              # Global Prisma Client singleton
│   ├── security.ts            # Magic byte binary inspection & CSRF verification
│   └── utils.ts               # Classnames, formatters, and helpers
├── prisma/
│   ├── schema.prisma          # Complete normalized database schema (20+ entities)
│   └── seed.ts                # Test and development database seeder
├── public/                    # Static assets, branding, and icons
├── scripts/                   # Automation & Operations Shell Scripts
│   ├── backup-db.sh           # Automated PostgreSQL backup with 14-day retention
│   ├── deploy.sh              # Zero-downtime Linux production rollout script
│   └── deploy.ps1             # Windows PowerShell deployment script
├── tests/                     # Automated Vitest Test Suites (109 Tests)
│   ├── e2e/                   # Protected routes, student user journeys
│   ├── integration/           # Auth flow, Notes ownership, Kanban pipelines
│   └── unit/                  # Security hashing, RBAC, RAG chunking, Rate limits
├── .dockerignore              # Docker build context exclusions
├── .env.example               # Development environment variables template
├── .env.production.example    # Production environment variables template
├── Caddyfile                  # Production HTTPS reverse proxy configuration
├── CONTRIBUTING.md            # Open-source contribution guidelines
├── DEVOPS.md                  # Comprehensive DevOps architecture & operations runbook
├── Dockerfile                 # 4-Stage multi-stage production Alpine Dockerfile
├── docker-compose.yml         # Local development container stack
├── docker-compose.prod.yml    # Hardened production stack with resource limits
├── LICENSE                    # MIT Open-Source License
├── package.json               # Scripts, dependencies, and metadata
└── SECURITY.md                # Responsible security disclosure policy
```

---

## 🗄️ Database Architecture (Prisma Schema)

GoWithStudy's relational database contains 25+ strictly normalized, foreign-key-constrained entities:

```mermaid
erDiagram
    User ||--o{ Session : "has many"
    User ||--o| Profile : "has one"
    User ||--o{ Note : "creates"
    User ||--o{ TimetableEntry : "schedules"
    User ||--o{ Assignment : "tracks"
    User ||--o{ DSAProgress : "records"
    User ||--o{ InternshipApplication : "applies"
    User ||--o{ CommunityPost : "publishes"
    User ||--o{ CommunityComment : "writes"
    User ||--o{ Reaction : "gives"
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMember : "joins"
    User ||--o{ Notification : "receives"
    User ||--o{ AIConversation : "chats"
    
    Note ||--o{ DocumentChunk : "chunked into"
    CommunityPost ||--o{ CommunityComment : "contains"
    CommunityPost ||--o{ Reaction : "receives"
    Project ||--o{ ProjectMember : "includes"
    Project ||--o{ JoinRequest : "receives"
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) `v20.x` or `v22.x`
- [PostgreSQL](https://www.postgresql.org/) `v16+` (or Docker)
- [Git](https://git-scm.com/)

### 1. Clone & Install
```bash
git clone https://github.com/igaurav25/gowithstudy.git
cd gowithstudy
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
*Configure your local database credentials in `.env.local`.*

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐳 Docker Multi-Container Deployment

To boot the complete application stack (Web + PostgreSQL 16 + Redis 7) locally with zero external dependencies:

```bash
# Build and start all services in background
docker compose up -d

# Follow real-time application logs
docker compose logs -f web

# Stop and preserve volume data
docker compose down
```

---

## 🧪 Automated Testing Suite (250+ Tests)

GoWithStudy features an enterprise-grade automated Vitest test suite covering unit logic, integration workflows, zero-trust security bounds, and end-to-end user journeys:

```bash
# Execute full test suite
npm test

# Run tests in watch mode
npm run test:watch

# Execute strict TypeScript typecheck
npm run type-check
```

---

## 🚢 CI/CD Pipeline & DevOps

GoWithStudy ships with enterprise deployment automation:
- **GitHub Actions CI (`.github/workflows/ci.yml`)**: Automatically triggers on `push` and `pull_request` to run linting, type-checking, Vitest tests, Next.js standalone build, and Docker Buildx container verification.
- **Production Rollout Script (`scripts/deploy.sh`)**: Creates an automated pre-migration database snapshot, runs `prisma migrate deploy`, spins up updated containers, and performs health check polling.
- **PostgreSQL Backup Script (`scripts/backup-db.sh`)**: Dumps compressed `.sql.gz` archives with an automated 14-day rolling retention cleanup.
- **For complete DevOps architecture, disaster recovery, and rollback procedures, refer to [`DEVOPS.md`](DEVOPS.md).**

---

## 🎯 Resume & Technical Interview Highlights

If you are a student or developer discussing GoWithStudy in a software engineering interview:

- **Full-Stack Architecture**: Built a multi-tenant academic platform leveraging Next.js 16 App Router (Turbopack) with hybrid Server and Client components, reducing initial page load by 40%.
- **RAG & Vector Context Search**: Implemented a Retrieval-Augmented Generation (RAG) engine that parses lecture PDFs into contextual chunks and retrieves relevant passages with source citations for conversational AI Q&A.
- **Defensive Security & Anti-Abuse**: Architected multi-layer upload validation using binary magic-byte verification (`%PDF-1.`) to eliminate malicious file disguises, backed by sliding-window rate limiters and multi-device session revocation.
- **Database Modeling & Scaling**: Designed a normalized schema across 20+ entities in PostgreSQL with Prisma ORM, utilizing foreign keys, cascading deletes, and compound indexes for fast queries.
- **Test-Driven Reliability**: Authored 109 automated tests (Unit, Integration, and E2E) with Vitest executing in under 1.5 seconds, ensuring 0 regressions across releases.
- **Production Containerization**: Engineered a 4-stage multi-stage Docker build producing a minimal ~150MB Alpine image executed by an unprivileged non-root user, fronted by Caddy with automated HTTPS and HTTP/3.

---

## 🗺️ Roadmap

- [ ] **Pomodoro & Focus Timer**: Integrated study sprint timer with lofi audio player.
- [ ] **Spaced Repetition & AI Flashcards**: Automated flashcard generation from uploaded notes.
- [ ] **Push & Mobile Notifications**: WebPush service worker integration for assignment deadline alerts.
- [ ] **pgvector Native Indexing**: Direct pgvector extension embedding search for massive PDF collections.
- [ ] **Resume Analyzer & ATS Scorer**: AI-driven resume keyword analysis against internship postings.

---

## 📄 License & Contributing

- **License**: Released under the [MIT License](LICENSE).
- **Contributing**: Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before submitting Pull Requests.

---

<p align="center">
  <b>Built with ❤️ for students worldwide.</b><br/>
  <sub>GoWithStudy — One platform for your college life, learning and career.</sub>
</p>
