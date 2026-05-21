# Migration: Next.js → Vite + TanStack + Railway

Migrates the frontend from Next.js 15 (App Router, SSR, API proxy) to a Vite SPA with
TanStack Router/Query/Table/Form, direct backend calls, and Railway deployment.

**What stays:** Jotai atoms, Socket.io hooks, all UI components, Radix UI, GSAP, Supabase auth.  
**What goes:** Next.js, `@supabase/ssr`, `middleware.ts`, Next.js API proxy routes, `next-auth`, `next-themes`.

---

## Phase 0 — Railway (current Next.js app)

Deploy the existing Next.js app to Railway before any code changes.

### 0.1 Railway project setup

1. Create a new Railway project and add a service pointed at this repo.
2. In the service settings, confirm Railway detects it as a Node.js project (Nixpacks).
3. `railway.toml` is already committed — Railway will use `npm run start` as the start command.

### 0.2 Environment variables in Railway dashboard

Set the following on the service. Variables marked **Build + Runtime** must be available
during the build step (they get baked into the client bundle).

| Variable | Phase | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + Runtime | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build + Runtime | Supabase anon key |
| `NEXT_PUBLIC_LOBBY_MANAGER_URL` | Build + Runtime | Public Railway URL of lobby_manager |
| `LOBBY_MANAGER_INTERNAL_URL` | Runtime | `http://lobby-manager.railway.internal:8001` |
| `CONTENT_SERVICE_URL` | Runtime | `http://content-service.railway.internal:8003` |
| `PLAYER_SERVICE_URL` | Runtime | `http://player-service.railway.internal:8004` |
| `AUTH_SECRET` | Runtime | Random 32-char secret |
| `SENTRY_AUTH_TOKEN` | Build | From Sentry → Settings → Auth Tokens |

Use Railway private networking hostnames (`*.railway.internal`) for the internal service
URLs — they're free and don't leave the Railway project.

### 0.3 Verify deployment

Trigger a deploy and confirm the app loads at the Railway-generated URL.

---

## Phase 1 — Backend changes (prerequisite for removing the proxy)

These changes happen in the backend repos, not this one. They must be deployed before
the frontend switches to direct API calls.

### 1.1 content_service

**Add CORS middleware**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ["FRONTEND_URL"]],  # e.g. https://cackle.railway.app
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Add JWT + admin role validation dependency**
```python
import jwt  # PyJWT

SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

def require_admin(authorization: str = Header(...)):
    token = authorization.removeprefix("Bearer ")
    payload = jwt.decode(
        token,
        SUPABASE_JWT_SECRET,
        algorithms=["HS256"],
        options={"verify_aud": False},
    )
    if payload.get("app_metadata", {}).get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return payload
```

Apply `require_admin` as a dependency to all router groups under `/collections`,
`/topics`, `/slots`, and `/generate`.

**Enable public Railway domain** for content_service in the Railway dashboard.

**Add env var** `SUPABASE_JWT_SECRET` — found in Supabase → Settings → API → JWT Secret.

### 1.2 lobby_manager

lobby_manager already has a public URL (players use it to join games). Only additions needed:

- Same CORS middleware as above.
- Apply `require_admin` dependency to all routes under the `/admin` prefix.
- Add `SUPABASE_JWT_SECRET` env var.

### 1.3 player_service

- Same CORS middleware.
- Apply `require_admin` to any admin-only routes (e.g. player lookup, stats).
- Enable public Railway domain if not already present.
- Add `SUPABASE_JWT_SECRET` env var.

### 1.4 Verification

Before proceeding to Phase 2, confirm that each service:
- Returns `401` when called without a token
- Returns `403` when called with a valid non-admin token
- Returns `200` when called with a valid admin token
- Returns correct CORS headers for requests from the frontend origin

---

## Phase 2 — Vite scaffold (alongside Next.js)

Set up Vite as a parallel entry point. Next.js continues to run until Phase 5.

### 2.1 Install dependencies

```bash
npm install --save-dev vite @vitejs/plugin-react vite-tsconfig-paths
npm install @tanstack/react-router @tanstack/router-plugin @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table @tanstack/react-form
```

Remove packages that are Next.js-specific (do this at the end of the full migration, not now):
`next`, `next-auth`, `next-themes`, `@supabase/ssr`

### 2.2 Create `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to backend services during local dev
      '/api/admin/collections': { target: 'http://localhost:8003', rewrite: p => p.replace('/api/admin', '') },
      '/api/admin/topics':      { target: 'http://localhost:8003', rewrite: p => p.replace('/api/admin', '') },
      '/api/admin/slots':       { target: 'http://localhost:8003', rewrite: p => p.replace('/api/admin', '') },
      '/api/admin/generate':    { target: 'http://localhost:8003', rewrite: p => p.replace('/api/admin', '') },
      '/api/admin':             { target: 'http://localhost:8001', rewrite: p => p.replace('/api', '') },
      '/api/players':           { target: 'http://localhost:8004', rewrite: p => p.replace('/api', '') },
    },
  },
})
```

### 2.3 Create `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cackle</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.4 Create `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'  // auto-generated by TanStack Router plugin

const queryClient = new QueryClient()
const router = createRouter({ routeTree, context: { queryClient } })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
```

### 2.5 Update `package.json` scripts

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "start": "vite preview --port 3000",
  "preview": "vite preview"
}
```

`vite preview` is for local preview only. Railway production serving is handled separately
(see Phase 5).

---

## Phase 3 — Auth migration (SSR → client-side)

### 3.1 Replace Supabase client

Delete `src/lib/supabase/server.ts` (server-only client, no longer needed).

Update `src/lib/supabase/client.ts` to export a single shared client instance:

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

### 3.2 Update env var names

Vite exposes env vars via `import.meta.env` and requires the `VITE_` prefix for
client-accessible vars (unlike Next.js `NEXT_PUBLIC_`).

Rename in `.env.local` and Railway dashboard:

| Old | New |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `VITE_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` |
| `NEXT_PUBLIC_LOBBY_MANAGER_URL` | `VITE_LOBBY_MANAGER_URL` |

Add new vars for direct backend access:
| Variable | Value |
|---|---|
| `VITE_CONTENT_SERVICE_URL` | Public Railway URL of content_service |
| `VITE_PLAYER_SERVICE_URL` | Public Railway URL of player_service |

Remove vars that no longer apply: `LOBBY_MANAGER_INTERNAL_URL`, `CONTENT_SERVICE_URL`,
`PLAYER_SERVICE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`.

### 3.3 Update `src/hooks/useUser.ts`

Replace the `createServerClient` call with the shared browser client from step 3.1.
The hook interface stays the same — components don't change.

### 3.4 Auth context in the router

Add auth state to the router context so `beforeLoad` guards can access it:

```ts
// src/router.tsx
import { supabase } from '@/lib/supabase/client'

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: { user: null },  // populated in __root.tsx loader
  },
})
```

In `src/routes/__root.tsx`, load the current user before any route renders:

```ts
export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const { data: { user } } = await supabase.auth.getUser()
    context.auth.user = user
  },
})
```

---

## Phase 4 — Update the API client

### 4.1 Update `src/lib/api/admin.ts`

Replace the `apiFetch` helper to call backend services directly with the Supabase token:

```ts
import { supabase } from '@/lib/supabase/client'

const SERVICE_URLS = {
  content: import.meta.env.VITE_CONTENT_SERVICE_URL,
  lobby:   import.meta.env.VITE_LOBBY_MANAGER_URL,
  player:  import.meta.env.VITE_PLAYER_SERVICE_URL,
}

type Service = keyof typeof SERVICE_URLS

const CONTENT_PREFIXES = ['/collections', '/topics', '/slots', '/generate']
const PLAYER_PREFIXES  = ['/players']

const resolveService = (path: string): [Service, string] => {
  if (CONTENT_PREFIXES.some(p => path.startsWith(p))) return ['content', path]
  if (PLAYER_PREFIXES.some(p => path.startsWith(p)))  return ['player', path]
  return ['lobby', `/admin${path}`]
}

const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Not authenticated')

  const [service, resolvedPath] = resolveService(path)
  const url = `${SERVICE_URLS[service]}${resolvedPath}`

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...init, headers })
  if (res.status === 401) throw new Error('You must be logged in to access this.')
  if (res.status === 403) throw new Error("You don't have permission to access this.")
  return res
}
```

Everything below `apiFetch` in `admin.ts` (all the `collectionsApi`, `topicsApi`, etc.) stays
unchanged — they just call `apiFetch` with paths as before.

### 4.2 Update `src/lib/api/players.ts`

Same pattern — replace `/api/players/...` calls with direct calls to `VITE_PLAYER_SERVICE_URL`.

---

## Phase 5 — Migrate routes

Create `src/routes/` and migrate each page from `src/app/`. Work top-down: shared layout
first, then public pages, then protected pages, then admin.

### 5.1 Route file map

| `src/app/` (old) | `src/routes/` (new) |
|---|---|
| `layout.tsx` | `__root.tsx` |
| `page.tsx` | `index.tsx` |
| `gamerooms/page.tsx` | `gamerooms.tsx` |
| `gameroom/page.tsx` | `gameroom.tsx` |
| `leaderboard/page.tsx` | `leaderboard.tsx` |
| `profile/page.tsx` | `profile.tsx` |
| `admin/layout.tsx` | `admin/__layout.tsx` |
| `admin/page.tsx` | `admin/index.tsx` |
| `admin/collections/page.tsx` | `admin/collections/index.tsx` |
| `admin/collections/[id]/page.tsx` | `admin/collections/$id.tsx` |
| `admin/topics/page.tsx` | `admin/topics/index.tsx` |
| `admin/topics/[id]/page.tsx` | `admin/topics/$id.tsx` |
| `admin/lobbies/page.tsx` | `admin/lobbies/index.tsx` |
| `admin/lobbies/[id]/page.tsx` | `admin/lobbies/$id.tsx` |
| `admin/slots/[id]/page.tsx` | `admin/slots/$id.tsx` |
| `auth/login/page.tsx` | `auth/login.tsx` |
| `auth/register/page.tsx` | `auth/register.tsx` |
| `auth/callback/page.tsx` | `auth/callback.tsx` |

### 5.2 Page-level changes per route

- Remove `"use client"` directives (all Vite components are client-side by default).
- Replace `useRouter()` from `next/navigation` with `useNavigate()` from `@tanstack/react-router`.
- Replace `<Link href="...">` from `next/link` with `<Link to="...">` from `@tanstack/react-router`.
- Replace dynamic route params (`params.id` from Next.js) with `Route.useParams()`.

### 5.3 Admin route guard

In `src/routes/admin/__layout.tsx`:

```ts
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) throw redirect({ to: '/auth/login' })
    if (context.auth.user.app_metadata?.role !== 'admin') throw redirect({ to: '/' })
  },
  component: AdminLayout,
})
```

### 5.4 `next-themes` replacement

Replace `next-themes` with a Jotai atom + `useEffect` that applies a `data-theme` attribute
to `document.documentElement`. Initialise from `localStorage` on mount.

---

## Phase 6 — TanStack Query in admin pages

With the routes migrated, replace all `useState` + `useEffect` fetch patterns in admin pages.

### Pattern to replace

```ts
// Before
const [collections, setCollections] = useState<Collection[]>([])
const [loading, setLoading] = useState(true)
useEffect(() => { loadCollections() }, [])
const loadCollections = async () => { /* fetch, setCollections, setLoading */ }
```

```ts
// After
const { data: collections = [], isLoading } = useQuery({
  queryKey: ['collections'],
  queryFn: collectionsApi.getAll,
})
```

### Mutations

```ts
const queryClient = useQueryClient()

const deleteMutation = useMutation({
  mutationFn: (id: number) => collectionsApi.delete(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
})
```

Eliminates all manual `loadCollections()` calls after create/update/delete.

### Polling (lobbies page)

```ts
const { data: lobbies = [] } = useQuery({
  queryKey: ['lobbies'],
  queryFn: lobbiesApi.getAll,
  refetchInterval: 5000,  // replaces setInterval
})
```

### Query keys reference

| Data | Query key |
|---|---|
| All collections | `['collections']` |
| Single collection | `['collections', id]` |
| All topics | `['topics']` |
| Topics by collection | `['topics', { collectionId }]` |
| Single topic | `['topics', id]` |
| Slots by topic | `['slots', { topicId }]` |
| Single slot | `['slots', id]` |
| All lobbies | `['lobbies']` |
| Single lobby | `['lobbies', lobbyId]` |

---

## Phase 7 — TanStack Table in admin list views

Replace manual `.map()` table rendering with `useReactTable` in the four main list pages:
collections, topics, slots, lobbies.

### Minimal setup

```ts
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'

const table = useReactTable({
  data: collections,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
})
```

Define `columns` with `createColumnHelper<Collection>()` outside the component to avoid
re-renders.

Benefits over the current approach:
- Sorting (the lobbies page has manual `.sort()` — this replaces it)
- Type-safe column definitions
- Extensible to filtering/pagination later without structural changes

---

## Phase 8 — TanStack Form in admin CRUD forms

Replace `react-hook-form` + `@hookform/resolvers` with `@tanstack/react-form`.

### Pattern to replace

```ts
// Before (react-hook-form)
const { register, handleSubmit, formState: { errors } } = useForm<CollectionCreate>({
  resolver: zodResolver(schema),
})
```

```ts
// After (TanStack Form)
const form = useForm({
  defaultValues: { name: '', description: '' },
  onSubmit: async ({ value }) => {
    await createMutation.mutateAsync(value)
  },
})
```

Field registration:
```tsx
<form.Field name="name">
  {field => (
    <input
      value={field.state.value}
      onChange={e => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

Forms to migrate: collection create/edit, topic create/edit, slot create/edit, lobby config.

---

## Phase 9 — Railway update + cleanup

### 9.1 Update `package.json` scripts and `railway.toml`

`server.mjs` is already committed. Update the `start` script in `package.json`:

```json
"scripts": {
  "dev":   "vite",
  "build": "tsc -b && vite build",
  "start": "node server.mjs"
}
```

`server.mjs` is a production Node.js server that:
- Reads `$PORT` from the environment (Railway injects this at runtime)
- Serves `dist/assets/` with `Cache-Control: immutable` (Vite outputs content-hashed filenames)
- Serves `index.html` with `no-cache` so new deploys take effect immediately
- Falls back to `index.html` for all unmatched routes (SPA routing)
- Serves pre-compressed gzip/brotli where the client supports it

Update `railway.toml` — `startCommand` already points to `npm run start`, no change needed.

`sirv` is already in `dependencies` (added during setup).

### 9.2 Remove Next.js packages

```bash
npm uninstall next next-auth next-themes @supabase/ssr @next/bundle-analyzer @sentry/nextjs
```

Install Sentry Vite plugin as replacement:
```bash
npm install --save-dev @sentry/vite-plugin
```

Add to `vite.config.ts`:
```ts
import { sentryVitePlugin } from '@sentry/vite-plugin'

plugins: [
  // ...existing plugins
  sentryVitePlugin({ org: 'cackle-n4', project: 'next-frontend' }),
]
```

### 9.3 Delete obsolete files

```
src/app/                          ← entire Next.js app directory
src/lib/supabase/server.ts        ← server-only Supabase client
src/middleware.ts                 ← session refresh middleware
next.config.mjs
next-env.d.ts
sentry.server.config.ts           ← replaced by vite plugin
sentry.edge.config.ts             ← replaced by vite plugin
```

### 9.4 Update env vars in Railway dashboard

Remove: `LOBBY_MANAGER_INTERNAL_URL`, `CONTENT_SERVICE_URL`, `PLAYER_SERVICE_URL`,
`AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_*` variables.

Add: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_LOBBY_MANAGER_URL`,
`VITE_CONTENT_SERVICE_URL`, `VITE_PLAYER_SERVICE_URL`.

Note: Vite bakes `VITE_*` vars into the bundle at build time. In Railway, ensure these
are set as **Build Variables** (available during the build step), not just runtime variables.

### 9.5 Update `tsconfig.json`

Remove Next.js-specific compiler options (`jsx: preserve`, `plugins: [{ name: 'next' }]`)
and replace with Vite defaults:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## Execution order

```
Phase 0  → Deploy current Next.js app to Railway
Phase 1  → Backend: CORS + JWT middleware + public domains
Phase 2  → Vite scaffold (new entry point, routes tree skeleton)
Phase 3  → Auth: swap @supabase/ssr for client-side Supabase
Phase 4  → API client: remove proxy layer, call services directly
Phase 5  → Migrate routes one-by-one (landing → public → admin)
Phase 6  → TanStack Query in all admin pages
Phase 7  → TanStack Table in admin list views
Phase 8  → TanStack Form in admin CRUD forms
Phase 9  → Remove Next.js, update Railway, final cleanup
```

Phases 0 and 1 are independent and can happen in parallel. Phases 2–4 should complete
on a feature branch before any route migration begins. Each phase in 5–8 is independently
shippable — the app remains runnable throughout.
