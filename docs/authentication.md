# DIVU frontend authentication and gateway integration

The DIVU frontend and backend remain separate repositories. The browser communicates with same-origin Next.js route handlers, and those handlers communicate with the public backend gateway.

```text
Browser -> Next.js /api route -> Authorization: Bearer <JWT> -> http://localhost:8080
```

## Local configuration

Set these server environment values in `.env.local`:

```dotenv
BACKEND_API_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

`BACKEND_API_URL` is the value used by the server-only gateway helper. The development default is `http://localhost:8080`; production deliberately fails configuration when it is missing. `NEXT_PUBLIC_API_URL` documents the public gateway origin but authenticated browser code must call the same-origin BFF routes, not the gateway directly.

Run the backend gateway separately, then run the frontend:

```powershell
npm run dev
```

Development credentials supplied by the backend team are `admin` / `admin123`. Do not publish or reuse them outside local development.

## Login and session contract

The browser submits `POST /api/auth/login` with `{ "username", "password" }`. The Next.js handler forwards the request to `POST http://localhost:8080/api/auth/login`. On a successful backend response, the handler stores the signed token in `divu_access_token` with these attributes:

- HttpOnly
- SameSite=Lax
- Path=/
- Secure in production
- Maximum age of eight hours

The response exposed to browser JavaScript contains only `username`, `role`, and `uid`; it never contains the token. No access token is stored in localStorage or sessionStorage.

Protected pages are checked against a protected gateway endpoint. This is temporary validation until the backend supplies `GET /api/auth/me`. Claims are used only for minimum display identity after the backend has accepted the token; decoding alone is not authentication.

`POST /api/auth/logout` deletes the cookie and returns HTTP 204. There is currently no backend logout endpoint.

When a protected gateway call returns 401, the BFF deletes the cookie and returns 401. The browser API helper redirects to `/login?reason=session-expired`. A login failure is excluded from this session-expiry behavior.

## Available BFF APIs

All authenticated gateway responses use `cache: no-store`.

- `GET /api/backend/dashboard`
- `GET /api/backend/dashboard/analytics`
- `GET|POST /api/backend/runs`
- `GET /api/backend/runs/active`
- `GET /api/backend/runs/stations`
- `PATCH /api/backend/runs/{rid}/close`
- `GET|POST /api/backend/products`
- `GET|PUT|DELETE /api/backend/products/{pid}`
- Sensor stream, sensor, reading, run-reading, and analytics routes under `/api/backend/sensors/*`
- `GET /api/backend/audit`

The server helper applies a ten-second timeout, safely parses JSON and text errors, supports 204 responses, maps connectivity failures to 503, and maps malformed successful responses to 502.

## Password recovery

`POST /api/auth/forgot-password` forwards the normalized identifier and displays the backend's enumeration-safe response verbatim. The backend does not currently deliver an email, so the frontend does not assert that delivery occurred.

`POST /api/auth/reset-password` returns HTTP 501. Password-reset completion remains visibly unavailable until the gateway implements it. The frontend has no local password database or fallback persistence.

## Missing backend capabilities

The centralized `lib/backend-capabilities.ts` flags users, roles, departments, assets, governance, approvals, notifications, reports, financial analytics, security operations, API clients, data sources, profile, and settings as unavailable. Those screens retain the established visual demonstrations and display an explicit demonstration-data notice. They do not call nonexistent APIs. AI actions remain disabled because the current port-9000 services bypass gateway authentication.

The current backend also lacks refresh tokens, session revocation/logout, `GET /api/auth/me`, and password-reset completion. The gateway must eventually supply these features; they must not be recreated as frontend persistence.

## Olive

Olive is enabled through authenticated same-origin BFF routes under `/api/backend/ai/*`. Browser code never calls the private port-9000 service. The strict allowlist covers chat, alerts, station failure probabilities, notifications, rules, settings, and authorized manual scans. The dedicated `/api/backend/ai/events` handler streams the gateway SSE body without passing it through the JSON helper and forwards the existing HttpOnly-cookie session as a backend bearer token.

The UI identifies the service as “Olive”: deterministic, explainable operations intelligence generated inside DIVU from current database data. It must not be described as ChatGPT or a hosted generative LLM.

## Validation commands

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Manual checks cover valid and invalid login, cookie attributes, refresh persistence, logout, unauthenticated and expired sessions, gateway dashboard/runs/stations/sensors/audit responses, empty and error states, and the absence of token storage in browser-accessible storage.
