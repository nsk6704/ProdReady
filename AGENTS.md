# ProdReady — Agent Memory

## Project Overview
Build a web app called "ProdReady" that analyzes a GitHub repository and generates a "production readiness" report. The scan checks common JavaScript/TypeScript web apps (Next.js, Express, React, Vite, Node.js) for deployment readiness issues.

## Tech Stack
- **Framework:** Next.js 16 (App Router) with TypeScript (strict mode)
- **Styling:** TailwindCSS v4 + shadcn/ui (amber base, CSS variables)
- **DB:** Prisma ORM + Neon PostgreSQL (free tier)
- **Deployment:** Vercel
- **Font:** Inter or Geist via `next/font` (premium sans-serif)

## Theme / Brand
- **Colors:** White (#fff) background, Amber (#f59e0b / amber-500) accent, dark grays for text
- **Tone:** Playful/roasting — scanners should meme-ish, opinionated findings not dry corporate speak
- **Vibes:** Fast, shareable, indie hacker energy

## NPM Scripts (will exist after init)
- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run db:generate` — `prisma generate`
- `npm run db:push` — `prisma db push`
- `npm run db:studio` — `prisma studio`

## Architecture Patterns
### Folder Structure
```
src/
  app/           — Next.js App Router pages + API routes
  components/    — React components (ui/ for shadcn, rest for app)
  scanner/       — All scan engine logic
    rules/       — One file per rule, each exports { id, category, check() }
    engine.ts    — Orchestrator: runs all rules in parallel
    github.ts    — GitHub REST API client
    stack-detector.ts — Parse package.json deps
    types.ts     — Shared scanner types
  lib/           — Utilities (prisma client, cn helper, etc.)
```

### Scanner Rule Convention
Each rule file in `src/scanner/rules/`:
```typescript
import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-dockerfile",
  category: "recommended", // "critical" | "recommended" | "nice-to-have"
  check: async (ctx) => {
    // ctx has: packageJson, files (string[]), repoInfo, fileContents
    // Return null if pass, or Finding object if issue detected
  }
}
```

### Score Calculation
- Start at 100
- Critical finding: -15
- Recommended finding: -8
- Nice-to-have finding: -3
- Floor at 0

### API Routes
- `POST /api/scan` — Accept `{ repoUrl, githubToken? }` → run scan → save to DB → return `{ id }`
- `GET /api/report/[id]` — Return full report JSON from DB

### Pages
- `/` (server component) — Landing page with input form
- `/report/[id]` (server component) — Shareable report page with SSR, metadata, OG image

## Design Conventions
- Use `cn()` from `@/lib/utils` for className merging
- Server components by default, `"use client"` only for interactive bits
- shadcn components in `src/components/ui/`
- Use `lucide-react` for icons
- Dark mode via `next-themes` (but default to light with amber accent)

## Key Dependencies
- next, react, react-dom
- typescript, @types/react, @types/node
- tailwindcss, postcss, autoprefixer
- prisma, @prisma/client
- next-themes (dark mode)
- lucide-react (icons)
- tailwind-merge, clsx, class-variance-authority (shadcn deps)
- @radix-ui/* (via shadcn)

## Important Preferences
- No comments in code unless really needed
- Concise responses, no preamble/postamble
- Prefer editing over creating new files
- Minimal, clean, functional code
