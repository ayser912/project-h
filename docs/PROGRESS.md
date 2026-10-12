# Progress log

## 2026-10-12: Phase 0 + Phase 1 complete (demo mode)

### Features implemented
- Next.js 16 app, Arabic-first with RTL and a working English switch; locale routing via `proxy.ts`.
- App shell: mobile bottom nav + top bar, desktop sidebar (direction-aware) and discovery panel, demo-mode banner.
- Home (For You with explainable, safety-gated ranking; Following in time order; topic filters; clips rail), Explore with bilingual search, 17 topic pages, 6 community hubs, composer (5 post types, photos with EXIF stripped, video, sources, sponsorship, safety screening, preview), public/professional/organisation profiles, own profile with private Saved, post detail with comments, full-screen clips viewer, onboarding (language + private interests), notifications (demo), settings (profile, language, interests, privacy, blocked, data export, reset).
- Health Trust Engine UI and logic: author badge → credential record with scope/date; per-post transparency strip → "About this post"; review only valid for the reviewed version; no accuracy score.
- Report, block, hide, delete-own-post, copy/share link, like, save, follow, comment, join community.

### Files
`src/app/[locale]/**` (routes), `src/components/**` (UI), `src/lib/{trust,safety,feed,data,store,hooks}`, `src/i18n/**`, `src/proxy.ts`, `tests/unit/*`, `e2e/*`, `docs/*`, `public/demo/*`.

### Database changes
None yet. Proposed schema and RLS approach in `docs/ARCHITECTURE.md`.

### Tests performed (all executed, all passing)
- `npm run lint`: 0 errors, 0 warnings.
- `tsc --noEmit`: clean. `next build`: 140 pages prerendered.
- Vitest: 31 tests (trust attributes incl. review invalidation, safety screening in Arabic and English, ranking gates, i18n key/placeholder parity, search).
- Playwright: 24 tests × 2 viewports (desktop 1366×900, Pixel 7) = 48 passing: locale redirect, RTL, navigation, Journeys A, B (incl. validation, high-risk hold, patient-detail warning), D, E, video playback (seeded and uploaded), like/comment, block, restricted content, search, and an axe WCAG 2.1 AA scan of 8 screens (0 serious/critical violations).
- Manual visual review of key screens in both languages and viewports.

### Defects found and fixed during QA
- Time-dependent rendering broke the prerender under Cache Components → `useNow()` / `<RelativeTime>`.
- Latin names truncating from the wrong end inside RTL → `dir="auto"` on names.
- Clips viewer controls hidden under the caption overlay → controls moved to the top.
- Mixed-direction meta line in the side panel → `<bdi>`.
- "1 comments" pluralisation.
- Composer language `<select>` had no accessible name (axe critical).
- Test Chromium can't decode H.264 → added WebM (VP9) renditions with MP4 fallback; playback now verified.

### Outstanding defects
- None known that block phase 2. See `docs/KNOWN_LIMITATIONS.md` for scope limits.

### Required credentials / integrations for next phase
- A Supabase project (URL, anon key, service role key for migrations only).
- A Vercel project (optional for preview deployments).
- Decision on hosting region given data-protection review.

### Next tasks (phase 2)
1. Supabase migrations for accounts, topics, posts (+versions, media, sources, topics), interactions, blocks, notifications, with RLS and seed.
2. Supabase Auth: sign-up, login/logout, username selection inside onboarding.
3. Reimplement `demo-store` hooks/actions with server actions + optimistic updates; server-rendered feed queries with distribution gates and cursor pagination.
4. Storage buckets (`post-media` public-read, `verification-evidence` private) and upload limits; server-side EXIF stripping.
5. Permission tests (users can't edit others' posts, can't self-verify, private data not readable).
