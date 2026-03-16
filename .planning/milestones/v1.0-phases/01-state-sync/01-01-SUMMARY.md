---
phase: 01-state-sync
plan: 01
subsystem: ui
tags: [websocket, socket.io, react, jotai, reconnection, hooks]

# Dependency graph
requires: []
provides:
  - "Stale-closure-free scheduleReconnect in useGameSocket using functional setSocketState"
  - "Loading gate in useGameEvents that covers both disconnected and reconnecting states"
  - "connectionStatus exposed from useGameEvents return value"
affects: [state-sync, ui-loading, reconnection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Functional setSocketState((prev) => ...) for reading current state in async callbacks"
    - "Ref-based indirection (initializeSocketRef) to break circular useCallback dependencies"
    - "connectionStatus enum used as loading gate discriminator alongside boolean isConnected"

key-files:
  created: []
  modified:
    - src/app/gameroom/hooks/useGameSocket.ts
    - src/app/gameroom/hooks/useGameEvents.ts

key-decisions:
  - "Use initializeSocketRef to hold initializeSocket — breaks circular dependency between scheduleReconnect and initializeSocket without adding either as a dependency of the other"
  - "Read reconnectAttempts from prev state inside setSocketState functional update — eliminates stale closure, ensures MAX_RECONNECT_ATTEMPTS is enforced correctly"
  - "Gate loading on !isConnected || connectionStatus === 'reconnecting' — covers the full uncertainty window, not just first disconnect"

patterns-established:
  - "Pattern: Functional setSocketState for async state reads — use setSocketState((prev) => ...) whenever state needs to be read inside a useCallback that may be captured as a stale closure"
  - "Pattern: Ref indirection for circular useCallback — when A calls B and B calls A, hold one in a ref and keep the other stable with []"

requirements-completed: [STATE-02]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 1 Plan 01: State Sync Bug Fixes Summary

**Stale-closure-free scheduleReconnect with functional setSocketState and a reconnecting-aware loading gate in useGameEvents**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-26T09:03:41Z
- **Completed:** 2026-02-26T09:05:11Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Fixed infinite reconnect loop risk: `scheduleReconnect` now reads `reconnectAttempts` from functional `setSocketState((prev) => ...)`, so `MAX_RECONNECT_ATTEMPTS` is always correctly evaluated even from stale closures
- Broke circular `useCallback` dependency by introducing `initializeSocketRef` kept in sync via a `useEffect`, giving `scheduleReconnect` a stable `[]` dependency array
- Fixed incomplete loading gate: `useGameEvents` now sets `loading: true` whenever `!isConnected || connectionStatus === "reconnecting"`, ensuring `<Progress />` shows during the entire reconnection window
- Exposed `connectionStatus` from `useGameEvents` return value for use by callers

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix scheduleReconnect stale closure in useGameSocket** - `7715d1d` (fix)
2. **Task 2: Fix loading gate in useGameEvents to cover reconnecting state** - `89e9f88` (fix)

## Files Created/Modified
- `src/app/gameroom/hooks/useGameSocket.ts` - Added `initializeSocketRef`, rewrote `scheduleReconnect` to use functional state update and ref-based socket initialization call
- `src/app/gameroom/hooks/useGameEvents.ts` - Destructured `connectionStatus` from `useGameSocket`, updated loading effect, exposed `connectionStatus` in return value

## Decisions Made
- Used ref indirection (`initializeSocketRef`) rather than restructuring both callbacks — minimal invasive change that breaks the circular dependency cleanly
- Kept `scheduleReconnect`'s dependency array as `[]` — function is fully stable since it reads state via functional update and calls socket init via ref
- Used `!isConnected || connectionStatus === "reconnecting"` rather than just checking `connectionStatus !== "connected"` — more explicit and forward-compatible if new statuses are added

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- STATE-02 requirement is now fulfilled: players see `<Progress />` whenever connection is uncertain (disconnected or reconnecting)
- `connectionStatus` is available in `useGameEvents` callers for future UI status labels
- STATE-01 and STATE-03 (state sync request on reconnect) remain for subsequent plans in this phase

---
*Phase: 01-state-sync*
*Completed: 2026-02-26*
