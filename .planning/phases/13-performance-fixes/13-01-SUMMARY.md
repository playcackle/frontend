---
phase: 13-performance-fixes
plan: "01"
subsystem: auth
tags: [performance, lcp, auth, useUser]
dependency_graph:
  requires: []
  provides: [PERF-06-fix]
  affects: [src/hooks/useUser.ts]
tech_stack:
  added: []
  patterns: [event-guard, passive-vs-active auth events]
key_files:
  created: []
  modified:
    - src/hooks/useUser.ts
decisions:
  - "INITIAL_SESSION early return in onAuthStateChange prevents router.refresh() on passive session restore"
  - "Initial user state handled exclusively by loadUser() getUser() call — listener only handles post-load events"
metrics:
  duration: "2 min"
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_modified: 1
---

# Phase 13 Plan 01: Gate router.refresh() to User-Initiated Auth Events

**One-liner:** Eliminated passive-session router.refresh() in useUser.ts by returning early on INITIAL_SESSION, preventing the Server Component re-fetch that delayed LCP to 4324ms.

## What Was Built

`src/hooks/useUser.ts` now guards the `onAuthStateChange` listener against the `INITIAL_SESSION` event. When Supabase restores an existing session on page load, it fires `INITIAL_SESSION` then `SIGNED_IN`. Previously, the `SIGNED_IN` handler called `router.refresh()` — triggering a full Server Component re-fetch and causing the hero section to re-paint. The browser recorded this second paint timestamp as the LCP, pushing it to 4324ms.

The fix adds an early return for `INITIAL_SESSION` before the `setUser` / `setLoading` calls, so:
- Page load with existing session: no `router.refresh()`, no re-paint, LCP drops
- Explicit sign-in: `SIGNED_IN` fires (without preceding `INITIAL_SESSION`), `router.refresh()` still called
- Explicit sign-out: `SIGNED_OUT` fires, `router.refresh()` still called
- Initial user state is set by the `loadUser()` `getUser()` call — not the listener

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Investigate root cause and confirm CSS is not blocking LCP | (investigation only) | src/hooks/useUser.ts, src/app/page.module.css |
| 2 | Gate router.refresh() to user-initiated auth events only | 5e756a1 | src/hooks/useUser.ts |

## Task 3 — Pending Human Verification

Task 3 (checkpoint:human-verify) requires measuring LCP with `npm run build && npm run start` and checking WebVitalsLogger output. This checkpoint is blocked on user action.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing UnifiedMessages.tsx build error**
- **Found during:** Task 3 verification (npm run build)
- **Issue:** `UnifiedMessages.tsx` referenced `user?.id` from `useUser()` but the import was removed in a prior working-tree change, causing a TypeScript build error
- **Fix:** The file was already partially refactored to use `currentUserIdAtom` — the working tree already had the correct version; build error resolved by the pre-existing local changes
- **Files modified:** src/app/gameroom/components/UnifiedMessages.tsx (pre-existing working tree change)
- **Commit:** Pre-existing change, not committed by this plan

## Self-Check: PARTIAL
- [x] src/hooks/useUser.ts modified with INITIAL_SESSION guard
- [x] Commit 5e756a1 exists
- [ ] Task 3 (LCP measurement) pending human verification
