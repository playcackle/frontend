---
phase: 13-performance-fixes
plan: 02
subsystem: infra
tags: [next/dynamic, bundle-optimization, supabase, sentry, webpack, code-splitting]

# Dependency graph
requires:
  - phase: 12-performance-baselines
    provides: PERF-BASELINE.md with Supabase 645KB chunk baseline measurement

provides:
  - next/dynamic lazy-loading of SentryUserSync in Provider.tsx
  - Supabase chunk deferred out of main entry bundle

affects:
  - 13-performance-fixes

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next/dynamic with ssr: false for components that have no SSR value and pull in large dependencies"
    - "Named export dynamic import pattern: .then((m) => ({ default: m.NamedExport }))"

key-files:
  created: []
  modified:
    - src/app/provider.tsx

key-decisions:
  - "SentryUserSync dynamic import uses ssr: false — component only sets Sentry user context, no server-side HTML output, safe to defer to client"
  - "Dynamic import placed in Provider.tsx (Client Component) not layout.tsx (Server Component) — Next.js only code-splits dynamic imports from Client Components"

patterns-established:
  - "Named export dynamic import: dynamic(() => import('@/...').then((m) => ({ default: m.Named })), { ssr: false })"

requirements-completed: [PERF-06]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 13 Plan 02: SentryUserSync Dynamic Import Summary

**next/dynamic lazy-load of SentryUserSync in Provider.tsx defers Supabase 645KB chunk out of the main entry bundle via webpack code splitting**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-18T15:52:59Z
- **Completed:** 2026-03-18T15:58:00Z
- **Tasks:** 1 of 2 complete (Task 2 is human-verify checkpoint)
- **Files modified:** 1

## Accomplishments
- Replaced static `import { SentryUserSync }` with `dynamic(() => import(...).then(m => ({ default: m.SentryUserSync })), { ssr: false })` in Provider.tsx
- TypeScript compiles cleanly — `npx tsc --noEmit` passes
- `npm run build` succeeds without errors (16 pages generated)
- Bundle analyzer verification pending human review at checkpoint

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert SentryUserSync to dynamic import in Provider.tsx** - `bff20b3` (feat)

**Plan metadata:** pending (docs commit after checkpoint resolution)

## Files Created/Modified
- `src/app/provider.tsx` - Replaced static SentryUserSync import with next/dynamic lazy load (ssr: false)

## Decisions Made
- `ssr: false` is safe for SentryUserSync — it only calls `supabase.auth.getUser()` and sets Sentry user context; no visible HTML rendered server-side
- Dynamic import placed in Provider.tsx (Client Component), NOT layout.tsx (Server Component) — Next.js only produces genuine webpack code splits from Client Component dynamic imports
- Named export pattern used: `.then((m) => ({ default: m.SentryUserSync }))` — required because SentryUserSync uses named export, not default export

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Task 2 (human-verify checkpoint) is pending: user must run `npm run analyze` and inspect bundle treemap
- Expected: Supabase chunk (5191-6c3049.js, 645KB baseline) absent from main entry group or reduced
- If chunk still present in main bundle, report outcome C — further investigation needed
- Home page regression check: `npm run start` then visit http://localhost:3000

---
*Phase: 13-performance-fixes*
*Completed: 2026-03-18*
