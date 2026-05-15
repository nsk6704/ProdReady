# ProdReady

A production readiness checker for side projects. Paste any public GitHub repo and get a health report across 14 checks — README, CI/CD, Docker, error handling, tests, security basics, and more.

## How It Works

1. Enter a GitHub repo URL
2. ProdReady clones metadata and scans files via the GitHub API
3. Each rule runs in parallel and returns a finding or passes
4. A score (0–100) is calculated with critical (-15), recommended (-8), and nice-to-have (-3) impacts
5. You can dismiss findings with context-aware options that partially restore score
6. Share the report link — stored for 24 hours, no code saved

## Features

- **14 scanner rules** covering deployment readiness, security, and best practices
- **Score gauge** with animated SVG ring and count-up number
- **Dismiss options** — tell us why something isn't relevant and the score adjusts
- **Score celebration** — framer-motion particle burst and spring animation on improvement
- **Staggered entrances** — landing page and checklist items fade in with cascade timing
- **Interactive report** — rescan, share, dismiss, badges update in real time
- **Caching** — same repo scanned within an hour returns cached result (with rescan option)
- **Privacy** — reports stored 24h, metadata only, no code saved
- **Dark mode** via next-themes
- **Universal** — works with any tech stack (rules gracefully skip when not applicable)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS v4 + shadcn/ui |
| Animations | framer-motion + CSS keyframes |
| Database | PostgreSQL via Prisma ORM |
| Font | Space Grotesk via next/font |
| Icons | lucide-react |
| Validation | zod |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon free tier)
- GitHub personal access token (with `public_repo` scope) — optional but recommended to avoid rate limits

### Setup

```bash
git clone <repo>
cd prodready
npm install
npx prisma db push
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://...
GITHUB_TOKEN=ghp_...   # optional
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Generate Prisma client |

## Scanner Rules

| Rule | Category | Severity | What it checks |
|------|----------|----------|---------------|
| has-env-example | universal | nice-to-have | `.env.example` or `.env.sample` exists |
| has-readme | universal | recommended | README with content (50+ chars) |
| has-cicd | universal | recommended | CI/CD config (GitHub Actions, CircleCI, GitLab CI, Jenkins) |
| has-tests | universal | recommended | Test files, test directory, or test framework in deps |
| has-validation | universal | recommended | Input validation library in stack |
| has-dockerfile | universal | recommended | Dockerfile or docker-compose |
| has-strict-ts | typescript | recommended | `strict: true` in tsconfig.json |
| has-retry-handling | universal | critical | HTTP calls without retry/timeout patterns |
| has-error-handling | api-server/fullstack | critical | Express error middleware or Next.js error.tsx |
| has-error-boundaries | web-app/fullstack | critical | React error boundaries or error.tsx |
| has-rate-limiting | api-server/fullstack | recommended | Rate limiting in Express or Next.js API routes |
| has-logging | api-server/fullstack | recommended | Structured logging library |
| has-cors | api-server/fullstack | recommended | CORS middleware in Express |
| has-monitoring | web-app/api-server/fullstack | nice-to-have | Monitoring/observability setup |

## API

### `POST /api/scan`

```json
{ "repoUrl": "https://github.com/owner/repo", "force": false }
```

Returns `{ id: string, cached?: boolean }`.

- Cached results within 1 hour are returned automatically
- Set `force: true` to bypass cache

### `GET /api/report/[id]`

Returns full report JSON from the database.

## Architecture

```
src/
  app/           — App Router pages + API routes
  components/    — React components (ui/ for shadcn, app components)
  scanner/       — Scan engine
    rules/       — One file per rule, each exporting { id, category, check() }
    engine.ts    — Orchestrator: runs all rules in parallel
    github.ts    — GitHub REST API client
    stack-detector.ts — Detect framework, language, and ecosystem from package.json
    types.ts     — Shared scanner types
  lib/           — Prisma client, cn() utility
```

### Score Calculation

- Starts at 100
- Critical finding: -15
- Recommended finding: -8
- Nice-to-have finding: -3
- Floor at 0
- Dismissing with an option partially restores based on the option's score impact

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Requires `DATABASE_URL` environment variable pointing to a PostgreSQL database.


