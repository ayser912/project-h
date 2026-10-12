# Implementation checklist

Legend: `[x]` done and tested, `[~]` partly done (see note), `[ ]` not started.

## Phase 0: inspection and setup
- [x] Environment inspected (empty workspace; Node 22, npm). New Next.js 16 + TypeScript + Tailwind v4 project
- [x] Architecture documented (`docs/ARCHITECTURE.md`)
- [x] Package manager: npm. Env template: `.env.example`
- [x] README, checklist, progress log, known limitations

## Phase 1: design system and social UI
- [x] Responsive shell: mobile top bar + bottom nav; desktop sidebar (side follows language direction) + discovery panel
- [x] Arabic-first RTL with working English switch that keeps the current page and remembers the choice
- [x] Home: For You / Following, topic filters, text, image and video posts, clips rail, "why am I seeing this"
- [x] Explore: 17 health topics, search (keyword, creator, topic; Arabic + English), clips, verified professionals and organisations, active discussions
- [x] Topic pages: posts, clips, discussions, professionals, related topics, private follow
- [x] Create: 5 post types, text, photos (EXIF stripped), short video, alt text, topics, language, sources, sponsorship disclosure, policy guidance, preview, validation, safety screening
- [x] Public profiles and professional/organisation profiles with credentials section
- [x] Own profile with private Saved tab; settings (profile, language, interests, privacy, blocked accounts, data export, demo reset)
- [x] Post detail with comments
- [x] Full-screen vertical clips viewer with captions, mute, keyboard navigation
- [x] Communities: topic-based hubs, private membership
- [x] Trust components: author badge, credential record, transparency strip, "About this post", source list
- [x] Report, block, hide flows
- [x] Onboarding: language + private interests (no health questions)
- [x] Loading, empty, error and not-found states
- [x] Demo data clearly labelled throughout

## Phase 2: authentication and persistent data
- [ ] Supabase project, migrations, seed
- [ ] Registration, login/logout, sessions
- [ ] Username + profile editing persisted; avatar upload
- [ ] Server-side feed queries with distribution gates; pagination
- [ ] Posts create/edit (versioned)/delete; media to Storage
- [ ] Likes, comments, saves, follows, blocks persisted with RLS
- [ ] Replace demo-store implementation behind the same hooks/actions

## Phase 3: credential verification and trust indicators
- [ ] Verification application + private evidence upload
- [ ] Admin review (approve / reject / request info), expiry tracking
- [x] Credential display, source panels, review status, personal-experience and sponsored labels (UI done in phase 1)

## Phase 4: safety and moderation
- [~] Reporting UI (saved on device; needs backend + moderator queue)
- [~] Risk triage (keyword screen done; human review workflow pending)
- [x] Distribution restrictions for pending/restricted content (in ranking + UI)
- [ ] Moderator queue, clinical reviewer workflow, appeals, audit logs, admin dashboard

## Phase 5: personalised feed and media
- [x] Following feed, interest-based ranking, recency, safety-aware ranking
- [x] Video previews and playback (WebM + MP4)
- [~] Pagination ("show more"); infinite scroll + server pagination with phase 2
- [ ] Managed video (Mux / Cloudflare Stream), caching

## Phase 6: QA and deployment
- [x] Unit tests (31) and Playwright journeys + axe on desktop and mobile (48)
- [ ] Permission tests against the database, performance tests, deployment config, beta checklist

## Acceptance tests (brief §18)

Status reflects what was actually executed. "Device" means demo-mode persistence on the visitor's browser.

| # | Requirement | Status |
| --- | --- | --- |
| 1 | Create an account | Not yet (phase 2) |
| 2 | Log out and back in | Not yet (phase 2) |
| 3 | Select and update interests | Pass (device): onboarding + settings, e2e |
| 4 | Arabic and English navigation | Pass: e2e, both viewports |
| 5 | RTL renders correctly | Pass: e2e asserts `dir`, visual review |
| 6 | Publish an allowed text post | Pass (device): e2e |
| 7 | Upload and display images securely | Partial: upload, EXIF-stripping re-encode and display pass e2e; secure server storage is phase 2 |
| 8 | Upload and play videos | Pass (device): seeded and uploaded clips verified playing, e2e |
| 9 | Follow and unfollow | Partial: follow passes e2e; unfollow implemented (same toggle), not separately asserted |
| 10 | Like and unlike | Pass (device): e2e checks counts both ways |
| 11 | Save and unsave | Partial: save + private Saved tab pass e2e; unsave implemented, not separately asserted |
| 12 | Comment | Pass (device): persists across reload, e2e |
| 13 | Report content | Pass (device): reason required, stored, e2e |
| 14 | Public user cannot self-verify | Not yet: no UI path exists; must be enforced server-side in phase 2/3 |
| 15 | Verification documents not public | Not yet (phase 3) |
| 16 | Moderators review reports | Not yet (phase 4) |
| 17 | Review labels only with a real review record | Pass: unit tests (including edit invalidation) |
| 18 | Can't edit/delete others' posts | Partial: UI only offers delete on own posts; server enforcement phase 2 |
| 19 | High-risk restricted posts not promoted | Pass: unit + e2e |
| 20 | No private info leaks via APIs | Not yet: no API exists in phase 1 |
| 21 | Blocking enforced | Pass (device): feeds, topics, comments, e2e |
| 22 | Understandable error messages | Partial: composer and report validation pass e2e; network errors arrive with phase 2 |
| 23 | Usable on mobile | Pass: full suite runs on a Pixel 7 profile; visual review |
| 24 | No hard-coded fake responses | Partial: all interactions are real state changes (device); notifications list is fixed demo content |
| 25 | Automated tests cover permissions and flows | Partial: flows covered; permission tests need the database |
