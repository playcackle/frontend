---
phase: 15-provider-infrastructure
plan: "03"
subsystem: auth
tags: [discord, oauth, supabase, identity-linking, sql-trigger]

# Dependency graph
requires:
  - phase: 15-provider-infrastructure (plans 01-02)
    provides: SQL trigger migration applied, Discord OAuth provider configured in Supabase
provides:
  - Discord OAuth end-to-end flow verified live against production Supabase
  - handle_new_user trigger confirmed to create valid public.players rows for Discord sign-in
  - Identity linking (automatic merge) confirmed active for same-email accounts
  - Discord raw_user_meta_data field names confirmed from live response
affects: [16-oauth-ui, any phase that writes to public.players or reads OAuth metadata]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Discord metadata COALESCE chain reads user_name for display name and avatar_url for avatar"
    - "Supabase automatic identity linking merges same-email provider accounts to a single auth.users row"

key-files:
  created: []
  modified: []

key-decisions:
  - "Discord raw_user_meta_data confirmed: display name is stored under user_name (not full_name); avatar under avatar_url — Phase 16 sync code must use these field names"
  - "Google OAuth (SETUP-01) remains deferred — Discord is sole verified active provider entering Phase 16"
  - "Supabase redirect allowlist must include localhost for local dev OAuth flows — noted for onboarding docs"
  - "Name editing for OAuth users is future work — no update endpoint exists yet in player_manager"

patterns-established:
  - "Discord OAuth metadata: use user_name for display name, avatar_url for avatar in all trigger and sync code"

requirements-completed: [SETUP-02, SETUP-03, SETUP-04]

# Metrics
duration: ~15min (human-verified flow)
completed: 2026-03-25
---

# Phase 15 Plan 03: OAuth End-to-End Verification Summary

**Discord OAuth flow verified live: trigger creates valid public.players rows, identity linking confirmed, and Discord metadata field names locked in for Phase 16**

## Performance

- **Duration:** ~15 min (human-verified flow)
- **Started:** 2026-03-25
- **Completed:** 2026-03-25
- **Tasks:** 1
- **Files modified:** 0

## Accomplishments

- Discord OAuth sign-in completes successfully end-to-end with a valid player record created in public.players (SETUP-02 + SETUP-04 confirmed)
- Identity linking verified active: same-email OAuth sign-in merges to a single auth.users record (SETUP-03 confirmed)
- Discord raw_user_meta_data shape confirmed from a live response: display name is stored under `user_name`, avatar under `avatar_url` — this resolves the MEDIUM-confidence item flagged in research and locks in the field names for Phase 16 trigger and sync code
- Redirect URL configuration requirement identified: localhost must be in Supabase redirect allowlist for local dev OAuth flows

## Task Commits

This plan was a human-verify checkpoint. No code commits were made.

1. **Task 1: End-to-end OAuth flow verification** — human-verified live (no commit)

**Plan metadata:** see final docs commit below

## Files Created/Modified

None — this plan was an end-to-end verification checkpoint with no code changes.

## Decisions Made

- **Discord metadata field names confirmed:** `user_name` is the display name key (not `full_name` or `username`); `avatar_url` is the avatar key. Phase 16 must use these exact keys in sync code and any trigger updates.
- **Google OAuth (SETUP-01) remains deferred:** Discord is the sole verified active provider going into Phase 16. The Google OAuth todo remains in `.planning/todos/pending/`.
- **Supabase redirect allowlist:** `localhost` must be added to the Supabase allowed redirect URLs for local dev to work. This is a one-time setup step — noted for contributor onboarding.
- **Name editing for OAuth users is future work:** No update endpoint exists in player_manager yet; users cannot change their display name after OAuth registration until that endpoint ships.

## Deviations from Plan

### Partial requirement coverage

**SETUP-01 (Google OAuth) not verified** — Google OAuth was deferred in Plan 02 and was not tested in this verification round. SETUP-01 remains open. Only SETUP-02, SETUP-03, and SETUP-04 are confirmed met.

- **Impact:** Phase 16 should render Discord sign-in only; Google button should remain hidden/disabled until SETUP-01 is resolved.

---

**Total deviations:** 1 (plan scope — Google OAuth not tested; was already deferred in Plan 02)
**Impact on plan:** Acceptable. Discord is the primary provider for v1.4. Google can be verified and enabled in a future todo cycle.

## Issues Encountered

- **Redirect URL config:** The Supabase project's allowed redirect URL list did not include `localhost` at the start of testing. User needed to add the localhost origin to the Supabase dashboard allowlist before the OAuth redirect back to the app would succeed. Resolved during the test session.

## User Setup Required

None beyond what was documented in Plan 02 USER-SETUP.md — the redirect allowlist fix is a one-time developer environment step, not a recurring setup concern.

## Discord Metadata Shape (Phase 16 Hard Dependency)

The following field names were confirmed from the live Discord OAuth `raw_user_meta_data` JSONB response:

| Field | Key confirmed | Notes |
|-------|--------------|-------|
| Display name | `user_name` | Use this in COALESCE chain for public.players.name |
| Avatar URL | `avatar_url` | Direct CDN URL; use for public.players.avatar_url |
| Email | `email` | Present at top-level in auth.users, not needed from metadata |

**Phase 16 trigger/sync code must use `user_name` and `avatar_url`.** Any code using `full_name`, `username`, or other keys for Discord will produce NULL or incorrect values.

## Next Phase Readiness

- Phase 15 is complete. Discord OAuth provider infrastructure is confirmed working end-to-end.
- Phase 16 (OAuth UI and Profile Sync) can begin.
- Discord button is already present on `/login` and `/register` pages above the email/password form (delivered in Plan 02).
- Privacy policy (`/privacy`) and terms of service (`/terms`) pages are live (delivered in Plan 02).
- The Discord metadata field names documented above are required reading before writing any Phase 16 sync code.
- SETUP-01 (Google OAuth) remains as a pending todo — do not enable the Google button in Phase 16 until this is resolved.
- No backend `/players/{id}/sync-oauth` endpoint exists yet — Phase 16 must stub or defer this.

---
*Phase: 15-provider-infrastructure*
*Completed: 2026-03-25*
