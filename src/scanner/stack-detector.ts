import type { Stack, ScanContext } from "./types"

const frameworks: Record<string, string> = {
  next: "Next.js",
  "create-react-app": "React (CRA)",
  vite: "Vite",
  astro: "Astro",
  "remix": "Remix",
  "gatsby": "Gatsby",
  "nuxt": "Nuxt",
  "sveltekit": "SvelteKit",
  "expo": "Expo",
  "react-scripts": "React (CRA)",
  "@remix-run/react": "Remix",
  "@sveltejs/kit": "SvelteKit",
  "solid-js": "SolidJS",
  express: "Express",
  "fastify": "Fastify",
  "hono": "Hono",
  "nestjs": "NestJS",
  meteor: "Meteor",
}

const bundlers: Record<string, string> = {
  webpack: "webpack",
  vite: "Vite",
  "esbuild": "esbuild",
  "rollup": "Rollup",
  "parcel": "Parcel",
  "tsup": "tsup",
  "turbo": "Turborepo",
  next: "Next.js (Turbopack)",
}

const databases: Record<string, string> = {
  postgres: "PostgreSQL",
  pg: "node-postgres",
  "mongoose": "MongoDB",
  "mongodb": "MongoDB",
  "redis": "Redis",
  "ioredis": "Redis",
  "mysql2": "MySQL",
  "sqlite3": "SQLite",
  "better-sqlite3": "SQLite",
  "drizzle-orm": "DrizzleORM",
  supabase: "Supabase",
}

const styling: Record<string, string> = {
  tailwindcss: "TailwindCSS",
  styled: "styled-components",
  "@emotion/react": "Emotion",
  "emotion": "Emotion",
  "sass": "Sass/SCSS",
  "less": "Less",
  "stitches": "Stitches",
  "vanilla-extract": "Vanilla Extract",
  "unocss": "UnoCSS",
  "@chakra-ui/react": "Chakra UI",
  "@mantine/core": "Mantine",
  "@radix-ui/themes": "Radix Themes",
  "@nextui-org/react": "NextUI",
  "@shadcn/ui": "shadcn/ui",
}

const testing: Record<string, string> = {
  jest: "Jest",
  vitest: "Vitest",
  "@testing-library/react": "Testing Library",
  "cypress": "Cypress",
  "playwright": "Playwright",
  "@playwright/test": "Playwright",
  "mocha": "Mocha",
  "chai": "Chai",
  "ava": "AVA",
  "supertest": "Supertest",
  "storybook": "Storybook",
}

const orms: Record<string, string> = {
  prisma: "Prisma",
  "@prisma/client": "Prisma",
  "drizzle-orm": "DrizzleORM",
  "typeorm": "TypeORM",
  "sequelize": "Sequelize",
  "knex": "Knex",
  "mongoose": "Mongoose",
}

const validation: Record<string, string> = {
  zod: "Zod",
  yup: "Yup",
  joi: "Joi",
  "@sinclair/typebox": "TypeBox",
  valibot: "Valibot",
  "@asteasolutions/zod-to-openapi": "Zod",
}

const monitoring: Record<string, string> = {
  "@sentry/nextjs": "Sentry",
  "@sentry/react": "Sentry",
  "sentry": "Sentry",
  "@highlight-run/next": "Highlight",
  "highlight": "Highlight",
  "datadog": "Datadog",
  "@datadog/browser-rum": "Datadog RUM",
  "@opentelemetry/api": "OpenTelemetry",
}

const logging: Record<string, string> = {
  pino: "Pino",
  winston: "Winston",
  consola: "Consola",
  log4js: "log4js",
  signale: "Signale",
  "@nestjs/common": "NestJS Logger",
}

const httpClients: Record<string, string> = {
  axios: "Axios",
  ky: "Ky",
  got: "Got",
  "node-fetch": "node-fetch",
  undici: "undici",
  "ofetch": "ofetch",
}

function matchDeps(
  deps: Record<string, string>,
  map: Record<string, string>,
): string[] {
  const found: string[] = []
  for (const [key, label] of Object.entries(map)) {
    if (key in deps) found.push(label)
  }
  return [...new Set(found)]
}

export function detectStack(ctx: ScanContext): Stack {
  const pkg = ctx.packageJson
  const allDeps = {
    ...((pkg?.dependencies as Record<string, string>) || {}),
    ...((pkg?.devDependencies as Record<string, string>) || {}),
  }

  const detectedFramework = matchDeps(allDeps, frameworks)
  const detectedBundlers = matchDeps(allDeps, bundlers)
  const hasTypeScript =
    "typescript" in allDeps ||
    ctx.files.some((f) => f.endsWith(".ts") || f.endsWith(".tsx"))

  return {
    framework: detectedFramework[0] || null,
    language: hasTypeScript ? "typescript" : "javascript",
    bundler: detectedBundlers[0] || null,
    database: matchDeps(allDeps, databases),
    styling: matchDeps(allDeps, styling),
    testing: matchDeps(allDeps, testing),
    orm: matchDeps(allDeps, orms),
    validation: matchDeps(allDeps, validation),
    monitoring: matchDeps(allDeps, monitoring),
    logging: matchDeps(allDeps, logging),
    httpClient: matchDeps(allDeps, httpClients),
  }
}
