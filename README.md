# TimeDive

A full-stack history learning web app that teaches history through short, AI-generated personalized stories — for kids, teens, and adults. Users "dive" through historical eras visualized as ocean depths, guided by a friendly submarine mascot.

## Run & Operate

- `pnpm --filter @workspace/timedive run dev` — run the frontend (Vite, port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Deployment

Hosted on Railway (Docker build from the root `Dockerfile`/`railway.json` — a single service builds and serves both the frontend and API) with Postgres on Neon. See `.env.example` for the full list of variables to set in Railway's Variables tab.

## Required environment variables

- `DATABASE_URL` — Postgres connection string (from Neon)
- `SESSION_SECRET` — Secret for signing session cookies
- `ANTHROPIC_API_KEY` — Anthropic API key for AI story generation
- `RESEND_API_KEY` — Resend API key for password-reset, email verification, and Contact Us emails (optional — falls back to console logging / DB-only storage if missing)
- `APP_URL` — Public app URL used in email links (e.g. https://mytimedive.com)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter (routing) + Tailwind CSS + Framer Motion
- API: Express 5 + express-session + bcryptjs
- DB: PostgreSQL + Drizzle ORM
- AI: Claude (Anthropic) via direct API call
- Email: Resend (optional)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Font: Atkinson Hyperlegible (accessibility-focused)

## Where things live

- `lib/api-spec/openapi.yaml` — Single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, topics, stories, progress, badges, etc.)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, topics, stories, progress, dashboard)
- `artifacts/api-server/src/lib/topicSeed.ts` — Topic and badge seed data
- `artifacts/timedive/src/` — React frontend (pages, components, auth context)
- `Dockerfile` / `railway.json` — Railway deployment build

## Architecture decisions

- Email/password + bcryptjs auth with express-session (explicitly requested by spec — not Clerk/Replit auth)
- Stories are cached per user+topic pair in the `stories` table; force regeneration is opt-in. Free-text (Story Generator) stories are also saved, with `topicId` null and `customTopicTitle` set instead
- Stories can be shared via a random `share_token`; `/shared/:token` is a public, unauthenticated route
- AI story generation calls Anthropic Claude API server-side; API key is never exposed to the browser
- Web Speech API is used for audio narration (no paid TTS API required) — pause/resume tracks position manually since native pause/resume is unreliable across browsers
- Avatars are a fixed set of preset emoji (`artifacts/api-server/src/lib/avatars.ts` / `artifacts/timedive/src/lib/avatars.ts` — keep both in sync), not uploaded images
- Email verification is non-blocking — users can use the app before verifying; a dismissible banner nudges them
- Topics and badges are seeded via `scripts/src/seedTimedive.ts` (`pnpm --filter @workspace/scripts exec tsx ./src/seedTimedive.ts`), reading from `topicSeed.ts`. Since this environment can't run pnpm, recent additions were seeded by hand-writing SQL for Neon's SQL Editor instead — keep `topicSeed.ts` and the live DB in sync if you do this again
- After codegen, `zod.int()` must be post-processed to `zod.number().int()` (Orval v8 generates Zod v4 syntax but workspace uses Zod v3)
- `artifacts/timedive/src/hooks/use-library.ts` hand-writes react-query hooks for endpoints added after codegen access was lost — mirror its conventions for any new endpoint until codegen is run again

## Product

- **Landing page**: Ocean depth hero with submarine mascot
- **Auth**: Register, login, forgot/reset password
- **Onboarding**: Age mode, grade level, interests (sports, games, movies, hobbies, books, location)
- **Timeline**: Visual ocean cross-section showing eras by depth (1=recent, 10=ancient)
- **Stories**: AI-generated, personalized to the user's stored interests
- **Progress**: Per-category progress bars + badges (First Dive, Deep Diver, History Buff, etc.)
- **My Stories**: Every generated story (topic-based and free-text) is saved and viewable/listenable later
- **Sharing**: Any story can be shared via a public link, no login required to view
- **Contact Us**: In-app form, saved to `contact_messages` and emailed via Resend
- **Avatars**: Preset emoji avatars, chosen from the Profile page
- **Accessibility**: Atkinson Hyperlegible font, text size control, high-contrast mode, Web Speech API narration on every story

## Gotchas

- **Codegen post-processing**: After running `pnpm --filter @workspace/api-spec run codegen`, you MUST run `sed -i 's/zod\.int()/zod.number().int()/g' lib/api-zod/src/generated/api.ts` before the typecheck step passes. Orval v8 emits Zod v4 syntax (`zod.int()`) but the workspace locks Zod at v3.
- **Lib declarations**: After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before typechecking leaf artifacts. Missing table exports usually mean stale declarations.
- **Session type augmentation**: Session userId typing is in `artifacts/api-server/src/types/session.d.ts`.
