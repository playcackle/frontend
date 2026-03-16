# Codebase Structure

**Analysis Date:** 2026-03-11

## Directory Layout

```
next-frontend/
├── src/
│   ├── app/                          # Next.js 16 App Router
│   │   ├── layout.tsx                # Root layout with Theme and Provider
│   │   ├── page.tsx                  # Home page
│   │   ├── provider.tsx              # Jotai + Performance providers
│   │   ├── globals.css               # Global styles and CRT effect
│   │   ├── page.module.css           # Home page styles
│   │   ├── loading.module.css        # Loading state styles
│   │   ├── loading.tsx               # Loading fallback component
│   │   ├── api/                      # API route handlers
│   │   │   ├── admin/[...path]/      # Admin service proxy
│   │   │   │   └── route.ts          # Routes /api/admin/* to backend
│   │   │   └── players/[...path]/    # Player service proxy
│   │   │       └── route.ts          # Routes /api/players/* to backend
│   │   ├── auth/                     # Authentication pages
│   │   │   └── callback/             # OAuth callback handler
│   │   ├── gameroom/                 # Core game experience
│   │   │   ├── page.tsx              # Game room main page
│   │   │   ├── gameroom.module.css   # Game room styling
│   │   │   ├── constants.ts          # Game-specific constants
│   │   │   ├── utils.ts              # Game utilities
│   │   │   ├── components/           # Game-specific components
│   │   │   │   ├── SlotGrid.tsx
│   │   │   │   ├── SlotTile.tsx
│   │   │   │   ├── AnswerGrid.tsx
│   │   │   │   ├── AnswerReveal.tsx
│   │   │   │   ├── answerChips/      # Answer chip related components
│   │   │   │   │   └── AnswerBubbles.tsx
│   │   │   │   ├── LeaderBoard.tsx
│   │   │   │   ├── RoomHeader.tsx
│   │   │   │   ├── UnifiedInputForm.tsx
│   │   │   │   ├── UnifiedMessages.tsx
│   │   │   │   ├── CountdownOverlay.tsx
│   │   │   │   ├── BotBobPinnedMessage.tsx
│   │   │   │   ├── PostGameModal.tsx
│   │   │   │   ├── PostGameShowcase.tsx
│   │   │   │   ├── StatsRow.tsx
│   │   │   │   └── PlayerAvatar.tsx
│   │   │   ├── hooks/                # Game-specific hooks
│   │   │   │   ├── useGameSocket.ts  # Socket.IO connection management
│   │   │   │   ├── useChatWs.ts      # Chat WebSocket connection
│   │   │   │   ├── useGameEvents.ts  # Game event processing
│   │   │   │   ├── useGameState.ts   # Game state updates
│   │   │   │   ├── useGameActions.ts # Answer submission, animations
│   │   │   │   └── useAnswerBubbles.ts # Answer bubble management
│   │   │   ├── store/                # Game state (Jotai atoms)
│   │   │   │   └── gameAtoms.ts      # Core game state atoms
│   │   │   └── types/                # Game-specific types
│   │   │       ├── state.ts          # Slot, Score, Accolade, GameState types
│   │   │       └── payloads.ts       # WebSocket event payload types
│   │   ├── gamerooms/                # Browse all game rooms
│   │   │   └── page.tsx
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── page.tsx
│   │   │   ├── components/           # Admin-specific components
│   │   │   │   └── [shared admin components]
│   │   │   ├── collections/          # Collections management
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── topics/               # Topics management
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── slots/                # Slots management
│   │   │   │   └── [id]/
│   │   │   └── lobbies/              # Lobbies management
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── components/
│   │   ├── collections/              # User collections
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration page
│   │   ├── profile/                  # User profile page
│   │   ├── leaderboard/              # Global leaderboard
│   │   └── store/                    # App-wide state
│   │       └── gameRoom.ts           # Selected gameroom atom
│   ├── components/                   # Shared components
│   │   ├── auth-buttons.tsx          # Login/register buttons
│   │   ├── header.tsx                # Navigation header
│   │   ├── gameroom-tile.tsx         # Lobby card component
│   │   ├── home-gamerooms.tsx        # Gameroom list
│   │   ├── home-leaderboard.tsx      # Home leaderboard widget
│   │   ├── home-user-stats.tsx       # User stats widget
│   │   ├── loading-grid.tsx          # Loading skeleton
│   │   ├── error-modal.tsx           # Error display
│   │   ├── onboarding-modal.tsx      # First-time user guide
│   │   ├── settings-controls.tsx     # Settings UI
│   │   ├── performance-modal.tsx     # Performance mode selector
│   │   ├── performance-initializer.tsx # Perf config initialization
│   │   ├── performance-toggle.tsx    # Perf mode toggle
│   │   ├── background-music.tsx      # Audio player
│   │   ├── sound-effects.tsx         # Sound effect manager
│   │   ├── crt-effect.tsx            # CRT screen effect
│   │   └── synthwave-background.tsx  # Background animation
│   ├── atoms/                        # Global Jotai atoms
│   │   └── performance-atom.ts       # Performance mode state
│   ├── contexts/                     # React contexts (minimal use)
│   │   └── performance-context.tsx   # Performance settings context
│   ├── hooks/                        # Shared hooks
│   │   ├── useUser.ts                # Current user + auth changes
│   │   └── use-mobile.tsx            # Mobile device detection
│   ├── lib/                          # Utility libraries
│   │   ├── api/                      # API clients
│   │   │   ├── admin.ts              # Admin CRUD (collections, topics, slots)
│   │   │   └── players.ts            # Player profile API
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── client.ts             # Client-side Supabase instance
│   │   │   └── server.ts             # Server-side Supabase instance
│   │   ├── performance-utils.ts      # Performance monitoring utilities
│   │   └── [other utilities]
│   ├── styles/                       # Global styles
│   │   └── [CSS files]
│   ├── types/                        # Global TypeScript types
│   │   └── navigator.d.ts            # Browser API type definitions
│   ├── actions/                      # Server actions
│   │   ├── auth.ts                   # Authentication actions
│   │   └── joinGameroom.ts           # Join gameroom action
│   └── proxy.ts                      # Middleware for auth/cookies
├── public/                           # Static assets
│   ├── audio/                        # Game audio files
│   └── [images, etc]
├── .next/                            # Build output (generated)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config with @ alias
├── next.config.mjs                   # Next.js config
├── postcss.config.mjs                # PostCSS config
├── .env.local                        # Environment variables (local)
├── env.example                       # Example env file
├── .planning/
│   └── codebase/                     # This directory
└── [config files]
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router pages and layouts
- Contains: Page components, route handlers, nested layouts
- Key files: `layout.tsx`, `provider.tsx`, `page.tsx`

**src/app/gameroom:**
- Purpose: Core game experience implementation
- Contains: Game page, game-specific components, hooks, state, types
- Key files: `page.tsx`, `store/gameAtoms.ts`, `types/payloads.ts`

**src/app/admin:**
- Purpose: Content management admin interface
- Contains: Collections, topics, slots, lobbies management pages
- Key files: Various CRUD pages under subdirectories

**src/app/api:**
- Purpose: Next.js API routes that proxy to backend services
- Contains: Request forwarding logic with URL rewriting
- Key files: `admin/[...path]/route.ts`, `players/[...path]/route.ts`

**src/components:**
- Purpose: Shared UI components used across pages
- Contains: Layout components (header), widgets (stats, leaderboard), modals, audio
- Key files: `header.tsx`, `home-gamerooms.tsx`, `sound-effects.tsx`

**src/atoms:**
- Purpose: Global Jotai atoms for app-wide state
- Contains: Performance mode, other non-local state
- Key files: `performance-atom.ts`

**src/lib/api:**
- Purpose: Typed API client wrappers for backend services
- Contains: Collections, topics, slots, lobbies, players, generation APIs
- Key files: `admin.ts` (~900 lines), `players.ts` (~60 lines)

**src/lib/supabase:**
- Purpose: Supabase authentication and database clients
- Contains: Server and client Supabase instances
- Key files: `server.ts` (SSR auth), `client.ts` (browser auth)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with Radix UI Theme and Jotai Provider
- `src/app/page.tsx`: Home page with lobbies, stats, leaderboard
- `src/app/gameroom/page.tsx`: Game room with WebSocket integration
- `src/app/api/admin/[...path]/route.ts`: Admin API proxy
- `src/app/api/players/[...path]/route.ts`: Player API proxy

**Configuration:**
- `tsconfig.json`: TypeScript config, path aliases (`@/*` → `src/*`)
- `next.config.mjs`: Next.js configuration
- `postcss.config.mjs`: PostCSS configuration
- `package.json`: Dependencies and scripts

**Core Logic:**
- `src/app/gameroom/store/gameAtoms.ts`: All game state atoms (300+ lines)
- `src/app/gameroom/hooks/useGameSocket.ts`: WebSocket connection management
- `src/app/gameroom/hooks/useGameEvents.ts`: Event processing and state updates
- `src/app/gameroom/hooks/useGameActions.ts`: Answer submission and animations
- `src/lib/api/admin.ts`: Comprehensive admin API client (900 lines)

**Testing:**
- No test files detected in codebase

**Styling:**
- `src/app/globals.css`: Global styles, CRT effect, animations
- `src/app/page.module.css`: Home page specific styles
- `src/app/gameroom/gameroom.module.css`: Game room styles
- Component-specific `.module.css` files in `src/components/` and feature directories

## Naming Conventions

**Files:**
- **Components:** PascalCase for `.tsx` files: `GameRoomTile.tsx`, `UnifiedInputForm.tsx`
- **Hooks:** PascalCase prefixed with "use": `useGameSocket.ts`, `useGameActions.ts`
- **Types:** PascalCase in `.ts` files: `payloads.ts`, `state.ts`
- **Utilities:** camelCase: `performance-utils.ts`, `utils.ts`
- **Styles:** `.module.css` for CSS modules: `gameroom.module.css`
- **API clients:** camelCase with Api suffix: `admin.ts`, `players.ts`
- **Atoms:** camelCase with "Atom" suffix: `gameAtoms.ts`, `performance-atom.ts`

**Directories:**
- **Route directories:** lowercase with hyphens: `game-room/`, `auth/`
- **Dynamic routes:** Square brackets: `[...path]/`, `[id]/`
- **Feature directories:** lowercase plural: `components/`, `hooks/`, `atoms/`
- **Nested sections:** Mirroring structure: `admin/collections/`, `app/gameroom/components/`

## Where to Add New Code

**New Game Feature:**
- Primary code: `src/app/gameroom/components/` (component)
- Game state: `src/app/gameroom/store/gameAtoms.ts` (atom definition)
- Hooks: `src/app/gameroom/hooks/` (custom hook if needed)
- Types: `src/app/gameroom/types/payloads.ts` or `state.ts`
- Tests: Not currently in place; would go in `src/app/gameroom/__tests__/`

**New Admin Page (CRUD):**
- Page: `src/app/admin/[feature]/page.tsx`
- Dynamic details: `src/app/admin/[feature]/[id]/page.tsx`
- API calls: Use existing methods in `src/lib/api/admin.ts`
- Styles: `src/app/admin/[feature]/[feature].module.css`

**New Shared Component:**
- Implementation: `src/components/[component-name].tsx`
- Styles: `src/components/[component-name].module.css`
- Export: Re-export from components if used in multiple places
- If component-specific: Place in feature directory instead

**New API Integration:**
- API client: Extend `src/lib/api/admin.ts` or create new file in `src/lib/api/`
- Types: Define in same file or `src/types/` if shared globally
- Usage: Import in pages or hooks

**New Global State:**
- Atom definition: `src/atoms/[feature]-atom.ts`
- If game-specific: Place in `src/app/gameroom/store/gameAtoms.ts`
- Usage: Import useAtom/useAtomValue from jotai

**New Server Action:**
- Implementation: `src/actions/[action-name].ts`
- Mark with `'use server'` directive
- Usage: Import in server components or client components (with "use server" boundary)

## Special Directories

**src/.next:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in .gitignore)

**src/app/api:**
- Purpose: API route handlers that proxy requests
- Generated: No
- Committed: Yes
- Note: Dynamic routes `[...path]` catch all subroutes

**node_modules:**
- Purpose: Installed dependencies
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)

**public/audio:**
- Purpose: Game audio assets (music, sound effects)
- Generated: No
- Committed: Yes

**.env.local:**
- Purpose: Local environment variables (secrets)
- Generated: No (user-created)
- Committed: No (in .gitignore)
- Note: Contains NEXT_PUBLIC_* variables and internal service URLs

---

*Structure analysis: 2026-03-11*
