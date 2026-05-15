# ProdReady

A production readiness checker for side projects. Paste any public GitHub repo and get a health report across 14 checks.

## How It Works

1. Enter a GitHub repo URL
2. Files and metadata are scanned via the GitHub API (we don't clone, build, or run your code)
3. Each rule runs in parallel and returns a finding or passes
4. Score starts at 100, critical findings -15, recommended -8, nice-to-have -3, floor at 0
5. Dismiss findings with context-aware options that partially restore score
6. Share the report link — stored for 24 hours, metadata only, no code saved

## Setup

```bash
git clone <repo>
cd prodready
npm install
npx prisma db push
npm run dev
```

Create `.env.local`:

```env
DATABASE_URL=postgresql://...
GITHUB_TOKEN=ghp_...   # optional, avoids rate limits
```

## Scanner Rules

| Rule | Category | Severity | What it checks |
|------|----------|----------|---------------|
| has-env-example | universal | nice-to-have | `.env.example` or `.env.sample` exists |
| has-readme | universal | recommended | README with content (50+ chars) |
| has-cicd | universal | recommended | CI/CD config (GitHub Actions, CircleCI, GitLab CI, Jenkins) |
| has-tests | universal | recommended | Test files or test framework in deps |
| has-validation | universal | recommended | Input validation library in stack |
| has-dockerfile | universal | recommended | Dockerfile or docker-compose |
| has-strict-ts | typescript | recommended | `strict: true` in tsconfig.json |
| has-retry-handling | universal | critical | HTTP calls without retry/timeout patterns |
| has-error-handling | api-server/fullstack | critical | Express error middleware or Next.js error.tsx |
| has-error-boundaries | web-app/fullstack | critical | React error boundaries or error.tsx |
| has-rate-limiting | api-server/fullstack | recommended | Rate limiting packages or related filenames |
| has-logging | api-server/fullstack | recommended | Structured logging library |
| has-cors | api-server/fullstack | recommended | CORS middleware in Express |
| has-monitoring | web-app/api-server/fullstack | nice-to-have | Monitoring/observability setup |

## Scope & Limitations

Each check runs against repo metadata and file listings via the GitHub API. We don't build or run your code.

- **has-env-example** — checks file exists, not whether it's kept in sync
- **has-readme** — checks file length, not quality
- **has-tests** — looks for a test framework in deps or test files; doesn't confirm tests run
- **has-validation** — detects validation libraries in package.json; not source-level usage
- **has-strict-ts** — reads tsconfig.json; doesn't check for strict-mode violations
- **has-retry-handling** — scans up to 20 source files for HTTP calls; may miss complex setups
- **has-error-handling** — checks for Express error middleware or Next.js error.tsx; doesn't confirm route coverage
- **has-error-boundaries** — looks for ErrorBoundary components; doesn't verify wiring
- **has-rate-limiting** — detects rate limit packages or rate-limit-related filenames; doesn't inspect middleware config
- **has-logging / has-monitoring / has-cors** — checks dependency lists; doesn't confirm actual usage
- Rules that don't apply to your stack are silently skipped

All 14 items on the report page have info tooltips explaining exactly what was inspected.

## API

### `POST /api/scan`

```json
{ "repoUrl": "https://github.com/owner/repo", "force": false }
```

Returns `{ id: string, cached?: boolean }`. Cached results within 1 hour returned automatically. Set `force: true` to bypass.

### `GET /api/report/[id]`

Returns full report JSON from the database.
