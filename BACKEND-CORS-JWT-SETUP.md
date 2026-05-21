# Backend CORS + JWT Setup for Vite SPA Migration

The frontend is migrating from Next.js (which proxied API calls server-side) to a Vite SPA that calls backend services directly from the browser. Each backend service needs two things:

1. **CORS middleware** — so the browser allows cross-origin requests from the frontend
2. **JWT validation** — so the backend authenticates requests using the Supabase JWT that the frontend sends as a Bearer token

## Context

- **Frontend origin:** The Cloudflare Pages URL (e.g., `https://cackle.pages.dev` or a custom domain). During local dev, `http://localhost:5173`.
- **Auth provider:** Supabase Auth. The frontend gets a JWT access token from `supabase.auth.getSession()` and sends it as `Authorization: Bearer <token>`.
- **JWT secret:** Found in Supabase Dashboard -> Settings -> API -> JWT Secret. This is the `SUPABASE_JWT_SECRET` env var each service needs.
- **JWT algorithm:** `HS256`
- **JWT payload structure:** Standard Supabase JWT. Admin users have `app_metadata.role === "admin"` in the payload.

## Services to Update

| Service | Framework | Port | Current Auth | Needs |
|---------|-----------|------|-------------|-------|
| `content_service` | FastAPI (Python) | 8003 | None (was behind Next.js proxy) | CORS + `require_admin` on all routes |
| `lobby_manager` | FastAPI (Python) | 8001 | Already public for game joins | CORS + `require_admin` on `/admin/*` routes only |
| `player_service` | FastAPI (Python) | 8004 | None (was behind Next.js proxy) | CORS + `require_user` on player routes, `require_admin` on admin routes |

## Implementation

### Step 1: Add `SUPABASE_JWT_SECRET` env var to all three services

Get the value from: **Supabase Dashboard -> Settings -> API -> JWT Secret**

Set it in each service's environment (Railway dashboard, `.env`, etc.).

### Step 2: CORS Middleware (all three services)

Add this to each FastAPI app's startup. The `FRONTEND_URL` env var should be the production frontend URL (no trailing slash).

```python
import os
from fastapi.middleware.cors import CORSMiddleware

# Allow both production and local dev origins
allowed_origins = [os.environ["FRONTEND_URL"]]
if os.environ.get("FRONTEND_DEV_URL"):
    allowed_origins.append(os.environ["FRONTEND_DEV_URL"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Env vars to set:**
- `FRONTEND_URL` = production frontend URL (e.g., `https://cackle.pages.dev`)
- `FRONTEND_DEV_URL` = `http://localhost:5173` (optional, for local dev)

### Step 3: JWT Validation Dependencies

Create a shared auth module (or add to each service's existing auth/deps file):

```python
import os
from fastapi import Header, HTTPException

try:
    import jwt  # PyJWT
except ImportError:
    raise ImportError("Install PyJWT: pip install PyJWT")

SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]


def _decode_token(authorization: str = Header(...)) -> dict:
    """Extract and validate Supabase JWT from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return payload


def require_user(authorization: str = Header(...)) -> dict:
    """Require any authenticated Supabase user."""
    return _decode_token(authorization)


def require_admin(authorization: str = Header(...)) -> dict:
    """Require an authenticated user with admin role."""
    payload = _decode_token(authorization)
    role = payload.get("app_metadata", {}).get("role")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload
```

**Add `PyJWT` to each service's requirements/dependencies** if not already present.

### Step 4: Apply Dependencies Per Service

#### content_service (port 8003)

All routes are admin-only. Apply `require_admin` to every router:

```python
# In each router file, add the dependency:
from fastapi import Depends
from .auth import require_admin

router = APIRouter(prefix="/collections", dependencies=[Depends(require_admin)])
# ... same for /topics, /slots, /generate routers
```

**Routes that need `require_admin`:**
- `GET/POST /collections`, `GET/PUT/DELETE /collections/{id}`
- `GET/POST /topics`, `GET/PUT/DELETE /topics/{id}`
- `GET/POST /topics/{id}/slots`, `POST /topics/{id}/slots/bulk`, `PUT/DELETE /slots/{id}`
- `POST /generate/topic`, `GET /generate/topic-prompt`, `GET /generate/analyse`

#### lobby_manager (port 8001)

Only `/admin/*` routes need auth. Public game routes (lobby join, etc.) stay open.

```python
# Admin router — require admin
admin_router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])

# Public routes — no auth change needed:
# POST /lobbies/{id}/join (returns game WS URL + token)
# GET /lobbies (public lobby list, if it exists)
```

**Routes that need `require_admin`:**
- `GET /admin/lobbies`, `GET /admin/lobbies/{id}`
- `PUT /admin/lobbies/{id}/config`, `PUT /admin/lobbies/{id}/collection`
- `PUT /admin/lobbies/{id}/visibility`
- `POST /admin/lobbies/{id}/reconfigure`, `POST /admin/lobbies/{id}/change-collection`
- `POST /admin/lobbies/{id}/force-reset`, `POST /admin/lobbies/{id}/make-public`
- `GET /admin/lobbies/{id}/gameroom-config`
- `POST /admin/gamerooms/spawn`, `DELETE /admin/gamerooms/{id}/teardown`
- `POST/GET/DELETE /admin/lobbies/{id}/bots`
- `GET/PATCH /admin/lobbies/{id}/host/settings`
- `GET/POST /admin/lobbies/{id}/fuzzy-match-config`

**Routes that stay public (no auth):**
- `POST /lobbies/{id}/join`

#### player_service (port 8004)

Player profile routes need an authenticated user. Admin lookup routes (if any) need admin.

```python
# Player routes — require authenticated user
player_router = APIRouter(prefix="/players", dependencies=[Depends(require_user)])
```

**Routes that need `require_user`:**
- `GET /players/{id}/profile`
- `GET /players/{id}/accolades/stats`
- `GET /players/{id}/playstyle`
- `GET /players/{id}/category-stats`
- `GET /players/{id}/comparisons`

**Routes that may be public or need different auth:**
- `GET /players/leaderboard` — likely public, decide based on your preference

### Step 5: Enable Public Domains

Each service needs a publicly accessible URL so the browser can reach it directly.

If on Railway:
- Go to each service's Settings -> Networking -> Generate Domain (or add a custom domain)
- Note the public URL — the frontend will use these as `VITE_LOBBY_MANAGER_URL`, `VITE_CONTENT_SERVICE_URL`, `VITE_PLAYER_SERVICE_URL`

If on Cloudflare or other hosting, ensure each service has a public HTTPS endpoint.

### Step 6: Verification

After deploying the changes, verify each service from the browser console or curl:

```bash
# Replace with actual URLs and a valid Supabase JWT

# 1. Should return 401 (no token)
curl -i https://content-service.example.com/collections

# 2. Should return 403 (valid user token, but not admin)
curl -i -H "Authorization: Bearer <user-jwt>" https://content-service.example.com/collections

# 3. Should return 200 (valid admin token)
curl -i -H "Authorization: Bearer <admin-jwt>" https://content-service.example.com/collections

# 4. Should include CORS headers
curl -i -H "Origin: https://cackle.pages.dev" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://content-service.example.com/collections
# Look for: Access-Control-Allow-Origin: https://cackle.pages.dev

# 5. Public endpoints still work without auth
curl -i -X POST https://lobby-manager.example.com/lobbies/test-id/join \
     -H "Content-Type: application/json" \
     -d '{"player_id": "test"}'

# 6. Player routes work with any valid user token
curl -i -H "Authorization: Bearer <user-jwt>" \
     https://player-service.example.com/players/test-id/profile
```

**Get a test JWT:** In the browser, open your app, open dev tools console, run:
```javascript
const { data } = await supabase.auth.getSession();
console.log(data.session.access_token);
```

## Summary of Env Vars Needed Per Service

| Env Var | content_service | lobby_manager | player_service |
|---------|----------------|---------------|----------------|
| `SUPABASE_JWT_SECRET` | Required | Required | Required |
| `FRONTEND_URL` | Required | Required | Required |
| `FRONTEND_DEV_URL` | Optional | Optional | Optional |

## Checklist

- [ ] `PyJWT` added to all three services' dependencies
- [ ] `SUPABASE_JWT_SECRET` env var set on all three services
- [ ] `FRONTEND_URL` env var set on all three services
- [ ] CORS middleware added to all three FastAPI apps
- [ ] `require_admin` applied to content_service routes
- [ ] `require_admin` applied to lobby_manager `/admin/*` routes
- [ ] `require_user` applied to player_service `/players/*` routes
- [ ] Public domains enabled for content_service and player_service
- [ ] Verification: 401 without token, 403 with non-admin token, 200 with admin token
- [ ] Verification: CORS preflight returns correct headers
- [ ] Verification: Public endpoints (lobby join) still work without auth
