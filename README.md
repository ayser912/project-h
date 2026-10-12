# Project H

A consumer social network for health in the MENA region, Arabic first, with transparent medical expertise: verified credentials, separately labelled sources, per-post clinical review status, and safety-aware distribution.

> **Working name.** "Project H" is temporary. Rebrand in `src/config/brand.ts` and the colour tokens at the top of `src/app/globals.css`.

## Status

**Phase 1 preview (demo mode).** The full social UI runs in Arabic (RTL) and English, on mobile and desktop. Every interaction works (like, save, follow, comment, report, block, hide, publish with photos or video, interests), but it persists **on the visitor's device only** (localStorage + IndexedDB). All seeded accounts and posts are fictional and labelled as demo data; no real credential has been checked.

Real accounts, the database and server-side authorization arrive in Phase 2. See [`docs/PROGRESS.md`](docs/PROGRESS.md) and [`docs/IMPLEMENTATION_CHECKLIST.md`](docs/IMPLEMENTATION_CHECKLIST.md).

## Quick start

Requirements: Node.js 22+, npm.

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /ar or /en
```

Production build:

```bash
npm run build
npm start
```

No environment variables are needed for Phase 1. `.env.example` lists what Phase 2 will need.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next + React Compiler rules) |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit tests (Vitest): trust labels, safety screening, ranking, i18n, search |
| `npm run test:e2e` | Browser tests (Playwright) of the user journeys + axe accessibility scan, desktop and mobile. Run `npm run build` first. |
| `npm run check` | Lint + typecheck + unit tests |

For end-to-end tests, either run `npx playwright install chromium` once, or point at an existing Chromium with `PW_CHROMIUM_PATH=/path/to/chrome`.

## Project layout

```
src/
  app/[locale]/            Routes. Root layout per locale sets lang + dir.
    (main)/                Screens inside the app shell (home, explore, topics,
                           communities, create, profile, u/[username], post/[id],
                           notifications, settings)
    watch/                 Full-screen clips viewer
    onboarding/            Language + private interests
  components/              UI by domain: post, trust, feed, profile, topic,
                           video, create, layout, overlay, ui (primitives)
  config/brand.ts          Product name and tagline
  i18n/                    Locale config, ar/en dictionaries, provider, formatting
  lib/
    trust/attributes.ts    Health Trust Engine transparency attributes
    safety/screen.ts       Pre-publication risk + patient-privacy screening
    feed/rank.ts           Explainable, safety-gated feed ranking
    data/                  Topics, communities, demo seed data, read repository
    store/                 Demo-mode persistence (device) + media storage
  proxy.ts                 Locale redirect (Next 16 "proxy", formerly middleware)
tests/unit/                Vitest
e2e/                       Playwright journeys + accessibility
docs/                      Architecture, checklist, progress, limitations
public/demo/               Generated, clearly labelled demo media
```

## Important notes for contributors

- This uses **Next.js 16** with Cache Components. Read `AGENTS.md` and the guides in `node_modules/next/dist/docs/` before changing routing or rendering. Notably: no `dynamicParams` export, `generateStaticParams` must return at least one entry, and anything that reads the current time must not run in the prerendered shell (use `useNow()` / `<RelativeTime>`).
- All interface text lives in `src/i18n/messages/ar.ts` (source of truth) and `en.ts` (type-checked against it). A unit test fails if keys or placeholders drift.
- Never present demo data as real. Never let a verified author imply a reviewed post. Never add a combined "accuracy score".
- Nothing here is legal advice. Jurisdiction-specific review (Jordan first) is required before launch; see `docs/KNOWN_LIMITATIONS.md`.
