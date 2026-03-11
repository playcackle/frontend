# Quiz Game Frontend

## What This Is

A real-time multiplayer quiz/trivia game platform built on Next.js 16 with Socket.IO. Players join game rooms, answer questions through a shared chat feed, and compete on live leaderboards. The platform serves returning players through a progression system and new players through onboarding. v1.0 shipped reliable state sync, readable chat feedback, user onboarding, and a rich player stats landing page.

## Core Value

Players must always know where they are in the game and what their actions mean — reliable state, readable feedback, and visible progress are what keep them coming back.

## Requirements

### Validated

- ✓ User authentication (signup, login, session persistence) — existing
- ✓ Lobby browser on home page — existing
- ✓ Game room joining via Lobby Manager backend — existing
- ✓ Real-time game state via Socket.IO (rounds, slots, scores) — existing
- ✓ Unified chat + answer feed (UnifiedMessages) — existing
- ✓ Bot Bob hint messages tracked and pinned — existing
- ✓ Leaderboard with animated rank changes — existing
- ✓ Performance mode toggle (reduced effects) — existing
- ✓ Round lifecycle events (new_round_started, round_over, game_over) — existing
- ✓ Client auto-recovers game state at round→intermission transition — v1.0
- ✓ Reconnecting indicator shown when game state is uncertain — v1.0
- ✓ Client recovers to correct game phase after WebSocket reconnection — v1.0
- ✓ Chat message type differentiation: correct answers, Bot Bob hints, duplicate attempts — v1.0
- ✓ New user onboarding walkthrough modal with screenshots, skippable, shown only once — v1.0
- ✓ Landing page player card with Progresjonsscore, high scores, playstyle dashboard, global leaderboard — v1.0

## Current Milestone: v1.1 Audit

**Goal:** Systematically audit the codebase across code quality, performance, architecture, and type safety — producing a prioritized findings report to drive v1.2 improvements.

**Target deliverables:**
- Code quality findings (duplication, complexity, component size, naming)
- Performance findings (re-renders, bundle size, slow paths, animation overhead)
- Architecture findings (hook boundaries, state management patterns, data flow)
- Type safety findings (any/unknown usage, missing types, unsafe assertions)
- Consolidated prioritized remediation report

### Active

- [ ] Audit codebase for code quality issues (duplication, complexity, naming, component size)
- [ ] Audit codebase for performance issues (re-renders, bundle size, slow paths)
- [ ] Audit codebase for architectural concerns (hook boundaries, state management, data flow)
- [ ] Audit codebase for type safety gaps (any/unknown, missing types, unsafe assertions)
- [ ] Produce consolidated findings report with prioritized remediation recommendations

### Out of Scope

- Backend game logic changes — frontend-only project, game server is external
- Mobile native app — web-first
- New game modes — scope limited to UX and reliability improvements
- Leaderboard filtering by friends — v2 social features deferred

## Context

**Current state (v1.0):** ~13,000 LOC TypeScript. Next.js 16 App Router, React 19, TypeScript, Jotai atoms, Socket.IO client 4.8, Supabase auth, Radix UI, GSAP for animations. See `.planning/codebase/` for full analysis.

**Real-time architecture:** Two separate WebSocket connections — `useGameSocket` for game events, `useChatSocket` for messaging. Game state stored in `gameStateAtom`; messages in `unifiedMessagesAtom`. Events flow through `useGameEvents` hook which updates atoms.

**State sync:** `round_over` and reconnect both emit `request_state_sync`; `lobby_state_sync` response delivers full game state. Client always lands in correct phase.

**Message types:** `UnifiedMessage.message_type` drives visual differentiation in `UnifiedMessages.tsx`. `getMessageTypeClass()` and `getMessageBadge()` handle all variants. CSS classes in `gameroom.module.css`.

**Progression:** Player stats (Progresjonsscore, category percentiles, high scores) are fetched from Supabase/backend at landing page load and displayed in the player card component.

## Constraints

- **Tech Stack**: Next.js 16 + React 19 + Jotai + Socket.IO — stay within existing stack
- **Backend**: Game server is external — frontend can only handle events and request state, not change game logic
- **Performance**: Animations must respect `performanceModeAtom` — no new animations that bypass the performance toggle

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `lobby_state_sync` event for state recovery | Already exists in event system — extend rather than add new events | ✓ Good — clean, no new backend events needed |
| Visual differentiation via existing `message_type` field | `UnifiedMessage` already categorizes messages — add styling layer | ✓ Good — zero schema changes |
| Player card data fetched from Supabase/backend at page load | Progression data already partially tracked server-side | ✓ Good — implemented in v1.0 |
| Use initializeSocketRef for circular useCallback dependency | Ref indirection breaks scheduleReconnect ↔ initializeSocket circular dep | ✓ Good — minimal invasive change |
| Functional setSocketState for async state reads | Eliminates stale closure risk in reconnect callbacks | ✓ Good — pattern adopted throughout hooks |
| Correct answers = neon green (not gold) | Consistent with slot tiles which use `--neon-green` for answered state | ✓ Good — coherent "green = success" visual language |
| Own failed answer = neutral (not blue) | `.ownFailedAnswerMessage` resets `.ownMessage` blue !important | ✓ Good — avoids confusing blue styling for wrong answers |

---
*Last updated: 2026-03-11 after v1.1 milestone start*
