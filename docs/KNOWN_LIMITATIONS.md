# Known limitations (phase 1)

## Product
- **Device-only persistence.** Activity is stored in the visitor's browser. Other people can't see your posts, likes or comments, and clearing site data removes them.
- **Demo identity.** There is one local "you" account. No sign-up, login or real usernames until phase 2.
- **All seeded accounts and posts are fictional.** Credentials, the organisation and the single clinical review record are demonstrations and labelled as such.
- **Notifications** show a fixed set of labelled demo items.
- **Verification application, moderator queue, clinical review workflow, appeals and the admin dashboard** are not built yet (phases 3–4). The UI shows "Apply for professional verification" as unavailable.
- **Account deletion** is disabled until real accounts exist. Data export works (downloads what this device stores).
- **Safety screening is a keyword screen.** It will miss things and flag some harmless posts. It only decides what waits for human review; it does not judge accuracy.
- **Search** is in-memory over loaded content; server-side full-text search (with Arabic normalisation) comes with the database.
- **Pagination** is a "show more" button over loaded posts; infinite scroll with server pagination comes in phase 5.
- **Comments** are flat (no threaded replies yet).
- **Dark mode** not designed yet (tokens are ready for it).

## Technical
- Editing a post (and the review invalidation it triggers in the UI) depends on post versioning in the database; the logic is implemented and unit-tested, the edit UI comes with phase 2.
- Uploaded video is stored as-is on the device; there is no transcoding or adaptive streaming. A managed provider (Mux or Cloudflare Stream) is planned.
- Image EXIF stripping relies on canvas re-encoding in the browser. Server-side stripping is still needed in phase 2 for uploads from other clients.
- No rate limiting, CSP headers or server validation yet: there is no server write path in phase 1.

## Legal and regulatory (needs qualified counsel)
Nothing in this codebase constitutes a compliance claim. Before any launch, review with local counsel, starting with Jordan:
- Personal data protection law and cross-border data transfer (hosting region for Supabase/Vercel).
- Platform and user-generated-content liability, takedown obligations.
- Health and medical advertising rules; sponsorship disclosure requirements.
- Verification of healthcare professionals: what registries can lawfully be checked, and what registration details may be displayed.
- Minimum age, consent and terms of service; emergency-messaging wording.
The emergency number shown (911 in Jordan) should be confirmed per launch country.
