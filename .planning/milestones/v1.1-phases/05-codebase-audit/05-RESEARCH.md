# Phase 5: Codebase Audit - Research

**Researched:** 2026-03-12
**Domain:** TypeScript / React / Next.js codebase analysis — static analysis, pattern review, direct source reading
**Confidence:** HIGH (all findings derived from direct source reading, not inference)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUDIT-01 | Codebase audited for code quality issues — duplication, oversized components, complexity hotspots, naming inconsistencies | Direct source reading identifies all targets; sound-effects.tsx (1448 LOC) is primary hotspot |
| AUDIT-02 | Codebase audited for performance issues — re-renders, bundle size, slow render paths, animation overhead bypassing performance mode | Direct DOM manipulation in useGameActions bypasses Jotai/React lifecycle; animation effects not performance-gated |
| AUDIT-03 | Codebase audited for architectural concerns — hook boundaries, state management patterns, data flow | Duplicate handler definitions in useGameEvents; dual socket architecture; leaderboard duplication between page.tsx and Leaderboard component |
| AUDIT-04 | Codebase audited for type safety gaps — any/unknown usage, missing return types, unsafe assertions | @ts-ignore×2 in utils.ts; data: any in game_over handler; as unknown cast in AnswerReveal; submit_answer: any in EventPayloadMap |
| AUDIT-05 | Findings consolidated into prioritized report with impact/effort ratings | This research provides the raw material; the plan must produce a single FINDINGS.md |
</phase_requirements>

---

## Summary

The codebase is a real-time multiplayer quiz game frontend (~13,000 LOC). It is built on Next.js 16, React 19, TypeScript with strict mode, Jotai for atoms, Socket.IO client, Supabase auth, Radix UI, and GSAP. v1.0 shipped four milestones across phases 1–4. The audit target is everything under `src/`.

The codebase is generally well-structured: atoms are granular, memoization is applied to the hottest render paths (SlotTile, SlotGrid, AnswerGrid, StatsRow all use `React.memo`), and socket reconnection uses the correct ref-indirection pattern. The largest risks are concentrated in a small number of specific files and patterns rather than being systemic.

The single biggest quality issue is `sound-effects.tsx` at 1,448 lines — nearly 10% of the entire codebase in one file. The most important architectural issue is handler duplication in `useGameEvents.ts`, where `handleLobbySyncRef` and `handleSubmissionFeedbackRef` are defined twice (once as initial ref values, once re-assigned inside a `useEffect`). The most important type safety issue is `as unknown as QuizAnswer` in `AnswerReveal.tsx`, which silences a genuine type mismatch where `Slot.id` is `string` but `QuizAnswer.id` is `number`.

**Primary recommendation:** Run the audit in four sequential passes — one per requirement dimension — and consolidate findings into a single FINDINGS.md with impact/effort scores before closing the phase.

---

## Codebase Inventory

### File Size Distribution

| File | LOC | Classification |
|------|-----|----------------|
| `src/components/sound-effects.tsx` | 1,448 | OVERSIZED — primary hotspot |
| `src/lib/api/admin.ts` | 913 | Large — admin API client |
| `src/app/admin/lobbies/[id]/page.tsx` | 758 | Large — admin page |
| `src/app/gameroom/hooks/useGameSocket.ts` | 320 | Acceptable — complex but cohesive |
| `src/app/gameroom/hooks/useGameEvents.ts` | 212 | Medium — has duplication |
| `src/app/gameroom/hooks/useGameActions.ts` | 179 | Medium — DOM manipulation hotspot |
| `src/app/gameroom/page.tsx` | 240 | Medium — has inline leaderboard |
| `src/app/gameroom/types/payloads.ts` | 231 | Medium — some dead types |
| Everything else | <200 | Within normal bounds |

### Directory Structure

```
src/
├── actions/              # Server actions: auth, joinGameroom
├── app/
│   ├── admin/            # Admin panel pages (out of game critical path)
│   ├── api/              # Next.js route handlers (proxy passthrough)
│   ├── auth/             # Supabase auth callback route
│   ├── collections/      # Collection management pages
│   ├── gameroom/         # PRIMARY — all game UI
│   │   ├── components/   # 14 components
│   │   ├── hooks/        # 6 hooks
│   │   ├── store/        # gameAtoms.ts (Jotai)
│   │   └── types/        # payloads.ts, state.ts
│   ├── gamerooms/        # Lobby browser
│   ├── leaderboard/      # Global leaderboard page
│   ├── login/            # Auth pages
│   ├── profile/          # Player profile page
│   ├── register/         # Auth pages
│   └── store/            # gameRoom.ts atom
├── atoms/                # performance-atom.ts (global)
├── components/           # Shared components (18 files)
├── contexts/             # performance-context.tsx
├── hooks/                # useUser.ts
├── lib/                  # supabase client/server, api clients, utils
├── styles/               # Global CSS
└── types/                # navigator.d.ts
```

---

## AUDIT-01: Code Quality Targets

### Oversized Components

**`src/components/sound-effects.tsx` — 1,448 lines**
This file contains: a Web Audio API singleton, audio context management, ~17 synthesized sound functions (each generating oscillators/filters/gain nodes programmatically), a global `playSoundEffect` function attached to `window`, a `SoundEffects` React component, and a `preloadSounds` function. It is one of the most complex files in the codebase and is almost entirely about audio DSP, not React. Splitting it into a pure audio module and a thin React component is the obvious remediation.

**`src/lib/api/admin.ts` — 913 lines**
A single class (`AdminApiClient`) with ~30+ methods grouped into categories (lobbies, collections, slots, topics, AI generation). Several return `Promise<any>`. Not a game-critical path — admin-only. Splitting by domain (lobby admin, content admin) would help navigability.

### Duplication

**Inline leaderboard in `page.tsx` (lines 197–233) vs `Leaderboard` component**
`GameroomPage` (gameroom/page.tsx) renders an inline leaderboard for the in-game state (not round-break) using raw JSX with `scores.slice(0, 10).map(...)`. The `Leaderboard` component (`LeaderBoard.tsx`) renders the round-break leaderboard. These share display logic (rank, name, score) but are implemented separately. The inline version has a dead `&& false` condition on line 211 (`player.display_name === "You" && false`) that nullifies nameFlash styling.

**`AccoladeChip` component defined in two places**
`PostGameShowcase.tsx` and `LeaderBoard.tsx` each define their own `AccoladeChip` local component with virtually identical popover-on-hover behavior and portal rendering. The only difference is one takes `accoladeType + count` props and one takes an `Accolade` object. A shared component would eliminate ~60 lines of duplication.

**`handleLobbySyncRef` and `handleSubmissionFeedbackRef` defined twice in `useGameEvents.ts`**
These refs are initialized with a handler function at declaration (lines 40–59, 135–149), then reassigned inside a `useEffect` with identical logic (lines 152–182). The initial ref value is overwritten on mount, making the initialization dead code.

### Naming Inconsistencies

- Component file is `LeaderBoard.tsx` (camelCase B) but the exported function is `Leaderboard` (lowercase b). Import in page.tsx uses `import Leaderboard from "./components/LeaderBoard"`.
- `src/app/gameroom/hooks/useChatWs.ts` — the "Ws" suffix is inconsistent with other hooks that use "Socket" (`useGameSocket`, `useChatSocket` is the exported name). File is `useChatWs.ts` but export is `useChatSocket`.
- `PostGameModal.tsx` exports `PostgameAccolades` (lowercase 'g' in Postgame). File name, export name, and component behavior description are all misaligned.
- `StatsRow` component has a `displayName` issue: `React.memo(...)` result is not assigned a display name.
- `SlotTile` accepts `isBonus`, `revealDelay`, `entranceDelay`, `className` props in its interface, but the component destructures only `slot` and `className` — the other props are declared but unused.

### Complexity Hotspots

**`useGameActions.triggerCorrectAnswerEffects`**
This function (~60 lines) does: DOM element lookup, creates and appends a `colorBurstOverlay` div to `document.body`, sets inline animation on a `.main` container, creates and appends a `successGlow` div to a slot element, updates Jotai state, applies CSS class animation, plays a sound, and schedules multiple `setTimeout` cleanups. It manages raw DOM manipulation alongside Jotai state updates, which creates testing difficulty and fragile cleanup logic.

**`useGameEvents` event registration pattern**
Event registration happens in a single `useEffect` with `[onEvent]` dependency (line 185–209), but `onEvent` returns a cleanup function that is never used — the `useEffect` never calls the returned cleanup. Socket listeners are never explicitly removed via the returned unsubscribe functions.

---

## AUDIT-02: Performance Targets

### Re-render Patterns

**`gameStateAtom` is a monolithic atom with derived selectors**
`gameAtoms.ts` correctly derives ~15 selector atoms from `gameStateAtom` (e.g., `slotsAtom`, `scoresAtom`, `timeRemainingAtom`). Most components use the derived atoms. However, `GameroomPage` still calls `useGameState()` (which subscribes to the full `gameStateAtom` via `useAtomValue(gameStateAtom)`) for `updateGameState` — this means the parent page re-renders on any state change. The `updateGameState` setter could be obtained via `useSetAtom(updateGameStateAtom)` without subscribing to state.

**`Leaderboard` uses `useGameState()` for `scores` and `accolades`**
`Leaderboard` calls `const { scores, accolades } = useGameState()` which subscribes to the full `gameStateAtom`. It should use `useAtomValue(scoresAtom)` and `useAtomValue(accoladesAtom)` for selective subscription. `scoresAtom` changes every `lobby_tick` (frequent). This component re-renders every tick even though it's only shown during round breaks.

**`PostGameShowcase` and `AnswerReveal` also use `useGameState()`**
Both call `const { ... } = useGameState()` instead of specific atom selectors. `PostGameShowcase` reads `scores` and `playerAccolades`. `AnswerReveal` reads `slots`.

**`messages.map((msg, index) => ... key={index})`**
`UnifiedMessages.tsx` uses array index as key. When messages are prepended or removed, React will unnecessarily re-render existing message elements. Using `msg.timestamp + msg.player_id` as key would be more stable (no unique ID exists on messages currently).

### Animation Overhead and Performance Mode Bypass

**`triggerCorrectAnswerEffects` does not check `performanceModeAtom`**
The correct-answer effects (colorBurstOverlay, successGlow, screen shake, CSS animations) are triggered unconditionally regardless of performance mode setting. The `performanceModeAtom` exists but is not consulted by `useGameActions`. The constraint from PROJECT.md states: "Animations must respect `performanceModeAtom` — no new animations that bypass the performance toggle."

**`sound-effects.tsx` does not check performance mode**
Sound playback (`playSound`) does not gate on `performanceModeAtom`. Whether sounds should be suppressed in performance mode is a product decision, but the gap should be documented.

**`debouncedLobbyTick` is 50ms, `sendEvent` is 100ms**
These are reasonable values. No evidence that current debounce delays are causing visible lag.

### Bundle Characteristics

**`sound-effects.tsx` is ~1,448 lines of Web Audio API code loaded in the game route**
It is imported in `page.tsx` as `import SoundEffects from "@/components/sound-effects"`. There is no dynamic import or lazy loading. On initial page load, all audio synthesis code is parsed and executed.

**`animate.css` is listed as a dependency (`"animate.css": "latest"`)**
The game uses `animate__animated animate__bounce` etc. class names (see `getRandomAttentionAnimation` in utils.ts and `useGameActions`). The `latest` version specifier is a risk — unpinned.

**`canvas-confetti` and `gsap` are runtime dependencies**
`canvas-confetti` is used in `PostGameModal.tsx`. `gsap` is in dependencies but grep does not find direct import in reviewed files — may be used elsewhere or may be an unused dependency.

### Slow Render Paths

**`AnswerReveal` creates N `setTimeout` calls on each `answers` change**
Each time `slots` updates (which happens on lobby_sync), all N timeouts are created via `answers.forEach((answer, index) => { setTimeout(..., index * 400) })`. If slots change mid-reveal, old timeouts are not cleared — the `useEffect` cleanup only calls `setVisibleAnswers([])` but does not cancel the pending timeouts. This could cause stale state updates after unmount.

**`PostGameModal` generates random `color` per player on `getTopAccolades` re-call**
`getTopAccolades(accolades)` is called inside `useState` initializer and potentially on re-render. `color: COLORS[Math.floor(Math.random() * COLORS.length)]` means player colors change on re-render. This is a minor cosmetic bug but also a memoization gap.

---

## AUDIT-03: Architecture Targets

### Hook Boundary Issues

**`GameroomPage` calls hooks conditionally / after an early return**
In `gameroom/page.tsx`, `useGameEvents` and `useChatSocket` are called (lines 105, 112) AFTER the early return guard `if (!gameroom) { return <div>Loading gameroom...</div>; }` on line 100. This violates the Rules of Hooks — hooks must not be called after a conditional return. This is a real bug.

```
// Line 100 — early return:
if (!gameroom) { return <div>Loading gameroom...</div>; }

// Lines 105–115 — hooks called after early return:
const { sendEvent } = useGameEvents(...)
const { sendMessage: sendChatMessage } = useChatSocket(...)
```

**`getBaseWsUrl` helper defined inline in the component**
Lines 108–110 define a URL transformation function inside the component body. It is a pure function with no closure dependencies and belongs in `utils.ts`.

**`useGameState` spreads entire `GameState` into return value**
`useGameState()` returns `{ ...gameState, updateGameState, resetGameState, gameState }`. Consumers that destructure from it receive all state properties, which means they subscribe to the full `gameStateAtom`. This is the root cause of the re-render issue described under AUDIT-02.

### State Management Anti-Patterns

**`animationStateAtom` initial value duplicated**
`gameAtoms.ts` defines the initial animation state object inline at atom creation (line 70–81) and duplicates it again inside `resetGameStateAtom` (lines 109–121). These should share a named constant.

**`performanceModeAtom` vs `PerformanceContext`**
Two separate performance mode systems exist in parallel:
- `src/atoms/performance-atom.ts` — Jotai `atomWithStorage` approach (used by `PerformanceInitializer`, `PerformanceModal`, `PerformanceToggle`)
- `src/contexts/performance-context.tsx` — React Context approach (exported `PerformanceProvider` and `usePerformance`)

Both write to `localStorage` (different keys: `triviabox-performance-mode` vs `performanceMode`). Both apply/remove the `performance-mode` class on `document.body`. These are parallel systems that could conflict. The Jotai approach appears to be the authoritative one (used in the initializer component and settings); the Context approach may be legacy.

**`addUnifiedMessageAtom` does Bot Bob detection by string match**
`gameAtoms.ts` line 132–136 detects Bot Bob by `message.player_id === "botbob" || message.display_name.toLowerCase() === "botbob"`. The same detection logic appears identically in `UnifiedMessages.tsx` (lines 42–46) and in `utils.ts` `getPlayerAvatar` (lines 133–134). This string "botbob" is repeated across three files with no shared constant.

### Data Flow Clarity

**Dual WebSocket connections share the same Jotai atom store**
`useGameSocket` manages game events, `useChatSocket` manages chat. Both ultimately write to atoms in `gameAtoms.ts`. The game socket writes game state; the chat socket calls `addUnifiedMessageAtom`. This separation is intentional and documented, but the boundary is implicit — there is no clear contract defining "which socket owns which atoms."

**`sendEvent` is debounced at the call-site AND inside `useGameSocket`**
`useGameActions.submitAnswer` calls `sendEvent("submit_answer", answer)`, where `sendEvent` is already a debounced function (100ms debounce defined in `useGameSocket`). The debounce is applied once inside the hook. No double-debouncing issue, but the debounce is non-obvious to callers.

---

## AUDIT-04: Type Safety Targets

### `@ts-ignore` Usage

**`src/app/gameroom/utils.ts` — lines 59 and 61**
```typescript
// @ts-ignore
if (window.playSoundEffect) {
  // @ts-ignore
  window.playSoundEffect(type);
}
```
`window.playSoundEffect` is set by `sound-effects.tsx` (line 1432: `(window as any).playSoundEffect = playSound`). The correct fix is to extend the `Window` interface in a `.d.ts` file. There is already `src/types/navigator.d.ts` — a `Window` extension should go alongside it.

### `as any` Usage

| Location | Pattern | Risk |
|----------|---------|------|
| `useGameEvents.ts:77` | `(sendEventRef.current as (e: string, d: any) => void)("request_state_sync", undefined)` | Bypasses `EventPayloadMap` type check for `request_state_sync` (not in map) |
| `useGameEvents.ts:199` | `onEvent("game_over", (data: any) => ...)` | `game_over` is in `EventPayloadMap` as `GameOverPayload` — should be typed |
| `useGameSocket.ts:214` | `socket.on(eventName, (data: any) => ...)` | Generic socket handler, acceptable but could use `EventPayloadMap` |
| `useGameSocket.ts:63` | `debounce((message: string, error?: any) => ...)` | `error` typed as `any` — should be `unknown` per strict-mode intent |
| `useGameActions.ts:72` | `setAnimationWithTimeout(animationUpdate: any, ...)` | Should be `Partial<AnimationState>` |
| `useGameState.ts:40` | `triggerAnimation(type: string, value: any)` | Should use `keyof AnimationState` for `type` and derived value type |
| `lib/api/admin.ts` | Multiple `Promise<any>` return types (lines 658, 674, 691, 710, 726, 742) | Admin API responses untyped |
| `app/api/admin/[...path]/route.ts:21` | `const params = context.params as any` | Route params cast — could use Next.js typed route params |
| `app/api/players/[...path]/route.ts:9` | Same pattern | Same issue |

### `as unknown as` Unsafe Assertions

**`AnswerReveal.tsx:30` — `as unknown as QuizAnswer`**
```typescript
({
  id: x.id,           // x.id is string (Slot.id: string)
  answer: x.canonical_text,
  isRare: x.is_rare,
  isAnswered: x.is_snapped,
  answeredBy: x.snapped_by_display_name,
} as unknown as QuizAnswer)
```
`QuizAnswer` has `id: number` but `Slot.id` is `string`. The double assertion hides a genuine type mismatch. `visibleAnswers` is `number[]` and is compared via `.includes(x.id)` — the comparison always fails because `x.id` after the assertion is still a string at runtime. This is likely a latent bug: answers never animate into view because `visibleAnswers.includes(x.id)` compares `number[]` against a `string`.

### `EventPayloadMap` Type Gap

**`submit_answer: any` in payloads.ts line 204**
`submit_answer` is in `GameEvent` union but `EventPayloadMap["submit_answer"]` is `any`. The correct type is `string` (the answer text). This makes `sendEvent("submit_answer", answer)` untyped.

### Missing Return Types

**`useGameState.ts` — `triggerAnimation` and `clearAnimation`**
Both have parameter `value: any` and no return type annotation. The functions are thin wrappers but establishing the types would surface the `AnimationState` key constraint.

**`useGameEvents.ts` — module-level ref handler functions**
`handleLobbySyncRef`, `handleRoundOverRef`, etc. are initialized as `useRef(...)` with inline handler functions that are untyped (TypeScript infers from usage, but explicit parameter types would improve readability and catch regressions).

### `unknown` Usage Legitimately Flagged

`lib/api/admin.ts:546` uses `metadata: Record<string, unknown>` — this is the correct pattern for unknown shape data. Not a risk.

---

## Architecture Diagram: Data Flow

```
Backend WS (game namespace)
  └─► useGameSocket → onEvent/sendEvent API
        └─► useGameEvents (subscribes to all events)
              ├─► updateGameState (writes gameStateAtom)
              └─► triggerCorrectAnswerEffects (useGameActions)
                    ├─► updateAnimationStateAtom
                    └─► DOM manipulation (document.getElementById)

Backend WS (chat namespace)
  └─► useChatSocket → addUnifiedMessageAtom (writes unifiedMessagesAtom)

Jotai store (gameAtoms.ts)
  ├─► gameStateAtom (monolithic, ~15 derived selectors)
  ├─► unifiedMessagesAtom (message list)
  ├─► animationStateAtom (animation flags)
  └─► botBobLastMessageAtom (pinned message)

GameroomPage (page.tsx)
  ├─► subscribes to 8 derived atoms + useGameState() (full atom)
  ├─► renders SlotGrid → slotsAtom (direct)
  ├─► renders StatsRow → 7 derived atoms (correct pattern)
  ├─► renders Leaderboard → useGameState() (full atom - issue)
  └─► renders inline leaderboard (duplication)
```

---

## Concrete Findings Summary (Pre-prioritization)

### HIGH IMPACT findings

| Finding | File | Category |
|---------|------|----------|
| Hooks called after conditional return (Rules of Hooks violation) | `gameroom/page.tsx:105,112` | Architecture |
| `AnswerReveal` type mismatch causes answer reveal animation to never fire | `components/AnswerReveal.tsx:30` | Type Safety + Bug |
| `triggerCorrectAnswerEffects` bypasses `performanceModeAtom` | `hooks/useGameActions.ts` | Performance |
| `sound-effects.tsx` is 1,448 lines, no code splitting | `components/sound-effects.tsx` | Code Quality + Bundle |
| Dual performance mode systems (atoms vs Context) conflict on different localStorage keys | `atoms/performance-atom.ts` vs `contexts/performance-context.tsx` | Architecture |

### MEDIUM IMPACT findings

| Finding | File | Category |
|---------|------|----------|
| `Leaderboard` / `PostGameShowcase` / `AnswerReveal` subscribe to full `gameStateAtom` via `useGameState()` | Multiple | Performance |
| Handler duplication in `useGameEvents` (defined twice) | `hooks/useGameEvents.ts:40-59, 152-183` | Code Quality |
| `game_over` handler types as `any` | `hooks/useGameEvents.ts:199` | Type Safety |
| `AccoladeChip` duplicated in `PostGameShowcase` and `LeaderBoard` | Both files | Code Quality |
| `getBaseWsUrl` inline helper in page component | `gameroom/page.tsx:108-110` | Code Quality |
| `submit_answer` typed as `any` in EventPayloadMap | `types/payloads.ts:204` | Type Safety |
| Dead `&& false` in inline leaderboard nameFlash | `gameroom/page.tsx:211` | Code Quality |

### LOW IMPACT findings

| Finding | File | Category |
|---------|------|----------|
| `@ts-ignore` on `window.playSoundEffect` — fixable with Window extension | `gameroom/utils.ts:59,61` | Type Safety |
| `animationStateAtom` initial value duplicated | `gameAtoms.ts:70-81, 109-121` | Code Quality |
| "botbob" string scattered across three files | `gameAtoms.ts`, `UnifiedMessages.tsx`, `utils.ts` | Code Quality |
| `SlotTile` interface declares `isBonus`, `revealDelay`, `entranceDelay` but only `slot`+`className` destructured | `components/SlotTile.tsx:11-16` | Code Quality |
| `LeaderBoard.tsx` filename vs `Leaderboard` export name inconsistency | `components/LeaderBoard.tsx` | Naming |
| `useChatWs.ts` file vs `useChatSocket` export name inconsistency | `hooks/useChatWs.ts` | Naming |
| `PostGameModal.tsx` exports `PostgameAccolades` (case mismatch) | `components/PostGameModal.tsx` | Naming |
| `gsap` in dependencies but not found in reviewed files | `package.json` | Code Quality |
| `animate.css: "latest"` unpinned version | `package.json` | Code Quality |
| `onEvent` cleanup return value not used in `useGameEvents` | `hooks/useGameEvents.ts:185-209` | Architecture |
| `messages.map` uses index as key in `UnifiedMessages` | `components/UnifiedMessages.tsx:76` | Performance |
| `AnswerReveal` timeouts not cleared on re-trigger | `components/AnswerReveal.tsx:41-49` | Performance |
| `PostGameModal.getTopAccolades` generates random colors on re-call | `components/PostGameModal.tsx:50` | Performance |
| Multiple `Promise<any>` return types in admin API | `lib/api/admin.ts` | Type Safety |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Type-safe window extension | @ts-ignore suppression | Extend `Window` interface in `src/types/window.d.ts` |
| Shared AccoladeChip component | Duplicate implementations | Extract to `src/app/gameroom/components/AccoladeChip.tsx` |
| Performance mode gating | New conditional logic | Read `performanceModeAtom` at call site |

---

## Standard Stack

This is an audit phase — no new libraries are being added. The stack is:

| Library | Version in use | Relevance to Audit |
|---------|---------------|-------------------|
| TypeScript | ^5 | Strict mode enabled — `any` is a real gap |
| Jotai | ^2.15.2 | `atomWithStorage`, derived atoms, write-only atoms |
| React | 19.2.1 | Rules of Hooks violations are real |
| Next.js | ^16.0.10 | App Router; server/client boundary is in scope |
| Socket.IO client | ^4.8.1 | Two connections; cleanup pattern matters |
| GSAP | ^3.13.0 | In dependencies but usage not confirmed in reviewed files |

**Tools available for audit execution (no install needed):**
```bash
npx tsc --noEmit        # Type check — catches type gaps
npx next build          # Bundle analysis (check .next/analyze if configured)
npm run lint            # ESLint
```

---

## Audit Execution Strategy

The plan should organize work as four sequential passes, each producing a section of FINDINGS.md:

### Pass 1 — Code Quality (AUDIT-01)
- Read all components in `src/app/gameroom/components/`
- Read all hooks in `src/app/gameroom/hooks/`
- Read `src/components/` shared components
- Document: oversized files, duplicate logic, naming inconsistencies, dead code

### Pass 2 — Performance (AUDIT-02)
- For each component, check: which atom subscriptions? `React.memo`? unnecessary re-renders?
- Check every animation trigger for `performanceModeAtom` gate
- Check `useEffect` cleanup correctness (timers, subscriptions)
- Check bundle: dynamic imports? `latest` versions? unused deps?

### Pass 3 — Architecture (AUDIT-03)
- Trace data flow: socket → event handler → atom → component
- Verify hook call order (Rules of Hooks)
- Check for duplicate systems (performance mode two implementations)
- Map atom ownership: which hook/component is "responsible" for each atom?

### Pass 4 — Type Safety (AUDIT-04)
- Run `npx tsc --noEmit` and capture output
- Grep for `any`, `@ts-ignore`, `as unknown`, `as any`
- Check `EventPayloadMap` completeness
- Check all function signatures for missing return types on public APIs

### Pass 5 — Consolidation (AUDIT-05)
- Write `FINDINGS.md` in `.planning/phases/05-codebase-audit/`
- Rate each finding: Impact (HIGH/MEDIUM/LOW) × Effort (HIGH/MEDIUM/LOW)
- Sort by impact/effort ratio (quick wins first)
- Group by dimension for v1.2 sprint planning

---

## Common Pitfalls for This Audit

### Pitfall 1: Confusing React.memo with full re-render prevention
`SlotGrid`, `AnswerGrid`, `StatsRow` are wrapped in `React.memo`. However, if their parent (`GameroomPage`) re-renders on every `lobby_tick` (which it does, because it calls `useGameState()` which subscribes to `gameStateAtom`), `React.memo` only prevents re-render if props are shallowly equal. Since these children receive no props from `gameStateAtom`, they are protected. But any parent state (e.g., `playerAnimations` `useState`) will still cascade.

### Pitfall 2: Treating the hooks-after-return as a lint warning
The `useGameEvents` and `useChatSocket` calls after the `if (!gameroom) return` in `page.tsx` are a Rules of Hooks violation. React's linter should catch this. If it doesn't appear in `npm run lint`, that warrants investigation — it may mean the ESLint React hooks plugin is not configured.

### Pitfall 3: Assuming `as unknown as T` is always wrong
`AnswerReveal.tsx` uses `as unknown as QuizAnswer` but the underlying type mismatch (string vs number id) is a real bug. In `PostGameShowcase.tsx` line 91, `scores as Array<{...rank?: number}>` is a softer cast to add an optional field — not a mismatch. Distinguish between type widening (often OK) and type assertion hiding mismatches (always bad).

### Pitfall 4: Treating the dual performance mode systems as equivalent
`performance-atom.ts` and `performance-context.tsx` use different localStorage keys (`triviabox-performance-mode` vs `performanceMode`). A user who had performance mode enabled before the atom approach was introduced might have the old `performanceMode` key set but not the new one. Auditing which one is actually authoritative in practice requires checking which one is consumed by `PerformanceInitializer` and `PerformanceModal`.

---

## Validation Architecture

`workflow.nyquist_validation` is not present in `.planning/config.json`. Treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files, no test directories, no test scripts in package.json |
| Config file | None |
| Quick run command | N/A |
| Full suite command | `npx tsc --noEmit && npm run lint` (closest to automated validation) |

### Phase Requirements vs Automated Checks

| Req ID | Behavior | Test Type | Automated Command | Infrastructure Exists? |
|--------|----------|-----------|-------------------|------------------------|
| AUDIT-01 | Code quality findings documented | Manual review + file output | `npm run lint` (partial) | Partial (ESLint only) |
| AUDIT-02 | Performance findings documented | Manual review + file output | `npx tsc --noEmit` | Partial |
| AUDIT-03 | Architecture findings documented | Manual review + file output | `npm run lint` (hooks rules) | Partial |
| AUDIT-04 | Type safety findings documented | Static analysis | `npx tsc --noEmit` | YES |
| AUDIT-05 | FINDINGS.md exists with rated items | File existence | N/A | N/A |

### Wave 0 Gaps

No unit tests are needed for this phase — it is an analysis deliverable, not a feature build. The phase gate is: `FINDINGS.md` exists in `.planning/phases/05-codebase-audit/` and contains rated findings for all five dimensions.

The closest to automated validation for the deliverable:
```bash
# Verify TypeScript has no new errors after audit work:
npx tsc --noEmit

# Verify lint passes:
npm run lint
```

---

## Sources

### Primary (HIGH confidence)
- Direct source reading of all files listed in the Codebase Inventory — all findings are code-level observations, not inference
- `tsconfig.json` — confirmed `strict: true`
- `package.json` — confirmed all dependency versions

### Secondary (MEDIUM confidence)
- React documentation (Rules of Hooks) — hooks after conditional returns are definitively violations

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Code quality findings: HIGH — direct source observations
- Performance findings: HIGH — direct source observations; re-render risk is verified by atom subscription patterns
- Architecture findings: HIGH — direct source observations; the hooks-after-return bug is confirmed by reading the file
- Type safety findings: HIGH — all `any` and `@ts-ignore` usages enumerated via grep + source reading
- GSAP usage: LOW — in dependencies but not found in reviewed files; may be used in unreviewed files or may be unused

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (codebase is stable; no active development concurrent with audit)
