---
phase: 02-chat-ux
plan: "01"
subsystem: ui
tags: [css-modules, chat, message-types, visual-differentiation, performance-mode]

# Dependency graph
requires: []
provides:
  - ".botBobMessage CSS class for Bot Bob scrolling feed rows (purple-teal, distinct from .chatMessage)"
  - ".duplicateMessage CSS class for already-snapped attempts (muted amber)"
  - ".ownSuccessfulAnswerMessage combined class for own correct answers (gold !important overrides)"
  - ".messageBadge base and four modifier classes (Bot, Correct, Taken, Miss)"
  - "Performance mode guards for successfulAnswerMessage and botBobMessage animations"
affects:
  - "02-02 — UnifiedMessages.tsx TypeScript logic will reference these classes via CSS Modules"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS Modules class per message type — extend existing getMessageTypeClass() pattern"
    - "Combined class (.ownSuccessfulAnswerMessage) pattern to override !important specificity conflicts"
    - ":global(.performance-mode) CSS guard pattern for conditional animation suppression"

key-files:
  created: []
  modified:
    - "src/app/gameroom/gameroom.module.css"

key-decisions:
  - "Use var(--neon-purple) CSS variable for botBobMessage border (not hardcoded #B700FF) for consistency"
  - "Use .ownSuccessfulAnswerMessage combined class with !important to win over .ownMessage !important — safer than removing !important from .ownMessage"
  - "Keep .chatMessage border-left-color unchanged (both .chatMessage and .botBobMessage use purple) — botBobMessage is differentiated via higher background opacity (0.12 vs 0.05)"

patterns-established:
  - "Pattern 1: Badge modifier classes (.messageBadgeBot, .messageBadgeCorrect, .messageBadgeDuplicate, .messageBadgeFailed) follow base + modifier CSS Modules pattern"
  - "Pattern 2: Performance mode guard uses :global(.performance-mode) selector to disable animations at the CSS layer without React-level atom reads"

requirements-completed: [CHAT-01, CHAT-02, CHAT-03]

# Metrics
duration: 1min
completed: 2026-02-27
---

# Phase 2 Plan 01: Chat UX CSS Classes Summary

**Nine CSS classes for message-type visual differentiation — Bot Bob feed rows, duplicate attempts, correct-answer badges, and performance-mode animation guards — appended to gameroom.module.css without modifying existing classes**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-27T11:41:09Z
- **Completed:** 2026-02-27T11:42:03Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `.botBobMessage` with purple-teal background (rgba 0.12) and inset glow — visually distinct from plain `.chatMessage` (rgba 0.05) despite sharing the purple hue
- Added `.duplicateMessage` with muted amber treatment (border #FF8C00, opacity 0.75) to distinguish already-snapped attempts from wrong answers
- Added `.ownSuccessfulAnswerMessage` combined class using `!important` to ensure gold glow wins over blue `.ownMessage !important` overrides (Pitfall 4 from RESEARCH.md)
- Added `.messageBadge` base class and four modifier classes for text badges (BOT, CORRECT, TAKEN, MISS)
- Added `:global(.performance-mode)` guards to suppress animations on `.successfulAnswerMessage` and `.botBobMessage` when performance mode is active

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Bot Bob, duplicate, and badge CSS classes to gameroom.module.css** - `2f49c38` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/app/gameroom/gameroom.module.css` - Added 84 lines: 9 new CSS class definitions + 2 performance-mode guards

## Decisions Made

- Used `var(--neon-purple)` for `.botBobMessage` border per plan specification (consistent with CSS variable convention)
- Used `.ownSuccessfulAnswerMessage` combined class with `!important` overrides rather than removing `!important` from `.ownMessage` — the safer, non-breaking approach
- Badge classes use `inline-flex` with `align-items: center` for proper vertical alignment with message text

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All CSS classes are ready for Plan 02-02 which will implement the TypeScript logic in `UnifiedMessages.tsx`
- `getMessageTypeClass()` can now reference `styles.botBobMessage`, `styles.duplicateMessage`, `styles.ownSuccessfulAnswerMessage`
- Badge classes ready for `getMessageBadge()` helper implementation in Plan 02-02
- No blockers

---
*Phase: 02-chat-ux*
*Completed: 2026-02-27*
