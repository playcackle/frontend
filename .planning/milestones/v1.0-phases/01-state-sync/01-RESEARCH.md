# Phase 1: State Sync - Research

**Researched:** 2026-02-25
**Domain:** WebSocket state management / React reconnection patterns (Next.js 16 + Socket.IO + Jotai)
**Confidence:** HIGH

---

## Summary

Phase 1 addresses a concrete and well-scoped reliability problem: players must never see stale or missing game state after a round transition or after a WebSocket reconnect. The existing codebase already has the core infrastructure — Socket.IO with manual reconnection logic, a `lobby_state_sync` event that carries full game state, and Jotai atoms that drive all rendering — but none of it is wired together correctly to handle the three failure scenarios in the requirements.

The good news: no new dependencies are needed. The `lobby_state_sync` event already exists in both `EventPayloadMap` and `useGameEvents.ts`, and the backend already emits it. The handler in `useGameEvents` already maps the full `LobbySyncPayload` to `gameStateAtom`. The gap is that this sync event is never explicitly requested on reconnect, the `loading` atom is only toggled on disconnect/connect (not on the interim "reconnecting" state), and the `isPostGameShowcase` field is missing from the initial `handleLobbySyncRef` handler (a silent bug). Fixing Phase 1 is primarily about wiring existing pieces correctly and adding the UI guard that shows a loading/reconnecting indicator during the window of uncertainty.

There is one structural bug that affects the entire state sync story: the `useGameSocket` hook creates a **new socket instance** every time `initializeSocket` is called (via `scheduleReconnect`), but `listenersRef` is preserved across reinitializations. This design is correct — listeners survive reconnects. However, `scheduleReconnect` reads `socketState.reconnectAttempts` from a stale closure, which can cause the exponential backoff to reset unexpectedly. This must be addressed as part of this phase to avoid unreliable reconnection behavior.

**Primary recommendation:** Wire the existing `lobby_state_sync` mechanism to trigger on every successful reconnect, set `loading: true` during any "reconnecting" socket state transition, and add a visible reconnecting indicator to the gameroom UI.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STATE-01 | Client automatically re-syncs to current game state when round transitions to intermission — no manual rejoin required | `round_over` handler already sets `isRoundBreak: true` — the gap is that it doesn't also trigger a `lobby_state_sync` request or apply the sync response atomically. The `lobby_state_sync` event handler in `useGameEvents` maps the full `LobbySyncPayload` including `status === "ROUND_BREAK"`, so a server-push sync after `round_over` would cover this requirement. |
| STATE-02 | If game state is lost or stale during a transition, a loading/reconnecting indicator is shown (never display stale state silently) | `loadingAtom` already gates the entire gameroom UI behind a `<Progress />` component. The gap is that `loading` is only set `true` on initial mount (before first connect) and is never re-set to `true` when the socket goes into `"reconnecting"` state. Adding that bridge covers STATE-02. |
| STATE-03 | Client can recover to the correct game phase (intermission, lobby, round) after any WebSocket reconnection | The `lobby_state_sync` event handler already maps all five game phases from `LobbySyncPayload.status` (`WAITING`, `STARTING_SOON`, `IN_ROUND`, `ROUND_BREAK`, `POST_GAME_SHOWCASE`). The gap is that reconnection completes (socket `"connect"` fires) but no sync is requested. Adding a `requestStateSync()` emit on reconnect covers STATE-03. |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new packages required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| socket.io-client | ^4.8.1 | WebSocket client, reconnection management | Already in use; v4 has built-in reconnection but project uses manual reconnect for control |
| jotai | ^2.15.2 | Atomic state management | Already in use; `updateGameStateAtom` is the single write path for all game state |
| react | 19.2.1 | Component model and hooks lifecycle | Framework |
| next | ^16.0.10 | App Router, client component boundary | Framework |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jotai-devtools | ^0.5.3 | Atom inspection during development | Already installed — useful for verifying state transitions during testing |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual reconnect logic in `useGameSocket` | Socket.IO built-in `reconnection: true` | Built-in is simpler but gives less control over when to request `lobby_state_sync` on reconnect. Keep manual approach. |
| `loading` atom to gate stale-state display | Separate `connectionStatus` atom in component | `loadingAtom` already drives the UI gate; reuse it rather than adding a parallel indicator concept. |

**Installation:** No new packages required.

---

## Architecture Patterns

### Existing Project Structure (relevant files)

```
src/app/gameroom/
├── page.tsx                    # Renders {loading && <Progress />} gate
├── hooks/
│   ├── useGameSocket.ts        # Socket.IO connection, reconnect scheduling, onEvent/sendEvent API
│   ├── useGameEvents.ts        # Event handler registration, calls updateGameState
│   └── useGameState.ts        # Jotai atom access — updateGameState, resetGameState
└── store/
    └── gameAtoms.ts            # gameStateAtom, loadingAtom, updateGameStateAtom
```

### Pattern 1: Loading Gate for Stale State (STATE-02)

**What:** `loading: true` in `gameStateAtom` causes `page.tsx` to render `<Progress />` instead of game UI. This prevents any stale state from being visible.

**When to use:** Whenever socket connectivity is uncertain — initial mount, during reconnect window, and until the first `lobby_state_sync` or `lobby_tick` confirms current state.

**Current behavior (incomplete):**
```typescript
// src/app/gameroom/hooks/useGameEvents.ts — line 31
useEffect(() => {
  updateGameState({ loading: !isConnected });
}, [isConnected, updateGameState]);
```
`isConnected` is `false` during both "disconnected" and "reconnecting" states. However the socket's `connectionStatus` string distinguishes them. The `loading` flag is set correctly on disconnect but **is not re-set to `true` when reconnection begins** because `isConnected` is already `false` at that point (no state change fires the effect again).

**Required change:** Expose `connectionStatus` from `useGameSocket` into `useGameEvents` and set `loading: true` when `connectionStatus === "reconnecting"` as well. This is already possible — `useGameSocket` returns `connectionStatus` alongside `isConnected`.

```typescript
// Pattern: use connectionStatus, not just isConnected
const { onEvent, sendEvent, isConnected, connectionStatus } = useGameSocket(gameWsUrl, token);

useEffect(() => {
  const isUncertain = !isConnected || connectionStatus === "reconnecting";
  updateGameState({ loading: isUncertain });
}, [isConnected, connectionStatus, updateGameState]);
```

### Pattern 2: Request State Sync on Reconnect (STATE-03)

**What:** When the WebSocket reconnects after a drop, emit an event to request the current server state snapshot. The backend responds with `lobby_state_sync`, which the existing handler already processes correctly.

**When to use:** In the `socket.on("connect", ...)` handler inside `useGameSocket`, after resetting `socketState`. A flag prevents requesting on the very first connection (before the game has started, `lobby_tick` will carry state naturally).

**Decision from STATE.md:** "Use `lobby_state_sync` event for recovery — extend existing event rather than add new ones."

```typescript
// Pattern: emit request in connect handler — only on reconnects (attempts > 0)
socket.on("connect", () => {
  setSocketState((prev) => {
    const wasReconnect = prev.reconnectAttempts > 0;
    // Signal to callers that a sync was requested
    return {
      isConnected: true,
      connectionStatus: "connected",
      error: null,
      reconnectAttempts: 0,
      requestedSync: wasReconnect,
    };
  });
  clearReconnectTimeout();
});
```

However, `sendEvent` in `useGameSocket` is the outbound path and it checks `socket?.connected`. A simpler approach is to emit directly inside the connect handler where the socket reference is in scope:

```typescript
socket.on("connect", () => {
  const isReconnect = socketState.reconnectAttempts > 0;
  setSocketState({ isConnected: true, connectionStatus: "connected", error: null, reconnectAttempts: 0 });
  clearReconnectTimeout();
  if (isReconnect) {
    socket.emit("request_state_sync"); // or the actual event name the backend listens on
  }
});
```

**Open question on backend event name:** The backend already emits `lobby_state_sync` proactively. Whether the client can also *request* it must be verified — see Open Questions section.

### Pattern 3: Fix `isPostGameShowcase` in Initial Sync Handler (STATE-01 supporting fix)

**What:** The initial `handleLobbySyncRef` (the one defined before the `useEffect` dependency array) does NOT set `isPostGameShowcase`, while the one inside the `useEffect` does. This means if `lobby_state_sync` arrives before `useEffect` fires, `isPostGameShowcase` is never set from sync data. This is a silent correctness bug.

**Location:** `src/app/gameroom/hooks/useGameEvents.ts` lines 34-52 vs 143-162.

```typescript
// BUG: initial ref is missing isPostGameShowcase
const handleLobbySyncRef = useRef((data: LobbySyncPayload) => {
  updateGameState({
    // ... other fields ...
    isRoundBreak: data.status === "ROUND_BREAK",
    // isPostGameShowcase missing here!   <-- BUG
    scores: data.scores ?? [],
    slots: data.slots ?? [],
  });
});

// CORRECT version (inside useEffect at line 143):
handleLobbySyncRef.current = (data: LobbySyncPayload) => {
  updateGameState({
    // ...
    isRoundBreak: data.status === "ROUND_BREAK",
    isPostGameShowcase: data.status === "POST_GAME_SHOWCASE", // present here
    // ...
  });
};
```

Fix: Add `isPostGameShowcase: data.status === "POST_GAME_SHOWCASE"` to the initial ref definition.

### Pattern 4: Fix Stale Closure in `scheduleReconnect`

**What:** `scheduleReconnect` is defined with `useCallback` with `[socketState.reconnectAttempts]` in its dependency array. But it's called inside `initializeSocket` which captures it via closure. This creates a stale closure where `scheduleReconnect` inside the socket event handlers uses an outdated `reconnectAttempts` value.

**Location:** `src/app/gameroom/hooks/useGameSocket.ts` lines 77-105.

**Fix approach:** Use a `ref` for `reconnectAttempts` in the callback, or use the functional update form of `setSocketState` to read current state:

```typescript
const scheduleReconnect = useCallback(() => {
  setSocketState((prev) => {
    if (prev.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return { ...prev, connectionStatus: "error", error: "Max reconnection attempts reached" };
    }
    const delay = Math.min(RECONNECT_DELAY_BASE * Math.pow(2, prev.reconnectAttempts), 30000);
    reconnectTimeoutRef.current = setTimeout(() => initializeSocket(), delay);
    return { ...prev, connectionStatus: "reconnecting", reconnectAttempts: prev.reconnectAttempts + 1 };
  });
}, [initializeSocket]); // Note: creates circular dependency — see Open Questions
```

### Anti-Patterns to Avoid

- **Setting `loading: false` immediately on "connect":** The socket being connected does not mean the game state is current. Keep `loading: true` until the first `lobby_state_sync` or `lobby_tick` payload arrives and updates `gameStateAtom`. This prevents a flash of stale UI between connect and sync.
- **Resetting all game state on reconnect:** `resetGameStateAtom` clears everything including `isRoundBreak` and `slots`. Do NOT call it on reconnect — the game may be in mid-round. Only reset on `lobby_resetting_for_new_game`.
- **Calling `initializeSocket()` directly in `scheduleReconnect`:** This creates a circular `useCallback` dependency. Use a ref to hold `initializeSocket` instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full reconnection logic | Custom WebSocket wrapper | Socket.IO's existing `useGameSocket` hook | Already handles exponential backoff, connection lifecycle, listener preservation |
| State serialization for sync | Custom diff/patch mechanism | `lobby_state_sync` event payload | Backend already emits full state snapshot |
| Loading indicator component | New spinner component | Existing `<Progress />` component at `src/app/loading.tsx` | Already styled, already used in gameroom page |
| "Reconnecting" UI text | Custom banner component | Extend existing `<Progress />` or add text inside it | Minimal change, consistent UX |

**Key insight:** The entire state sync mechanism already exists. This phase is about correctly connecting the wires, not building new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Flash of Stale State Between Connect and First Sync

**What goes wrong:** Socket emits `connect`, `loading` is set to `false`, then `lobby_state_sync` arrives 50-100ms later. In that window, components render with `gameStateAtom` in its previous/stale state.

**Why it happens:** The `connect` event and the `lobby_state_sync` event are asynchronous. Clearing the loading gate on `connect` is too early.

**How to avoid:** Keep `loading: true` until the first data event (`lobby_state_sync` or `lobby_tick`) arrives. Set `loading: false` inside the `handleLobbySyncRef` handler (or `handleLobbyTickRef`) as the last step.

**Warning signs:** After a manual reconnect, players briefly see the slot grid from the previous round before it updates.

---

### Pitfall 2: `scheduleReconnect` Stale Closure Causing Infinite Reconnect Loop

**What goes wrong:** `scheduleReconnect` reads `socketState.reconnectAttempts` from a closure. If the closure is stale, `reconnectAttempts` always reads as `0`, causing `MAX_RECONNECT_ATTEMPTS` to never be reached and reconnect to loop forever.

**Why it happens:** `useCallback` with `[socketState.reconnectAttempts]` creates a new function on each render, but `initializeSocket` captures the version of `scheduleReconnect` from its own render cycle.

**How to avoid:** Use the functional update form of `setSocketState((prev) => ...)` inside `scheduleReconnect` to read current state without a closure.

**Warning signs:** Console shows "reconnecting" indefinitely even after 5+ failed attempts.

---

### Pitfall 3: `lobby_state_sync` Handler Divergence (Two Versions of Handler)

**What goes wrong:** `useGameEvents.ts` defines `handleLobbySyncRef` twice — once as an initial value and once inside `useEffect`. The initial version is missing `isPostGameShowcase`. If `lobby_state_sync` fires before the `useEffect` runs (possible in React 19 concurrent mode), the game will be stuck displaying the round slot grid when the backend says it should be showing the post-game showcase.

**Why it happens:** The ref pattern used here is correct for avoiding stale closures, but the initial ref value must match the `useEffect` update to be a no-op.

**How to avoid:** Ensure the initial `handleLobbySyncRef.current` assignment is identical to the one in `useEffect`. The simplest fix is to define the handler function once and assign it to the ref.

**Warning signs:** Players reconnecting during `POST_GAME_SHOWCASE` see the slot grid instead of the post-game screen.

---

### Pitfall 4: `round_over` Transition Gap (STATE-01)

**What goes wrong:** When `round_over` fires, `isRoundBreak: true` is set. But `round_over` payload does not include `slots` or `topic_*` fields. If the client joined mid-round or missed `new_round_started`, slots will be empty or stale. The intermission (`AnswerReveal`) component reads `slots` from `gameStateAtom` to display answers.

**Why it happens:** `round_over` is a delta event (score update + accolades only). The full state comes from `lobby_state_sync`. If the server sends `lobby_state_sync` after `round_over`, the client is fine. If not, `AnswerReveal` shows empty or stale answers.

**How to avoid:** After receiving `round_over`, the client should request a state sync (emitting `request_state_sync` or relying on a server-pushed `lobby_state_sync` that follows `round_over`). Research the backend's behavior — see Open Questions.

**Warning signs:** `AnswerReveal` component shows 0 answers during intermission, or shows answers from the previous round.

---

## Code Examples

Verified patterns from the codebase:

### How `loading` currently gates the gameroom UI

```typescript
// Source: src/app/gameroom/page.tsx lines 143-144
{loading && <Progress />}
{!loading && (
  <div className={styles.container}>
    {/* full game UI */}
  </div>
)}
```

### How `loading` is currently set (incomplete — only covers initial connect)

```typescript
// Source: src/app/gameroom/hooks/useGameEvents.ts lines 30-32
useEffect(() => {
  updateGameState({ loading: !isConnected });
}, [isConnected, updateGameState]);
```

### How `lobby_state_sync` maps to full game phase

```typescript
// Source: src/app/gameroom/hooks/useGameEvents.ts lines 143-161
handleLobbySyncRef.current = (data: LobbySyncPayload) => {
  updateGameState({
    roundNumber: data.round_number,
    roundExample: data.topic_example,
    roundPrompt: data.topic_prompt,
    totalRounds: data.total_rounds,
    playerCount: data.player_count,
    timeRemaining: data.time_remaining_seconds ?? 0,
    roundName: data.topic_name,
    showCountDown: data.time_remaining_seconds! < 5 && data.time_remaining_seconds! > 0
      && (data.status === "ROUND_BREAK" || data.status === "POST_GAME_SHOWCASE"),
    isRoundBreak: data.status === "ROUND_BREAK",
    isPostGameShowcase: data.status === "POST_GAME_SHOWCASE",
    scores: data.scores ?? [],
    slots: data.slots ?? [],
  });
};
```

### `LobbySyncPayload` status values (all game phases covered)

```typescript
// Source: src/app/gameroom/types/payloads.ts lines 61-80
export type LobbySyncPayload = {
  status:
    | "WAITING"
    | "STARTING_SOON"
    | "IN_ROUND"
    | "ROUND_BREAK"            // intermission
    | "POST_GAME_SHOWCASE"
    | "GAME_OVER_NO_NEW_GAME";
  // ... full state snapshot fields
};
```

### Socket reconnection hook — current `connect` handler location

```typescript
// Source: src/app/gameroom/hooks/useGameSocket.ts lines 128-137
socket.on("connect", () => {
  setSocketState({
    isConnected: true,
    connectionStatus: "connected",
    error: null,
    reconnectAttempts: 0,
  });
  clearReconnectTimeout();
  // <- request_state_sync emit goes here for reconnects
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Socket.IO built-in reconnection (`reconnection: true`) | Manual reconnection with exponential backoff in `useGameSocket` | Pre-existing (before Phase 1) | Enables custom logic on reconnect (e.g., emit state sync request) |
| Full page reload to recover state | `lobby_state_sync` event handler updates atoms in-place | Pre-existing | Players stay in gameroom during reconnect |
| Binary `isConnected` flag for loading state | `connectionStatus: "reconnecting"` enum for UI | Needs to be wired (Phase 1 work) | Enables distinct reconnecting indicator |

**Deprecated/outdated:**
- `resetGameStateAtom`: Exists and is imported, but MUST NOT be called on reconnect. Only appropriate for `lobby_resetting_for_new_game`. Calling it on reconnect would wipe `isRoundBreak`, `slots`, and `scores` mid-round.

---

## Open Questions

1. **Does the backend emit `lobby_state_sync` automatically after `round_over`?**
   - What we know: `lobby_state_sync` is registered as a server-emitted event in `useGameSocket.ts`. The backend uses Socket.IO. STATE.md says "Use `lobby_state_sync` event for recovery."
   - What's unclear: Whether `lobby_state_sync` is pushed proactively by the backend after each round transition, or only on client request/initial connect.
   - Recommendation: Check backend behavior by monitoring socket events in browser DevTools during a round transition. If it IS pushed automatically after `round_over`, STATE-01 may already be partially working and the fix is just the missing `isPostGameShowcase` field. If NOT, the client needs to emit a request event on reconnect AND after receiving `round_over`.

2. **What event name does the backend listen on for a client-requested state sync?**
   - What we know: The backend emits `lobby_state_sync`. The client never emits it in the current code.
   - What's unclear: Whether the backend exposes a `request_state_sync` (or similar) event for clients to trigger a sync, or whether the backend always pushes it on connect.
   - Recommendation: Inspect the backend WebSocket event registry. If no client-request path exists, the architecture must rely on the server pushing `lobby_state_sync` automatically on reconnect (which Socket.IO can trigger via the `connect` server-side event).

3. **Should `loading: true` be shown during "reconnecting" or only on full "disconnected"?**
   - What we know: `connectionStatus` can be `"connecting"`, `"connected"`, `"disconnected"`, `"error"`, `"reconnecting"`. The current code only shows `<Progress />` when `loading: true`, which maps to `!isConnected`.
   - What's unclear: UX preference — should the game UI freeze immediately on first disconnect, or only when a reconnect attempt fails? Showing `<Progress />` on first disconnect is conservative (good for STATE-02) but potentially annoying for brief network blips.
   - Recommendation: Show loading/reconnecting indicator immediately on disconnect (current behavior is correct in intent, just not properly wired for the "reconnecting" state). Consider adding a short debounce (500ms) before showing the indicator for brief blips.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis — `src/app/gameroom/hooks/useGameSocket.ts` — socket lifecycle and reconnection logic
- Direct codebase analysis — `src/app/gameroom/hooks/useGameEvents.ts` — event handler registration and `lobby_state_sync` mapping
- Direct codebase analysis — `src/app/gameroom/store/gameAtoms.ts` — state shape, `loadingAtom`, `updateGameStateAtom`
- Direct codebase analysis — `src/app/gameroom/types/payloads.ts` — `LobbySyncPayload` status enum, all event types
- Direct codebase analysis — `src/app/gameroom/page.tsx` — `loading` gate rendering pattern
- `.planning/STATE.md` — "Use `lobby_state_sync` event for recovery" decision
- `.planning/codebase/CONCERNS.md` — Fragile Area #1 (WebSocket connection state not synchronized with game state) and Known Bug #2 (debounced events masking timing issues)

### Secondary (MEDIUM confidence)

- `.planning/codebase/ARCHITECTURE.md` — Real-Time Synchronization section documents `lobby_state_sync` as the consistency mechanism
- Socket.IO v4 documentation pattern — `socket.on("connect")` fires on both initial connect and every reconnect

### Tertiary (LOW confidence)

- Backend event registry for client-requested sync — not visible in frontend code; requires backend inspection to verify

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use, verified from package.json and source
- Architecture: HIGH — all patterns derived directly from existing source code, no speculation
- Pitfalls: HIGH — bugs identified from direct code inspection (missing field, stale closure), not inferred
- Backend event behavior: LOW — cannot verify from frontend code alone; Open Question #1 and #2 must be answered before planning tasks that involve client-side emit

**Research date:** 2026-02-25
**Valid until:** 2026-03-27 (stable stack — socket.io v4 and jotai v2 are stable releases)
