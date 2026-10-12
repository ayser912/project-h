# Architecture

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components, Partial Prefetching) | React 19.3, TypeScript strict |
| Styling | Tailwind CSS v4 with CSS-variable design tokens | Logical properties (`ms-`, `pe-`, `start-`) everywhere for RTL |
| Components | Own primitives in `src/components/ui` (shadcn-compatible API shape) | Native `<dialog>` for modals; no UI dependency |
| Icons / fonts | lucide-react; IBM Plex Sans Arabic + IBM Plex Sans (self-hosted via @fontsource) | No runtime calls to Google Fonts |
| i18n | Locale path segment (`/ar`, `/en`), typed dictionaries, no library | `proxy.ts` redirects unprefixed URLs |
| Data (phase 1) | Bundled seed data + device storage | Swap point: `src/lib/data/repository.ts`, `src/lib/store/demo-store.ts` |
| Data (phase 2+) | Supabase: Postgres + Auth + Storage, Row Level Security | Server actions / route handlers for writes |
| Hosting | Vercel (web) + Supabase | Node.js runtime (required by Cache Components) |
| Tests | Vitest (units), Playwright + axe-core (journeys, accessibility) | |

## Routing and localisation

- Every route lives under `src/app/[locale]`. The `[locale]/layout.tsx` is the root layout: it validates the locale, sets `<html lang dir>`, loads fonts and mounts providers (`I18nProvider`, `ToastProvider`, `OverlayProvider`).
- `(main)` is a route group that wraps screens in the `AppShell`; `watch` and `onboarding` render full-screen without it.
- `proxy.ts` redirects `/…` to `/ar/…` or `/en/…` using the saved choice (`ph_locale` cookie), then `Accept-Language`, then Arabic.
- The desktop layout is a CSS grid; grid columns follow `dir`, so the navigation sits on the right in Arabic and the left in English with no duplicated markup.
- Post text uses `dir="auto"` and `unicode-bidi: plaintext`, so each post keeps its author's direction regardless of the interface language. `lang` is set on the post body for screen readers.
- Dates use `ar-JO` (Levantine month names) with Western digits (`-u-nu-latn`); switch in `src/i18n/config.ts`.

## Rendering model (Next 16 Cache Components)

- Static params are generated for both locales, all topics, communities, seeded profiles and seeded posts (140 prerendered pages). Unlisted params (e.g. posts created on a device) render on request.
- Under Cache Components, reading the current time during prerender is a build error. All time-relative output goes through `useNow()` (null in the shell, ticking on the client) and `<RelativeTime>`; ranking only runs once `now` is known. Feeds render a skeleton in the static shell and hydrate with the person's state.
- Routes are preserved with React `<Activity>` when navigating away. Dialogs, menus and videos clean up on hide (`useLayoutEffect` cleanup / effect cleanup pauses video).

## Data layer and the phase 2 swap

```
UI components ──▶ selector hooks + actions (src/lib/store/demo-store.ts)
                    │   useAllPosts, useViewer, useDisplayCounts, actions.toggleLike …
                    ▼
        phase 1: localStorage + IndexedDB        phase 2: server actions + Supabase (RLS)
```

Components never touch storage directly. Phase 2 reimplements the hooks/actions over Supabase (server-rendered feed queries, optimistic client updates), so screens don't change. Read-side seed access is isolated in `src/lib/data/repository.ts`.

## Health Trust Engine

Implemented as pure, tested functions in `src/lib`:

1. **Identity verification** and 2. **professional credential verification** are separate author attributes (`authorAttributes`). Organisation verification is a third, separate attribute. Credentials carry profession, title, specialty, licensing authority, masked registration, country, verified date, expiry, status and a plain-language *scope* of what was checked. Expired/suspended credentials are not shown as verified.
3. **Content transparency** (`postAttributes`): sources provided, clinically reviewed, not reviewed, under review, personal experience, sponsored. Independent facts, each with its own icon and colour family, never merged into a score. A review counts only if `review.contentVersion === post.version`: editing a post voids its review. A verified author never implies review.
4. **Content safety** (`screenPost`): an explainable keyword screen (Arabic normalised for spelling variants) assigns `low / moderate / high / critical`. High and critical go to `pending_review`: visible to the author only, never distributed, never recommended. It also flags phone numbers, emails, national-ID-like numbers and patient-file references, and requires the author to confirm before publishing. It is a triage aid only; humans review (phase 4).

UI: every post has a **transparency strip** (the per-post facts) that opens **About this post** (who posted, what each label means, sources, review record). The author badge opens the **credential record**. Unreviewed content is always labelled.

## Feed ranking

`src/lib/feed/rank.ts`. Safety gates run before scoring and cannot be outweighed:

- `isDistributable`: excludes blocked authors, hidden posts, and anything not `published` (authors still see their own pending posts).
- `isRecommendable`: additionally excludes high/critical-risk posts without a valid review.
- Score = followed creator + followed topic + interest match + recency decay + language match + sources + log-scaled engagement *quality* (saves and comments weigh more than likes). Each score keeps its reasons, shown in "Why am I seeing this?".
- **Following** is plain reverse-chronological.
- No inference about anyone's health conditions; interests are explicitly chosen and private.

## Design system

Tokens in `src/app/globals.css` (`:root`), exposed to Tailwind through `@theme inline`:

- Brand: emerald `#126B57`, dark teal `#174B48`, mint `#CDEDE2`, off-white `#F8FAF8`, charcoal `#172A28`. Muted text darkened to `#5B6D6A` for AA contrast on tinted surfaces.
- Transparency hues: credential (emerald), organisation (teal), sources (ink blue), reviewed (deep green), personal experience (plum), sponsored (amber), unreviewed (neutral outline), pending (amber). Shape and text always carry meaning; colour is secondary.
- Radii by role: pills for actions and chips, 16px for media, 24px for sheets and panels.
- Feed posts are separated by hairlines rather than boxed into cards, to read as a social stream.
- Dark mode: tokens are centralised; add a `prefers-color-scheme` block when designed.
- Motion: one sheet entrance, a like "pop", toast entrance; all collapse under `prefers-reduced-motion`. Clips don't autoplay for reduced-motion users.

## Planned database (phase 2–4)

Normalised Postgres in Supabase, migrations in `supabase/migrations`. Starting proposal, refining the brief's §12:

| Area | Tables |
| --- | --- |
| Accounts | `profiles` (id = `auth.users.id`, username unique, display_name, bio, avatar_path, account_type, preferred_language, country, show_country, status), `user_roles` (moderator, clinical_reviewer, admin — never self-assignable) |
| Topics | `topics` (slug, name_ar/en, description_ar/en, icon, hidden), `user_topic_preferences` (private), `community_memberships` (private) |
| Content | `posts` (author, type, content, language, visibility, moderation_status, risk_level, version, is_personal_experience, sponsor_partner, deleted_at), `post_versions`, `post_media`, `post_topics`, `post_sources` |
| Social | `follows`, `post_likes`, `post_saves`, `comments`, `user_blocks`, `notifications` — composite unique keys on interactions |
| Verification | `verification_requests`, `verification_evidence` (private bucket paths only), `professional_credentials`, `organization_profiles` |
| Trust and moderation | `content_reviews` (post_id, content_version, reviewer, outcome), `content_reports`, `moderation_cases`, `moderation_actions`, `moderation_appeals`, `audit_logs` (append-only) |

Access control principles:

- RLS on every table. Interests, follows-of-topics, community memberships, saves and blocks are readable only by their owner.
- Verification fields and roles are writable only through server-side functions run by authorised staff; a user can never set `credential` or `role` on their own row (acceptance test 14).
- `verification-evidence` is a private bucket, reachable only via short-lived signed URLs for reviewers; `post-media` is public-read with upload size/type limits.
- Feed/search queries go through views or RPCs that apply the same distribution gates as `rank.ts`, so restricted content can't leak through the API.
- All moderation, review and verification decisions write to `audit_logs`.

## Security notes (phase 1)

- No secrets in the client; no server endpoints yet.
- Uploaded images are re-encoded through a canvas, which drops EXIF (location, camera). Size and type limits on images (10 MB, JPEG/PNG/WebP/GIF) and video (50 MB, 90 s, MP4/WebM/MOV).
- External source links open with `rel="noopener noreferrer nofollow"`; only `https://` sources are accepted.
- Phase 2 adds: server validation, rate limiting, content sanitisation, CSP headers, restricted admin routes, audit logging.
