# Phase 05 Plan 01: Audit Pass 1 & 2 — Findings Draft

**Audit date:** 2026-03-12
**Scope:** Code Quality (AUDIT-01) and Performance (AUDIT-02)
**Method:** Direct source reading — all findings verified against actual file contents.
**Status:** Draft — to be consumed by Plan 02 for final consolidation.

---

## Code Quality

### Oversized Components

**[FINDING-Q01]** `src/components/sound-effects.tsx:1–1448` — File is 1,448 lines. Contains a Web Audio API singleton, AudioContext lifecycle management, ~17 synthesized sound generator functions (each manually wiring oscillators, filters, and gain nodes), a global `playSoundEffect` window assignment, and a thin React `SoundEffects` component. Nearly 10% of the entire codebase in a single file. Audio DSP code is entirely non-React and should live in a pure module.
Impact: HIGH
Effort: MEDIUM
Remediation: Extract all audio synthesis functions and the `AudioContext` singleton into `src/lib/audio/sound-engine.ts`. Keep `SoundEffects` component in `src/components/sound-effects.tsx` as a thin wrapper (~30 lines). Apply `dynamic(() => import("./SoundEffects"), { ssr: false })` at the import site in `page.tsx` to enable code splitting.

**[FINDING-Q02]** `src/lib/api/admin.ts:1–913` — File is 913 lines. A single `AdminApiClient` class with ~30+ methods spanning lobby management, collection management, slot management, topic management, and AI generation. Several methods return `Promise<any>` (lines 658, 674, 691, 710, 726, 742). Not on the game-critical path but difficult to navigate.
Impact: MEDIUM
Effort: MEDIUM
Remediation: Split into domain-specific clients: `LobbyAdminClient`, `ContentAdminClient`, `AIAdminClient`. Extract typed response interfaces for each method group. Replace `Promise<any>` return types with concrete response interfaces.

---

### Duplication

**[FINDING-Q03]** `src/app/gameroom/page.tsx:198–233` vs `src/app/gameroom/components/LeaderBoard.tsx` — Inline in-game leaderboard (lines 198–233 of page.tsx) and the `Leaderboard` component share identical display logic: rank number, display name, score. The inline version renders `scores.slice(0, 10).map(...)` directly in JSX. The `Leaderboard` component renders the round-break variant. Approximately 35 lines of duplicated layout logic. Additionally, the inline version has a dead `&& false` condition on line 210.
Impact: MEDIUM
Effort: LOW
Remediation: Extract a shared `LeaderboardRow` component. Pass a `compact` prop to control whether rank-change animations and accolades are shown. Remove the `&& false` dead condition.

**[FINDING-Q04]** `src/app/gameroom/components/PostGameShowcase.tsx:20–75` and `src/app/gameroom/components/LeaderBoard.tsx:34–82` — Both files define a local `AccoladeChip` function component with nearly identical structure: `showPopover` state, `popoverPosition` state, `chipRef`, `isMounted` state, `useEffect` for mount, `useEffect` for position calculation on hover, and `createPortal` rendering. The only difference is prop shape (`{ accoladeType: string; count: number }` vs `{ accolade: Accolade }`). Approximately 60 lines of duplicated component logic.
Impact: MEDIUM
Effort: LOW
Remediation: Extract to `src/app/gameroom/components/AccoladeChip.tsx` with a unified prop interface. Both files import from the shared component.

**[FINDING-Q05]** `src/app/gameroom/hooks/useGameEvents.ts:40–59` and `src/app/gameroom/hooks/useGameEvents.ts:151–182` — `handleLobbySyncRef` is initialized with a handler function at declaration (lines 40–59) then reassigned inside a `useEffect` at lines 152–172 with nearly identical logic. `handleSubmissionFeedbackRef` is similarly initialized at lines 135–149 and reassigned at lines 174–181. The initial ref value is overwritten on first mount, making the initialization dead code. Confirmed: both initial handler bodies and useEffect-assigned bodies are substantively the same, with only a minor difference (`roundName: data.topic_name || ""` initial vs `roundName: data.topic_name` in useEffect).
Impact: MEDIUM
Effort: LOW
Remediation: Remove the inline handler from the `useRef(...)` call, initializing as `useRef<(data: LobbySyncPayload) => void>(null!)`. Assign the handler exclusively inside the `useEffect` where the correct closure captures `updateGameState` and `triggerCorrectAnswerEffects`.

---

### Naming Inconsistencies

**[FINDING-Q06]** `src/app/gameroom/components/LeaderBoard.tsx:84` — Filename is `LeaderBoard.tsx` (camelCase capital B) but the exported function is `Leaderboard` (lowercase b). Import in `page.tsx` line 22: `import Leaderboard from "./components/LeaderBoard"`. The filename does not match the export name.
Impact: LOW
Effort: LOW
Remediation: Rename file to `Leaderboard.tsx` to match the export name. Update the import in `page.tsx`.

**[FINDING-Q07]** `src/app/gameroom/hooks/useChatWs.ts:19` — File is named `useChatWs.ts` but exports `useChatSocket`. Import in `page.tsx` line 25: `import { useChatSocket } from "./hooks/useChatWs"`. The "Ws" suffix is inconsistent with the exported name and with other hooks that use "Socket" (`useGameSocket.ts`).
Impact: LOW
Effort: LOW
Remediation: Rename file to `useChatSocket.ts`. Update the import in `page.tsx`.

**[FINDING-Q08]** `src/app/gameroom/components/PostGameModal.tsx:56` — File is named `PostGameModal.tsx` but exports `PostgameAccolades` (lowercase 'g' in Postgame). The component name does not align with the filename, and the component does not function as a modal in the generic sense — it is a slideshow. Import in `PostGameShowcase.tsx` line 11: `import PostgameAccolades from "./PostGameModal"`.
Impact: LOW
Effort: LOW
Remediation: Rename file to `PostgameAccolades.tsx` and the export to `PostgameAccolades`. Or rename to `PostGameAccoladesSlideshow.tsx` to better reflect the component's behavior.

**[FINDING-Q09]** `src/app/gameroom/components/SlotTile.tsx:10–16` — Interface `SlotTileProps` declares `isBonus?: boolean`, `revealDelay: number`, and `entranceDelay: string` as props. The component function destructures only `{ slot, className }` (line 18). The three declared props are never used. The `React.memo` comparator on lines 117–128 references `prevProps.revealDelay` and `prevProps.entranceDelay`, creating an inconsistency: the comparator checks props that the component ignores.
Impact: LOW
Effort: LOW
Remediation: Remove `isBonus`, `revealDelay`, and `entranceDelay` from the interface and from the `React.memo` comparator. Use `slot.is_rare` directly (already done in the component body).

---

### Dead Code

**[FINDING-Q10]** `src/app/gameroom/page.tsx:210` — Expression `player.display_name === "You" && false` is always `false`. The intended `nameFlash` styling is permanently disabled. This is dead conditional logic masking a broken feature.
Impact: LOW
Effort: LOW
Remediation: Remove the `&& false`. Implement proper "current player" detection using the authenticated user's display name or player ID from `useUser()`. If nameFlash styling is intentionally disabled, remove the entire ternary rather than leaving `&& false` in the code.

**[FINDING-Q11]** `src/app/gameroom/hooks/useGameEvents.ts:40–59` and `src/app/gameroom/hooks/useGameEvents.ts:135–149` — Initial ref values for `handleLobbySyncRef` and `handleSubmissionFeedbackRef` constitute dead code because the `useEffect` at line 151 overwrites both refs before the component can process any events. The stale initial handler for `handleLobbySyncRef` also uses `data.topic_name || ""` while the useEffect version uses `data.topic_name` (omitting the `|| ""`), introducing a subtle inconsistency. (Also tracked in FINDING-Q05 as duplication.)
Impact: LOW
Effort: LOW
Remediation: See FINDING-Q05 remediation.

---

### Complexity Hotspots

**[FINDING-Q12]** `src/app/gameroom/hooks/useGameActions.ts:86–162` — `triggerCorrectAnswerEffects` (~60 lines) performs DOM mutations (creates `colorBurstOverlay` div, appends to `document.body`), sets inline `style.animation` on a `.main` container, creates `successGlow` div and appends to a slot element, updates Jotai state via `updateAnimationState`, calls `applyDOMAnimation`, calls `playSound`, and schedules 3 separate `setTimeout` callbacks for cleanup. The function mixes DOM imperative manipulation with React state updates, making it fragile to test and prone to memory leaks if slots unmount before timeouts complete.
Impact: HIGH
Effort: MEDIUM
Remediation: Gate all DOM effects on `performanceModeAtom` (see FINDING-P01). Extract `colorBurstOverlay` and `successGlow` into CSS-class-based animations on React state rather than manual DOM injection. Use a single `AbortController`-style cleanup ref to cancel all pending timeouts on re-trigger.

**[FINDING-Q13]** `src/app/gameroom/hooks/useGameEvents.ts:185–209` — The `useEffect` block registers 9 socket event handlers via `onEvent`. The `onEvent` function returns a cleanup function (an unsubscribe callback) but the `useEffect` body never captures these return values and does not call them in cleanup. Socket listeners are therefore never explicitly removed. The `useEffect` also has only `[onEvent]` in its dependency array, so if `onEvent` referentially changes, old listeners accumulate without being removed.
Impact: MEDIUM
Effort: LOW
Remediation: Capture the cleanup callbacks returned by each `onEvent` call and call them in the `useEffect` cleanup. Example: `const cleanups = [onEvent("lobby_state_sync", ...), ...]; return () => cleanups.forEach(fn => fn?.());`

---

## Performance

### Re-render Patterns

**[FINDING-P01]** `src/app/gameroom/components/LeaderBoard.tsx:85` — `Leaderboard` calls `const { scores, accolades } = useGameState()` which calls `useAtomValue(gameStateAtom)`, subscribing to the full monolithic game state atom. `scoresAtom` and `accoladesAtom` are already defined as derived selectors in `gameAtoms.ts` (lines 56–57). The component re-renders on any `gameStateAtom` change, including `timeRemaining` ticks from `lobby_tick` events — even though `Leaderboard` is only shown during round breaks when `isRoundBreak === true`.
Impact: MEDIUM
Effort: LOW
Remediation: Replace `useGameState()` with `const scores = useAtomValue(scoresAtom)` and `const accolades = useAtomValue(accoladesAtom)`. This isolates re-renders to only when scores or accolades change.

**[FINDING-P02]** `src/app/gameroom/components/AnswerReveal.tsx:19` — `AnswerReveal` calls `const { slots } = useGameState()` which subscribes to the full `gameStateAtom`. `slotsAtom` is already defined as a derived selector. Additionally, `AnswerReveal` is only shown during `isRoundBreak`, yet it subscribes to every `gameStateAtom` change while mounted.
Impact: MEDIUM
Effort: LOW
Remediation: Replace `useGameState()` with `const slots = useAtomValue(slotsAtom)` from `gameAtoms`.

**[FINDING-P03]** `src/app/gameroom/components/PostGameShowcase.tsx:80` — `PostGameShowcase` calls `const { scores, playerAccolades } = useGameState()` which subscribes to the full `gameStateAtom`. `scoresAtom` and `playerAccoladesAtom` are both defined as derived selectors in `gameAtoms.ts` (lines 56, 52).
Impact: MEDIUM
Effort: LOW
Remediation: Replace `useGameState()` with `const scores = useAtomValue(scoresAtom)` and `const playerAccolades = useAtomValue(playerAccoladesAtom)`.

**[FINDING-P04]** `src/app/gameroom/page.tsx:55` — `GameroomPage` calls `const { updateGameState } = useGameState()` (line 55) to obtain only the `updateGameState` setter. `useGameState()` calls `useAtomValue(gameStateAtom)`, subscribing to full state reads in addition to the setter. Since the page already selectively reads individual atoms (lines 46–52), this single `useGameState()` call causes the page component to subscribe to the full atom unnecessarily.
Impact: MEDIUM
Effort: LOW
Remediation: Replace `const { updateGameState } = useGameState()` with `const updateGameState = useSetAtom(updateGameStateAtom)` from `gameAtoms`. This provides the setter without subscribing to state reads.

**[FINDING-P05]** `src/app/gameroom/components/UnifiedMessages.tsx:76` — `messages.map((msg, index) => ... key={index})` uses array index as React key. When messages are prepended, removed, or reordered, React will incorrectly recycle DOM nodes. Messages are appended (not prepended), so this is low-severity in practice, but any removal operation (e.g., the 100-message cap trim in `addUnifiedMessageAtom`) will cause all visible messages to re-render.
Impact: LOW
Effort: LOW
Remediation: Use `key={msg.timestamp + msg.player_id}` as a stable composite key. Add a unique `id` field to `UnifiedMessage` if available from the backend.

---

### Animation / Performance Mode Bypass

**[FINDING-P06]** `src/app/gameroom/hooks/useGameActions.ts:86–162` — `triggerCorrectAnswerEffects` unconditionally executes all visual effects: `colorBurstOverlay` DOM injection, screen shake via `style.animation`, `successGlow` DOM injection, Jotai animation state updates, `applyDOMAnimation` CSS class application. None of these check `performanceModeAtom`. The `performanceModeAtom` exists at `src/atoms/performance-atom.ts` and is exported as `performanceModeAtom`. The PROJECT.md constraint states: "Animations must respect `performanceModeAtom` — no new animations that bypass the performance toggle."
Impact: HIGH
Effort: LOW
Remediation: Import `performanceModeAtom` from `@/atoms/performance-atom` in `useGameActions`. Add `const performanceMode = useAtomValue(performanceModeAtom)` and guard DOM effects: `if (!performanceMode) { /* DOM animations */ }`. Always execute sound and Jotai state (so the slot still visually snaps), but skip DOM overlays and screen shake when performance mode is on.

**[FINDING-P07]** `src/components/sound-effects.tsx:1431–1437` — `playSound` (the `window.playSoundEffect` assignment) does not check `performanceModeAtom`. Sound playback proceeds regardless of performance mode. Whether sounds should be suppressed in performance mode is a product decision, but the gap should be explicit — currently there is no suppression option.
Impact: LOW
Effort: LOW
Remediation: Consult with product on whether performance mode should suppress sounds. If yes: import `performanceModeAtom` in `SoundEffects` component (not in the audio engine module), read the value via `useAtomValue`, and pass it as a parameter to the `playSound` callback registered on `window`. If no: add a code comment documenting the deliberate choice.

---

### Bundle Characteristics

**[FINDING-P08]** `src/components/sound-effects.tsx` (imported in `src/app/gameroom/page.tsx:3`) — 1,448 lines of Web Audio API synthesis code are bundled into the main gameroom route chunk. There is no `dynamic(() => import(...))` or other code-splitting mechanism. All audio synthesis functions are parsed and compiled on initial page load, even before the user interacts with the game.
Impact: MEDIUM
Effort: MEDIUM
Remediation: Apply `const SoundEffects = dynamic(() => import("@/components/sound-effects"), { ssr: false })` in `page.tsx`. This defers the audio module to a separate chunk loaded after the initial render. As a secondary improvement, move the 17 sound synthesis functions to a separate module loaded only when first sound playback is requested.

**[FINDING-P09]** `package.json:18` — `"animate.css": "latest"` is unpinned. The game relies on `animate__animated`, `animate__bounce`, `animate__shakeX`, etc. class names (used in `getRandomAttentionAnimation` in `utils.ts` and in `applyDOMAnimation` in `useGameActions.ts`). An `npm install` or Dependabot update could silently introduce a breaking major version that renames or removes animation classes.
Impact: MEDIUM
Effort: LOW
Remediation: Pin to the current installed version: `"animate.css": "^4.1.1"` (or the equivalent resolved version). Add to dependency review process.

**[FINDING-P10]** `package.json:15` — `"@radix-ui/themes": "latest"` is also unpinned. Radix Themes has had breaking API changes between major versions.
Impact: LOW
Effort: LOW
Remediation: Pin to the current resolved version (e.g., `"@radix-ui/themes": "^3.0.0"`).

**[FINDING-P11]** `package.json:25` — `gsap` is listed as a runtime dependency (`"gsap": "^3.13.0"`) and is confirmed in use in `src/components/loading-grid.tsx` (imports `gsap`, `Power2`, `Power3`). This is a ~80KB runtime bundle addition for the loading animation only. GSAP is not used in the gameroom critical path.
Impact: LOW
Effort: MEDIUM
Remediation: Consider whether the loading grid animation justifies a full GSAP dependency, or whether it could be replaced with CSS animations. If kept, apply `dynamic()` import to `loading-grid.tsx` to keep GSAP out of the main bundle.

---

### Slow Render Paths

**[FINDING-P12]** `src/app/gameroom/components/AnswerReveal.tsx:35–50` — The second `useEffect` creates N `setTimeout` calls (one per answer, staggered at `index * 400ms`) via `answers.forEach(...)`. The cleanup function on line 39 only calls `setVisibleAnswers([])` — it does not cancel the pending timeouts. If `answers` changes mid-reveal (e.g., a new `lobby_sync` arrives while reveal is in progress), stale `setTimeout` callbacks fire and call `setVisibleAnswers((prev) => [...prev, answer.id])` on a component that may have been re-initialized or unmounted. This is a confirmed stale closure / potential use-after-unmount bug.
Impact: MEDIUM
Effort: LOW
Remediation: Collect the timeout IDs and cancel them in cleanup:
```ts
const timeoutIds: ReturnType<typeof setTimeout>[] = [];
answers.forEach((answer, index) => {
  timeoutIds.push(setTimeout(() => {
    setVisibleAnswers((prev) => [...prev, answer.id]);
  }, index * 400));
});
return () => { setVisibleAnswers([]); timeoutIds.forEach(clearTimeout); };
```

**[FINDING-P13]** `src/app/gameroom/components/AnswerReveal.tsx:24–31` — The `as unknown as QuizAnswer` assertion on line 30 hides a runtime type mismatch: `Slot.id` is `string` but `QuizAnswer.id` is declared as `number`. `visibleAnswers` is `number[]` (line 16) and `visibleAnswers.includes(x.id)` on line 62 compares a `number[]` against `x.id` which is still a `string` at runtime. This means `visibleAnswers.includes(x.id)` will always return `false`, and the `visible` CSS class is never applied — the reveal animation never fires. This is a latent bug masking a genuine type error.
Impact: HIGH
Effort: LOW
Remediation: Change `QuizAnswer.id` to `string`, change `visibleAnswers` to `string[]`, and remove the `as unknown as QuizAnswer` assertion. The slots map should become: `id: x.id` (no cast needed since both are `string`).

**[FINDING-P14]** `src/app/gameroom/components/PostGameModal.tsx:50` — `getTopAccolades(accolades)` uses `color: COLORS[Math.floor(Math.random() * COLORS.length)]` to assign a player color. This function is called both in `useState` initialization (line 64) and inside a `useEffect` on `[isOpen, accolades, fireConfetti]` (line 137). On every `isOpen` or `accolades` change, a new random color is assigned to each player, causing player cards to change color on re-render. This is a cosmetic instability and a memoization gap.
Impact: LOW
Effort: LOW
Remediation: Derive color deterministically from `player_id` using `getPlayerColor(player.player_id)` (already defined in `gameroom/utils.ts`). Replace `color: COLORS[Math.floor(Math.random() * COLORS.length)]` with `color: getPlayerColor(player.player_id)`.

**[FINDING-P15]** `src/app/gameroom/page.tsx:64–95` — The `useEffect` tracking score position changes (lines 64–95) calls `setPlayerAnimations(new Map())` via a `setTimeout(..., 600)` on every `scores` update that causes rank changes. If `scores` updates rapidly (every `lobby_tick` at 50ms debounce), the 600ms timeout may fire after a new round of animations has started, clearing animations prematurely or leaving stale animation state.
Impact: LOW
Effort: LOW
Remediation: Track the timeout ref (`const clearAnimationsTimeout = useRef<NodeJS.Timeout | null>(null)`) and call `clearTimeout(clearAnimationsTimeout.current)` before setting a new timeout, ensuring only the most recent animation-clear fires.

---

## Finding Summary

| ID | Category | Impact | Effort | File |
|----|----------|--------|--------|------|
| FINDING-Q01 | Oversized Component | HIGH | MEDIUM | `src/components/sound-effects.tsx` |
| FINDING-Q02 | Oversized Component | MEDIUM | MEDIUM | `src/lib/api/admin.ts` |
| FINDING-Q03 | Duplication | MEDIUM | LOW | `src/app/gameroom/page.tsx` vs `LeaderBoard.tsx` |
| FINDING-Q04 | Duplication | MEDIUM | LOW | `PostGameShowcase.tsx` vs `LeaderBoard.tsx` |
| FINDING-Q05 | Duplication | MEDIUM | LOW | `src/app/gameroom/hooks/useGameEvents.ts` |
| FINDING-Q06 | Naming | LOW | LOW | `LeaderBoard.tsx` |
| FINDING-Q07 | Naming | LOW | LOW | `useChatWs.ts` |
| FINDING-Q08 | Naming | LOW | LOW | `PostGameModal.tsx` |
| FINDING-Q09 | Naming / Unused Props | LOW | LOW | `SlotTile.tsx` |
| FINDING-Q10 | Dead Code | LOW | LOW | `src/app/gameroom/page.tsx:210` |
| FINDING-Q11 | Dead Code | LOW | LOW | `src/app/gameroom/hooks/useGameEvents.ts` |
| FINDING-Q12 | Complexity Hotspot | HIGH | MEDIUM | `src/app/gameroom/hooks/useGameActions.ts` |
| FINDING-Q13 | Complexity Hotspot | MEDIUM | LOW | `src/app/gameroom/hooks/useGameEvents.ts` |
| FINDING-P01 | Re-render | MEDIUM | LOW | `src/app/gameroom/components/LeaderBoard.tsx` |
| FINDING-P02 | Re-render | MEDIUM | LOW | `src/app/gameroom/components/AnswerReveal.tsx` |
| FINDING-P03 | Re-render | MEDIUM | LOW | `src/app/gameroom/components/PostGameShowcase.tsx` |
| FINDING-P04 | Re-render | MEDIUM | LOW | `src/app/gameroom/page.tsx` |
| FINDING-P05 | Re-render | LOW | LOW | `src/app/gameroom/components/UnifiedMessages.tsx` |
| FINDING-P06 | Perf Mode Bypass | HIGH | LOW | `src/app/gameroom/hooks/useGameActions.ts` |
| FINDING-P07 | Perf Mode Bypass | LOW | LOW | `src/components/sound-effects.tsx` |
| FINDING-P08 | Bundle | MEDIUM | MEDIUM | `src/components/sound-effects.tsx` |
| FINDING-P09 | Bundle | MEDIUM | LOW | `package.json` |
| FINDING-P10 | Bundle | LOW | LOW | `package.json` |
| FINDING-P11 | Bundle | LOW | MEDIUM | `src/components/loading-grid.tsx` |
| FINDING-P12 | Slow Render | MEDIUM | LOW | `src/app/gameroom/components/AnswerReveal.tsx` |
| FINDING-P13 | Slow Render / Bug | HIGH | LOW | `src/app/gameroom/components/AnswerReveal.tsx` |
| FINDING-P14 | Slow Render | LOW | LOW | `src/app/gameroom/components/PostGameModal.tsx` |
| FINDING-P15 | Slow Render | LOW | LOW | `src/app/gameroom/page.tsx` |

**Total findings: 28** (13 Code Quality, 15 Performance)
