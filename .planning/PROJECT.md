# Quiz Game Frontend

## What This Is

A real-time multiplayer quiz/trivia game platform built on Next.js 16 with Socket.IO. Players join game rooms, answer questions through a shared chat feed, and compete on live leaderboards. The platform serves returning players through a progression system and new players through onboarding.

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

### Active

- [ ] Fix round→intermission state sync: client recovers current game state automatically without rejoining
- [ ] Onboarding flow for new users: multi-step walkthrough with screenshots, skippable
- [ ] Landing page redesign: player card with Progresjonsscore, high scores (daily/weekly/monthly/yearly), playstyle dashboard with percentile per category, global leaderboard
- [ ] Chat message type differentiation: correct answers, Bot Bob hints, and duplicate/already-answered attempts visually distinguished via colors or animations

### Out of Scope

- Backend game logic changes — frontend-only project, game server is external
- Mobile native app — web-first
- New game modes — scope limited to UX and reliability improvements

## Context

**Codebase:** Next.js 16 App Router, React 19, TypeScript, Jotai atoms, Socket.IO client 4.8, Supabase auth, Radix UI, GSAP for animations. See `.planning/codebase/` for full analysis.

**Real-time architecture:** Two separate WebSocket connections — `useGameSocket` for game events, `useChatSocket` for messaging. Game state stored in `gameStateAtom`; messages in `unifiedMessagesAtom`. Events flow through `useGameEvents` hook which updates atoms.

**Known state sync issue:** The client loses current game state at round→intermission transition. The `round_over` event or the subsequent intermission state is not reaching the client cleanly, and there is no recovery path (no re-request mechanism). The existing `lobby_state_sync` event may be the hook for recovery.

**Message types:** The `UnifiedMessage` type already has a `message_type` field distinguishing `chat`, `answer_attempt`, `successful_answer`, `failed_answer`. Visual differentiation between these types needs to be surfaced in the UI.

**Progression:** Some player stats exist in the backend. The Progresjonsscore system and per-category percentile data need to be surfaced via new API endpoints and displayed on the landing page.

## Constraints

- **Tech Stack**: Next.js 16 + React 19 + Jotai + Socket.IO — stay within existing stack
- **Backend**: Game server is external — frontend can only handle events and request state, not change game logic
- **Performance**: Animations must respect `performanceModeAtom` — no new animations that bypass the performance toggle

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `lobby_state_sync` event for state recovery | Already exists in event system — extend rather than add new events | — Pending |
| Visual differentiation via existing `message_type` field | `UnifiedMessage` already categorizes messages — add styling layer | — Pending |
| Player card data fetched from Supabase/backend at page load | Progression data already partially tracked server-side | — Pending |

---
*Last updated: 2026-02-25 after initialization*
