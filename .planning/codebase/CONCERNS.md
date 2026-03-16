# CONCERNS.md — Technical Debt & Concerns

## Tech Debt

### `@ts-ignore` / Unsafe Type Usage

**`src/app/gameroom/utils.ts:59-62`** — Global function accessed via `window`:
```ts
// @ts-ignore
if (window.playSoundEffect) {
  // @ts-ignore
  window.playSoundEffect(type);
}
```
Risk: No type safety, breaks if function signature changes. Should use a typed global declaration or a context/ref approach.

**`src/app/api/admin/[...path]/route.ts:22`** — Unsafe cast:
```ts
const params = context.params as any;
```
Workaround for Next.js 15 async params change. Should be resolved with proper typing once Next.js API stabilizes.

**`src/app/gameroom/hooks/useGameEvents.ts:77`** — Cast to bypass type:
```ts
(sendEventRef.current as (e: string, d: any) => void)("request_state_sync", undefined);
```

**`src/app/gameroom/types/payloads.ts:204`** — `submit_answer` payload typed as `any`:
```ts
submit_answer: any;
```

### Duplicate Type Definition
`ChatMessageData` and `ChatMessagePayload` in `src/app/gameroom/types/payloads.ts` are near-identical types (lines 172–177 and 225–231). One is unused.

### Stale Legacy Code
`src/app/gameroom/store/gameAtoms.ts` exports `answerAtom` (for legacy answer tracking) alongside the newer `unifiedInputAtom`. It's unclear which is canonical.

### Dead Code
`GameroomPage` (`src/app/gameroom/page.tsx:210`):
```tsx
{player.display_name === "You" && false ? styles.nameFlash : ""}
```
The `&& false` makes this never execute — dead code.

---

## Known Issues

### Chat Socket: No Reconnect Logic
`src/app/gameroom/hooks/useChatWs.ts` has no reconnect on disconnect. Game socket has exponential backoff; chat socket does not. If chat disconnects mid-game, it stays disconnected.

### Memory Leak Risk: Debounced Functions
`useMemo(() => debounce(...), [])` in `useGameSocket.ts` creates a debounced function that holds a timeout reference. If the component unmounts while a debounce is pending, the timeout fires against a cleaned-up closure.

### Timer Accumulation
`src/app/gameroom/page.tsx` uses `setTimeout(() => setPlayerAnimations(new Map()), 600)` inside a `useEffect` that runs on every `scores` change. No cleanup of pending timeouts — on rapid score changes, multiple timers can queue up. (See `TIMER_BUG_ANALYSIS.md` in root.)

### `addUnifiedMessageAtom` Missing Cleanup on Game Reset
`clearUnifiedMessagesAtom` exists but is not called by `resetGameStateAtom`. On game reset, the unified message feed is not cleared.

---

## Security Concerns

### Hardcoded Localhost Fallbacks
Service URLs default to localhost in production proxy routes (`src/app/api/admin/[...path]/route.ts`):
```ts
const LOBBY_MANAGER_URL = process.env.LOBBY_MANAGER_INTERNAL_URL || "http://localhost:8001";
```
If env vars are missing in production, requests silently fall back to localhost (which will fail or hit wrong service).

### Admin Routes — No Auth Check
`src/app/api/admin/[...path]/route.ts` proxies all admin requests without any server-side auth validation. Authentication is expected to be enforced by the backend microservices, but there's no middleware-level protection on the Next.js side.

### NEXT_PUBLIC_ Keys Exposed
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are intentionally public (Supabase pattern), but developers should ensure Row Level Security (RLS) is enabled on all Supabase tables.

### `next-auth` Dual Auth System
Both `next-auth` and Supabase auth are present as dependencies. `next-auth` appears unused (no configuration found). This creates confusion and potential for accidental use.

---

## Performance Concerns

### High-Frequency Socket State Updates
`lobby_tick` fires every ~1 second and updates `gameStateAtom` (scores, playerCount, timeRemaining). Even with 50ms debounce, any component subscribed to the base `gameStateAtom` (instead of derived atoms) will re-render every tick.

### Leaderboard Animation on Every Score Update
`src/app/gameroom/page.tsx` runs a full leaderboard diff + `Map` construction on every `scores` change (which happens on every `lobby_tick`). Combined with the setTimeout leak, this is a performance hotspot.

### Message Array Slice
`addUnifiedMessageAtom` slices to 100 messages: `[...current, message].slice(-100)`. Creates a new array on every message. For high-traffic game rooms, this could be frequent.

### Confetti / Canvas-Confetti
No explicit cleanup of confetti animations observed. canvas-confetti can accumulate canvas elements if not properly cleaned up.

---

## Fragile Areas

### Socket URL Parsing
`src/app/gameroom/page.tsx`:
```ts
function getBaseWsUrl(url: string) {
  return url.replace(/\/(game|chat)$/, "");
}
```
Fragile regex — breaks if backend changes the WS URL path structure.

### `RoundStartinSoonPayload` Typo
`src/app/gameroom/types/payloads.ts:43` — typo in type name: `RoundStartinSoonPayload` (missing 'g'). Not a functional bug but a code quality issue.

### Game State Loading Gate
`loading` is set `true` when `!isConnected || connectionStatus === "reconnecting"`, and `false` on `lobby_state_sync`. If `lobby_state_sync` never arrives after reconnect, the game shows a loading spinner indefinitely.

### `initializeSocketRef` Circular Pattern
`useGameSocket.ts` uses a ref to store the `initializeSocket` function to avoid circular dependencies in `scheduleReconnect`. This works but is non-obvious and fragile — the ref update happens in a `useEffect`, so there's a brief window where the ref is stale.

### Synthwave Background Copy CSS File
`src/components/synthwave-background.module copy.css` — a copy of the CSS module is committed to the repository. This is dead file clutter.

---

## Missing Features / Gaps

### No Error Recovery UI
If WebSocket connection fails permanently (max reconnect reached), the game shows a loading spinner with no user-facing error message or retry button.

### No Message Input Validation
Chat messages and answer attempts are sent as raw strings with no length limits or sanitization on the frontend.

### No Accessibility (A11y)
Game components (SlotGrid, LeaderBoard, UnifiedMessages) have no ARIA labels, roles, or keyboard navigation support.

### No Rate Limiting on Answer Submission
While `sendEvent` is debounced 100ms, there's no per-round submission count limit on the frontend. Users can spam submissions rapidly.

---

## Dependencies at Risk

| Package | Concern |
|---|---|
| `next-auth ^4.24.13` | Appears unused; duplicates Supabase auth |
| `animate.css latest` | `latest` tag means unpinned — breaking changes possible |
| `@radix-ui/themes latest` | Same unpinned risk |
| `next ^16.0.10` | Very recent major version; API surface (async params) still in flux |
