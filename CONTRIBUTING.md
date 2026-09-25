# Contributing to CampusFlow 🎓

Thank you for your interest in contributing to **CampusFlow**! We welcome contributions from developers, designers, and students of all experience levels.

Please take a moment to review this document to ensure a smooth collaboration process.

---

## 🛠️ Development Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x+`
- **PostgreSQL**: `v15+` or `v16+` (or Docker Desktop)
- **Git**: `v2.40+`

---

## 🚀 Local Development Setup

1. **Fork & Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/campusflow.git
   cd campusflow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` to point to your local PostgreSQL instance.*

4. **Initialize Database Schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Standards

Before submitting changes, ensure your branch passes all checks:

```bash
# 1. Strict TypeScript type check
npx tsc --noEmit

# 2. Run automated Vitest test suite
npm test

# 3. Next.js production build verification
npm run build
```

---

## 🌿 Branching & Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or capability (e.g., `feat(community): add bookmarking to posts`)
- `fix:` A bug fix (e.g., `fix(auth): resolve session expiration edge case`)
- `docs:` Documentation improvements (e.g., `docs: update DEVOPS.md runbook`)
- `test:` Adding or updating test cases (e.g., `test(dsa): add unit test for status filter`)
- `refactor:` Code refactoring without behavioral changes
- `chore:` Dependency updates, tooling, and build configs

### Branch Naming:
- `feat/feature-name`
- `fix/issue-description`
- `docs/doc-update`

---

## 📋 Pull Request Checklist

When opening a Pull Request (PR), please verify:
- [ ] Code strictly adheres to TypeScript and Tailwind CSS conventions.
- [ ] No hardcoded secrets, test credentials, or personal API keys are committed.
- [ ] All 109+ tests in `npm test` pass with 0 regressions.
- [ ] `npx tsc --noEmit` completes with 0 type errors.
- [ ] PR includes clear descriptions of the problem solved and changes made.
- [ ] Responsive design works across mobile, tablet, and desktop viewports.
