# Architecture

**Analysis Date:** 2026-03-11

## Pattern Overview

**Overall:** Hybrid Server/Client Component Architecture with Real-Time WebSocket Communication

**Key Characteristics:**
- Next.js 16 App Router with server-side rendering and API proxying
- Client-side state management using Jotai (atomic state) for real-time game state
- WebSocket-based game event streaming via Socket.IO
- Supabase authentication with server-side session management
- Multi-service backend proxy pattern (Lobby Manager, Content Service, Player Service, Gameroom instances)

## Layers

**Server Layer (Server Components & API Routes):**
- Purpose: Initial page rendering, authentication, layout setup, API proxying to backend services
- Location: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/`, `src/proxy.ts`
- Contains: Server components, metadata, layouts, request forwarding
- Depends on: Supabase (SSR client), environment variables for backend URLs
- Used by: All pages and client components for authenticated access

**Data Access & Integration Layer:**
- Purpose: Communicate with backend microservices and Supabase
- Location: `src/lib/api/admin.ts`, `src/lib/api/players.ts`, `src/lib/supabase/`
- Contains: Typed API clients with methods for collections, topics, slots, lobbies, player profiles, generation
- Depends on: Fetch API, environment configuration
- Used by: Server components, client hooks, admin pages

**State Management Layer:**
- Purpose: Centralized real-time game state and UI state
- Location: `src/app/gameroom/store/gameAtoms.ts`, `src/atoms/performance-atom.ts`, `src/app/store/gameRoom.ts`
- Contains: Jotai atoms for game state, animations, messages, performance settings
- Depends on: Jotai library, localStorage (for persistence)
- Used by: All gameroom components and hooks

**WebSocket Communication Layer:**
- Purpose: Real-time game events and chat messages
- Location: `src/app/gameroom/hooks/useGameSocket.ts`, `src/app/gameroom/hooks/useChatWs.ts`
- Contains: Socket.IO connection management with reconnection logic, event listeners, debouncing
- Depends on: Socket.IO client, game state atoms
- Used by: Game page to maintain connection and dispatch events

**Business Logic Layer:**
- Purpose: Game-specific behavior, animations, input handling, event processing
- Location: `src/app/gameroom/hooks/useGameActions.ts`, `src/app/gameroom/hooks/useGameEvents.ts`, `src/app/gameroom/hooks/useGameState.ts`
- Contains: Custom hooks for action submission, event processing, animation triggering
- Depends on: Jotai atoms, Sound Effects component, DOM manipulation
- Used by: Gameroom page and components

**Components Layer:**
- Purpose: UI rendering and user interaction
- Location: `src/components/`, `src/app/gameroom/components/`, `src/app/admin/`
- Contains: React components for rendering game UI, forms, modals, lists
- Depends on: Component libraries (Radix UI), Jotai atoms, CSS modules
- Used by: Pages and other components

**Styling & Animation:**
- Purpose: Visual effects, animations, themes
- Location: `src/styles/`, `src/app/globals.css`, `.module.css` files
- Contains: CSS modules, global styles, Radix UI theming
- Depends on: Animate.css, GSAP, custom CSS animations
- Used by: Components

## Data Flow

**Home Page Load (Authenticated User):**

1. Server-side: `layout.tsx` creates Supabase client and fetches user
2. Server-side: `page.tsx` fetches available lobbies from backend via `fetchGamerooms()`
3. Server-side: Renders home page with lobby list, user stats, leaderboard
4. Client-side: `Provider` wraps app with Jotai provider
5. Client-side: Home components fetch additional data (stats, leaderboard via API calls)

**Game Room Entry:**

1. User navigates to `/gameroom/[id]`
2. Page loads `gameRoomAtom` which should contain selected lobby info
3. Server middleware authenticates session via `proxy.ts`
4. Page initializes WebSocket connections via `useGameSocket()` and `useChatWs()`
5. Socket emits `connection_success` event, updates `gameStateAtom`

**Slot Snapped (Core Game Loop):**

1. Backend sends `slot_snapped` event via game WebSocket
2. `useGameEvents()` hook receives payload and dispatches it
3. Event updates `gameStateAtom` with new slot state, scores, and accolades
4. Animations triggered via `updateAnimationStateAtom` and `useGameActions.triggerCorrectAnswerEffects()`
5. Sound effects play if performance mode enabled
6. Components re-render only affected parts (React optimization)

**Answer Submission:**

1. User types in `UnifiedInputForm` and submits
2. Form clears input, calls `submitAnswer()` from `useGameActions`
3. `useGameActions` sends `submit_answer` event via game socket
4. Backend validates and responds with `submission_feedback` payload
5. Feedback contains status: success/incorrect/too_slow/already_snapped
6. Event handler in `useGameEvents` processes feedback and may trigger animations

**Admin Content Management:**

1. Admin navigates to `/admin/collections`, `/admin/topics`, etc.
2. Server component calls `collectionsApi.getAll()`, `topicsApi.getAll()` etc.
3. Forms for CRUD operations use `collectionsApi.create()`, `.update()`, `.delete()`
4. Excel file uploads use `topicsApi.uploadExcel()`
5. AI content generation via `generationApi.generateTopic()`

**State Management:**

- **Derived atoms:** Components subscribe to specific game state slices (playerCount, timeRemaining, etc.) to prevent unnecessary re-renders
- **Message system:** Unified messages atom combines chat and answer attempts
- **Animation state:** Separate from game state for cleaner updates
- **Reset atoms:** Action atoms that perform bulk state resets (e.g., at game end)

## Key Abstractions

**Unified Messages System:**
- Purpose: Combine chat messages and answer attempt feedback into single feed
- Examples: `src/app/gameroom/store/gameAtoms.ts` (UnifiedMessage type), `src/app/gameroom/components/UnifiedMessages.tsx`
- Pattern: Type union with discriminated `message_type` field; single atom with add/clear actions

**API Client Pattern:**
- Purpose: Typed, error-handling HTTP communication with backend services
- Examples: `src/lib/api/admin.ts`, `src/lib/api/players.ts`
- Pattern: Fetch wrapper with baseUrl, error parsing, return types for each operation

**Socket.IO Event Listener Management:**
- Purpose: Type-safe event handling with debouncing and reconnection
- Examples: `src/app/gameroom/hooks/useGameSocket.ts`, `src/app/gameroom/hooks/useChatWs.ts`
- Pattern: Listener map with Set, memoized event handler functions, cleanup in useEffect

**Animation Trigger Pattern:**
- Purpose: Orchestrate DOM animations, sound effects, and state updates
- Examples: `src/app/gameroom/hooks/useGameActions.ts` (triggerCorrectAnswerEffects)
- Pattern: Create overlay divs, apply CSS classes, remove after animation completes, reset state

**Jotai Atom Pattern:**
- Purpose: Atomic state updates with derived atoms to optimize re-renders
- Examples: `src/app/gameroom/store/gameAtoms.ts`
- Pattern: Base atom + derived read-only atoms + action atoms for writes

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`, authenticated or not
- Responsibilities: Fetch lobbies, display game list, user stats, leaderboard, auth buttons

**Game Room Page:**
- Location: `src/app/gameroom/page.tsx`
- Triggers: User joins a lobby
- Responsibilities: Initialize WebSocket connections, render game UI, handle real-time updates

**Admin Pages:**
- Location: `src/app/admin/collections/`, `src/app/admin/topics/`, etc.
- Triggers: Admin user navigates to `/admin/*`
- Responsibilities: Display content management UI, handle CRUD operations

**API Proxy Routes:**
- Location: `src/app/api/players/[...path]/route.ts`, `src/app/api/admin/[...path]/route.ts`
- Triggers: Any fetch to `/api/players/*` or `/api/admin/*`
- Responsibilities: Forward requests to backend services with proper URL rewriting

**Auth Routes:**
- Location: `src/app/auth/callback` (OAuth callback), `src/app/login`, `src/app/register`
- Triggers: User authentication flow
- Responsibilities: Handle OAuth callbacks, login/signup forms

## Error Handling

**Strategy:** Error boundary approach with fallback UI, console logging, user-facing error modals

**Patterns:**

- **API errors:** Try/catch in API clients, throw with descriptive message, caught in pages/hooks
- **Socket errors:** Reconnection attempts with exponential backoff, error state in `useGameSocket`
- **Validation errors:** Form validation in UI layer, server-side validation in API layer
- **Component errors:** Error boundary wrapper not visible (implicit graceful degradation)
- **Socket connection:** Fallback to null state if not connected, shows loading indicator

## Cross-Cutting Concerns

**Logging:**
- Pattern: Console.log/warn/error in hooks and utilities
- Debouncedly log socket errors to prevent spam
- Performance metrics logged via `PerformanceInitializer` component

**Validation:**
- React Hook Form for client-side validation (admin forms)
- Server-side validation in backend services
- Type safety via TypeScript throughout

**Authentication:**
- Supabase Auth via SSR client (`src/lib/supabase/server.ts`)
- Client-side auth state in `useUser()` hook
- Session refresh on page navigation via middleware proxy
- Protected routes via server-side auth checks

**Performance Optimization:**
- Debouncing high-frequency events (lobby ticks) in game socket
- Derived atoms prevent unnecessary re-renders
- Lazy loading for admin pages
- CSS module scoping prevents style conflicts
- Performance mode toggle to disable animations and sounds

**Real-Time Synchronization:**
- Socket.IO for game events (one-way from server to client)
- Chat WebSocket for chat messages (bidirectional)
- State synced via `lobby_state_sync` event on connection

---

*Architecture analysis: 2026-03-11*
