# INTEGRATIONS.md — External Services & APIs

## Supabase

**Purpose:** Authentication + PostgreSQL database
**Package:** `@supabase/supabase-js ^2.87.1`, `@supabase/ssr ^0.8.0`

**Client-side** (`src/lib/supabase/client.ts`):
```ts
import { createBrowserClient } from '@supabase/ssr'
// Singleton pattern — one client per browser session
export function createClient() { ... }
```

**Server-side** (`src/lib/supabase/server.ts`):
```ts
import { createServerClient } from '@supabase/ssr'
// Cookie-based session management for SSR
export async function createClient() { ... }
```

**Auth flows** (`src/actions/auth.ts`):
- `signUp(formData)` — email/password sign up with email confirmation
- `signIn(formData)` — email/password sign in
- `signOut()` — redirects to `/login`
- `getUser()` — server-side user fetch
- Database trigger auto-creates player record on signup
- Auth callback route: `src/app/auth/callback/route.ts`

**Session management:**
- `useUser()` hook (`src/hooks/useUser.ts`) — client-side user state with `onAuthStateChange` listener
- Server components use `createClient()` from server module

---

## Internal Microservices (via API Proxy)

Next.js acts as a reverse proxy to backend microservices. All internal service calls go through Next.js API routes.

### Proxy Routes

**Admin proxy** (`src/app/api/admin/[...path]/route.ts`):
- Forwards all `GET/POST/PUT/PATCH/DELETE` to internal services
- Routes by path prefix:
  - `/collections`, `/topics`, `/slots`, `/upload-slots`, `/generate` → Content Service
  - `/players` → Player Service
  - All other `/admin/*` paths → Lobby Manager with `/admin` prefix

**Players proxy** (`src/app/api/players/[...path]/route.ts`):
- Forwards player-related API calls

### Service URLs

| Service | Default URL | Env Variable |
|---|---|---|
| Lobby Manager | `http://localhost:8001` | `LOBBY_MANAGER_INTERNAL_URL` |
| Content Service | `http://localhost:8003` | `CONTENT_SERVICE_URL` |
| Player Service | `http://localhost:8004` | `PLAYER_SERVICE_URL` |

### API Client Libraries

**Admin API** (`src/lib/api/admin.ts`):
- Collections, topics, slots management

**Players API** (`src/lib/api/players.ts`):
- Player data fetching

---

## WebSocket Connections (Socket.IO)

Two concurrent Socket.IO connections per game session.

### Game Socket

**Hook:** `src/app/gameroom/hooks/useGameSocket.ts`
**URL source:** `gameroom.game_ws_url` from join response
**Transport:** WebSocket only (`transports: ["websocket"]`)
**Auth:** JWT token in `auth: { token }`

**Events subscribed:**
| Event | Frequency | Debounce |
|---|---|---|
| `lobby_tick` | High (every ~1s) | 50ms |
| `lobby_state_sync` | On reconnect/request | None |
| `game_starting_soon` | Rare | None |
| `waiting_for_players` | Rare | None |
| `round_starting_soon` | Per round | None |
| `new_round_started` | Per round | None |
| `slot_snapped` | Per correct answer | None |
| `round_over` | Per round | None |
| `break_starting` | Per round | None |
| `game_over` | Per game | None |
| `lobby_resetting_for_new_game` | Per game | None |
| `submission_feedback` | Per submission | None |

**Events emitted:**
| Event | Debounce |
|---|---|
| `submit_answer` | 100ms |
| `request_state_sync` | None (on reconnect) |

**Reconnect logic:** Exponential backoff (1s, 2s, 4s… up to 30s), max 5 attempts.

### Chat Socket

**Hook:** `src/app/gameroom/hooks/useChatWs.ts`
**URL:** Base game WS URL + `/chat` namespace
**Transport:** WebSocket only

**Events subscribed:**
- `unified_message` → dispatches to `addUnifiedMessageAtom`
- `connection_success_chat`
- `message_error`
- `disconnect`

**Events emitted:**
- `send_message` (plain text string)

---

## Lobby Manager (Join Flow)

**Action:** `src/actions/joinGameroom.ts`
**URL:** `NEXT_PUBLIC_LOBBY_MANAGER_URL` (client-side direct call)

```
POST {NEXT_PUBLIC_LOBBY_MANAGER_URL}/lobbies/{lobbyId}/join
Body: { player_id: string }
Response: { player_id, token, game_ws_url, chat_ws_url }
```

The join response token is used for all subsequent WebSocket auth.

---

## GitHub CI/CD

**Workflows** (`.github/workflows/`):
- `frontend-build-and-publish.yml` — Docker build & publish
- `frontend-ci.yml` — CI checks (build/lint)
