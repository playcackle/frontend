# STACK.md — Technology Stack

## Runtime & Language

- **Runtime:** Node.js (via Next.js)
- **Language:** TypeScript 5.x (strict mode enabled)
- **Target:** ES6, module resolution: bundler
- **Path aliases:** `@/*` → `./src/*`

## Framework

- **Next.js** `^16.0.10` — App Router, standalone output (`output: 'standalone'`)
- **React** `19.2.1` / **React DOM** `19.2.1`
- Build: `next build`, Dev: `next dev`, Start: `next start`

## State Management

- **Jotai** `^2.15.2` — atom-based global state, no context providers beyond `JotaiProvider`
  - `atomWithStorage` for localStorage persistence (performance preferences)
  - `jotai-devtools` `^0.5.3` for development debugging
  - Derived/selector atoms for fine-grained subscriptions

## UI & Styling

- **Radix UI Themes** (`@radix-ui/themes latest`, `radix-ui ^1.4.3`) — dark theme, `appearance="dark"`
- **Radix UI** primitives: `@radix-ui/react-dialog`, `@radix-ui/react-visually-hidden`
- **CSS Modules** — per-component `.module.css` files
- **Tailwind CSS** with `autoprefixer ^10.4.22`, `postcss ^8`
- **Lucide React** `^0.555.0` — icon library
- **next-themes** `^0.4.6` — theme switching

## Animation & Audio

- **GSAP** `^3.13.0` — game animations
- **Animate.css** `latest` — CSS animation classes (e.g., `animate__animated animate__*`)
- **canvas-confetti** `^1.9.4` — confetti effects
- Custom Web Audio API usage via `window.playSoundEffect` global
- Audio files in `public/audio/` (`.wav`, `.mp3`)

## Networking

- **Socket.IO Client** `^4.8.1` — WebSocket connections for game state and chat
  - Two separate socket connections per game session: game socket + chat socket (`/chat` namespace)
  - Custom reconnect logic with exponential backoff (max 5 attempts, max 30s delay)
  - 50ms debounce on `lobby_tick`, 100ms debounce on `sendEvent`

## Authentication

- **Supabase** (`@supabase/supabase-js ^2.87.1`, `@supabase/ssr ^0.8.0`) — auth + database
  - `createBrowserClient` for client-side (singleton pattern)
  - `createServerClient` for Server Components/Actions/Route Handlers
- **next-auth** `^4.24.13` — also present but Supabase is primary auth
- **bcryptjs** `^3.0.3` — password hashing

## Forms & Validation

- **@hookform/resolvers** `^5.2.2`
- **input-otp** `1.4.2`
- **cmdk** `1.1.1` — command palette component

## Utilities

- **date-fns** `4.1.0` — date formatting
- **class-variance-authority** `^0.7.1` — conditional class utilities

## Dev Dependencies

- `@types/node ^24`, `@types/react 19.2.7`, `@types/react-dom 19.2.3`
- `@types/canvas-confetti ^1.9.0`

## Configuration

- `next.config.mjs` — `output: 'standalone'` for Docker
- `tsconfig.json` — strict mode, incremental build, Next.js plugin
- `postcss.config.mjs` — Tailwind + autoprefixer
- `.env.local` for local secrets (not committed)

## Environment Variables

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client + server) |
| `NEXT_PUBLIC_LOBBY_MANAGER_URL` | Lobby manager WebSocket/HTTP base URL |
| `NEXT_PUBLIC_SITE_URL` | Site URL for auth email redirects |
| `LOBBY_MANAGER_INTERNAL_URL` | Internal URL for admin proxy (default: `http://localhost:8001`) |
| `CONTENT_SERVICE_URL` | Content service URL (default: `http://localhost:8003`) |
| `PLAYER_SERVICE_URL` | Player service URL (default: `http://localhost:8004`) |

## Docker

- `Dockerfile` present, `docker-compose.yml` present, `.dockerignore` present
- Standalone Next.js output for minimal Docker image
- `README.docker.md`, `README.docker.simple.md` for deployment docs
