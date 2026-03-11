# CONVENTIONS.md — Coding Conventions

## Naming

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `UnifiedInputForm`, `SlotGrid`, `RoomHeader` |
| Hooks | camelCase with `use` prefix | `useGameSocket`, `useChatSocket`, `useGameState` |
| Atoms | camelCase with `Atom` suffix | `gameStateAtom`, `unifiedMessagesAtom` |
| Action atoms | camelCase with `Atom` suffix | `updateGameStateAtom`, `addUnifiedMessageAtom` |
| Types/Interfaces | PascalCase | `GameState`, `AnimationState`, `LobbyJoinSuccess` |
| Event payload types | PascalCase + `Payload` suffix | `LobbySyncPayload`, `SlotSnappedPayload` |
| CSS Modules files | kebab-case + `.module.css` | `gameroom.module.css`, `answer-chip.module.css` |
| Server actions | camelCase verbs | `signIn`, `signOut`, `signUp`, `joinGameroom` |
| Constants | UPPER_SNAKE_CASE | `MAX_RECONNECT_ATTEMPTS`, `RECONNECT_DELAY_BASE` |
| Directories | kebab-case | `src/app/gameroom/`, `src/lib/supabase/` |

## File Organization

- Co-located CSS modules: `ComponentName.tsx` → `componentName.module.css` or `ComponentName.module.css`
- Feature-scoped hooks: `src/app/gameroom/hooks/use*.ts`
- Feature-scoped types: `src/app/gameroom/types/`
- Feature-scoped store: `src/app/gameroom/store/`
- Global shared components: `src/components/`
- Global atoms: `src/atoms/`
- Global hooks: `src/hooks/`
- Supabase clients: `src/lib/supabase/client.ts` (browser) + `server.ts` (SSR)
- API clients: `src/lib/api/admin.ts`, `players.ts`
- Server actions: `src/actions/`

## Component Patterns

### "use client" directive
All interactive components have `"use client"` at the top:
```tsx
"use client";
import { useAtomValue } from "jotai";
```

Server Components (layouts, page.tsx files that only fetch data) omit this.

### Functional components with explicit return types (implicit via React.FC or inferred)
```tsx
export default function GameroomPage() { ... }
export const Provider = ({ children }: Props) => { ... };
```

### Props typing with inline interfaces
```tsx
interface SocketState {
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error" | "reconnecting";
  error: string | null;
  reconnectAttempts: number;
}
```

## Imports

**Order convention (implicit):**
1. React and hooks
2. Third-party libraries
3. Internal aliases (`@/components/...`, `@/lib/...`, `@/atoms/...`)
4. Relative imports (`./hooks/...`, `../types/...`)

**Path aliases** (`@/*` → `src/*`):
```ts
import { createClient } from "@/lib/supabase/client";
import { gameRoomAtom } from "@/app/store/gameRoom";
```

## State Management Patterns

### Jotai atom composition
```ts
// Base atom
export const gameStateAtom = atom<GameState>(initGameState);

// Derived/selector atoms (prevent unnecessary re-renders)
export const slotsAtom = atom((get) => get(gameStateAtom).slots);

// Write-only action atoms
export const updateGameStateAtom = atom(null, (get, set, update: Partial<GameState>) => {
  set(gameStateAtom, { ...get(gameStateAtom), ...update });
});
```

### Consuming atoms in components
```tsx
const slots = useAtomValue(slotsAtom);           // read-only
const [answer, setAnswer] = useAtom(answerAtom); // read + write
const updateState = useSetAtom(updateGameStateAtom); // write-only
```

## Error Handling

- Server actions return `{ error: string }` objects on failure (not throws)
- WebSocket errors set error state on the hook, not thrown
- `@ts-ignore` used in `src/app/gameroom/utils.ts` for `window.playSoundEffect` (global function pattern)
- Console logging: `console.error` for errors, `console.log` for connection events
- No global error boundary in the app currently

## Debouncing Pattern

Custom `debounce` utility in `src/app/gameroom/utils.ts`:
```ts
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

Used for: `lobby_tick` handler (50ms), `sendEvent` (100ms), error logging (1000ms).

## Ref Patterns

### Mutable handler refs to avoid stale closures
```ts
const handleLobbySyncRef = useRef((data: LobbySyncPayload) => { ... });
useEffect(() => {
  handleLobbySyncRef.current = (data) => { ... }; // update on dependency change
}, [updateGameState]);

// Register once with stable wrapper
onEvent("lobby_state_sync", (data) => handleLobbySyncRef.current(data));
```

### `initializeSocketRef` pattern (for self-referential callbacks)
```ts
const initializeSocketRef = useRef<() => void>(() => {});
useEffect(() => { initializeSocketRef.current = initializeSocket; }, [initializeSocket]);
// scheduleReconnect calls initializeSocketRef.current() without circular dep
```

## CSS / Styling Patterns

- CSS Modules for component styles
- CSS custom properties (variables): `--room-color`, `--neon-pink`
- Global styles: `src/app/globals.css`, `src/styles/globals.css`
- Radix UI Themes for component library base
- Conditional class application via template literals:
```tsx
className={`${styles.main} ${animationState.shake ? styles.screenShake : ""}`}
```
- Animate.css integration via class strings:
```ts
`animate__animated animate__${ATTENTION_ANIMATIONS[...]}`
```

## TypeScript Conventions

- Strict mode enabled (`"strict": true`)
- Union types for state enums (not TypeScript enums):
```ts
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error" | "reconnecting";
```
- `as any` used in places (admin API proxy params resolution)
- Optional chaining: `data.time_remaining_seconds ?? 0`
- Non-null assertion: `process.env.NEXT_PUBLIC_SUPABASE_URL!` in server client
