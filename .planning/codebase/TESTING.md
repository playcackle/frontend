# TESTING.md — Testing Practices

## Current Status

**No test framework is configured.** There are no test files, no test scripts in `package.json`, and no testing dependencies (`vitest`, `jest`, `@testing-library/react`, etc.).

The `package.json` scripts are:
```json
{
  "build": "next build",
  "dev": "next dev",
  "lint": "eslint .",
  "start": "next start"
}
```

No `test` script exists.

## CI Configuration

`.github/workflows/frontend-ci.yml` exists but likely only runs lint/build, not tests.

## Recommended Testing Stack

For this codebase (Next.js App Router, Jotai, Socket.IO):

- **Vitest** — unit/integration testing (compatible with Vite-style config, works well with Next.js)
- **@testing-library/react** — component testing
- **@testing-library/user-event** — user interaction simulation
- **msw (Mock Service Worker)** — HTTP mocking
- **socket.io-mock** or manual mocks — WebSocket testing

## Key Areas to Test

### High Priority

**Game state atoms** (`src/app/gameroom/store/gameAtoms.ts`):
- `updateGameStateAtom` — partial updates, `totalRounds` preservation
- `addUnifiedMessageAtom` — 100-message cap enforcement, Bot Bob detection
- `resetGameStateAtom` — full state reset

**useGameSocket** (`src/app/gameroom/hooks/useGameSocket.ts`):
- Reconnection logic (exponential backoff, max 5 attempts)
- Event listener registry (add/remove, cleanup)
- `sendEvent` 100ms debounce
- `lobby_tick` 50ms debounce

**useGameEvents** (`src/app/gameroom/hooks/useGameEvents.ts`):
- Each event handler maps to correct state update
- Stale closure prevention via refs
- Loading state driven by `isConnected`/`connectionStatus`

**Server Actions** (`src/actions/auth.ts`):
- `signUp` — success, duplicate email, missing env
- `signIn` — success, wrong password
- `joinGameroom` — success, lobby full, network error

### Medium Priority

**API proxy routes** (`src/app/api/admin/[...path]/route.ts`):
- URL routing by path prefix (content service vs lobby manager vs player service)
- Header forwarding and hop-by-hop header removal

**`debounce` utility** (`src/app/gameroom/utils.ts`):
- Multiple rapid calls → only last fires
- Cleanup on component unmount

**Supabase client** (`src/lib/supabase/client.ts`):
- Singleton behaviour (same instance returned on multiple calls)

### Lower Priority

- Animation utilities (`getRandomAttentionAnimation`, `getRandomSnappedSound`, etc.)
- `getPlayerColor` — consistent hash output per player ID
- `formatTime` — edge cases (0s, 60s, overflow)

## Mock Patterns Needed

### Socket.IO Mock
```ts
// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  }))
}));
```

### Supabase Mock
```ts
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    }
  }))
}));
```

### Jotai Test Utils
```tsx
import { createStore } from 'jotai';
import { Provider } from 'jotai';

const store = createStore();
render(<Provider store={store}><Component /></Provider>);
// Then assert on atoms:
expect(store.get(gameStateAtom)).toMatchObject({ loading: false });
```

### window.playSoundEffect Global
```ts
beforeEach(() => {
  window.playSoundEffect = vi.fn();
});
```

## Coverage Gaps (if tests are added)

- No socket reconnection flow test
- No `submission_feedback` event payload test
- No animation timing/cleanup test
- No admin bulk operations test
- No mobile detection (`useIsMobile`) test
- No chat `disconnect` + `reconnect` test
- No performance mode localStorage persistence test
