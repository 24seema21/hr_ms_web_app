# HarkHR — HRMS Web

An HR management system for growing teams. **Phase 1** delivers the two
public-facing pages — the marketing landing page and login — along with the
project architecture that later phases build on.

Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router ·
React Hook Form + Zod · Vitest + Testing Library.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — defaults to http://localhost:8080
npm run dev
```

Open http://localhost:5173. The port is pinned with `strictPort`, so a clash
fails to start rather than quietly moving to 5174 — see below for why.

### The backend must be running

Sign-in is wired to the real API (`../HRMS_API`, Go + Gin + MySQL). Start it,
and its MySQL database, before trying to log in:

```bash
cd ../HRMS_API/hr_ms_api/login && go run .
```

Accounts come from the `users` table — there are no demo credentials any more.

**Two things that will bite you**, both of which surface in the UI as
_"Could not reach the server"_:

- The API allows exactly one CORS origin, `http://localhost:5173`. Serve the
  frontend from any other port and the browser blocks every login before it
  reaches Go. That is what `server.strictPort` in `vite.config.ts` protects.
- The API dials MySQL at startup and exits if it cannot connect, so "the
  frontend cannot reach the backend" is often really "MySQL is not running".

### What the API returns

`POST /login` takes `{ "email", "password" }` and answers with a message only:

| Status | Body                                | Meaning                    |
| ------ | ----------------------------------- | -------------------------- |
| 200    | `{"message":"Login Successful"}`    | Credentials verified       |
| 401    | `{"message":"Invalid Email"}`       | No such email              |
| 401    | `{"message":"Wrong Password"}`      | bcrypt comparison failed   |
| 400    | `{"message":"Invalid Request"}`     | Body was not valid JSON    |

There is **no token and no profile** in the success response, and no `/logout`
route. See "Known gaps" below.

---

## Scripts

| Command              | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Dev server with hot module replacement         |
| `npm run build`      | Type-check, then produce the production bundle |
| `npm run preview`    | Serve the built bundle locally                 |
| `npm run lint`       | ESLint over the whole project                  |
| `npm run typecheck`  | TypeScript only — no output emitted            |
| `npm test`           | Run the test suite once                        |
| `npm run test:watch` | Re-run tests as files change                   |

Before pushing, all four gates should be clean:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

---

## Folder structure

```
src/
├─ app/                     App-wide wiring only — providers and the route table
├─ features/                Business domains, each self-contained
│  ├─ auth/                 Login, session state, route guard
│  ├─ dashboard/            Stub landing spot for a signed-in user
│  └─ landing/              Public marketing page
├─ shared/                  Domain-agnostic and reusable
│  ├─ components/ui/        Button, ButtonLink, TextField, Logo, Spinner
│  ├─ components/layout/    Container
│  ├─ constants/routes.ts   Every URL in the app
│  └─ lib/cn.ts             Class-name joiner
├─ test/setup.ts            Registers the jest-dom matchers
├─ index.css                Tailwind import + design tokens
└─ main.tsx                 Entry point
```

**Why features instead of `components/` + `hooks/` + `pages/`:** an HRMS grows
into many domains. Type-based folders scatter one feature across five
directories, and you can never tell what is safe to delete. With feature
folders, removing a feature is removing one folder.

**The one rule that keeps it clean:** `shared/` must **never** import from
`features/`. Dependencies flow one way (`features` → `shared`), which makes
circular imports structurally impossible.

Inside a feature the layers are conventional: `api/` talks to the outside
world, `schemas/` validates, `context/` + `hooks/` hold state, `components/`
render, and `pages/` compose components into a screen.

---

## Notable conventions

**Path alias.** `@/` means `src/`, so imports read
`@/shared/components/ui/Button` instead of `../../../shared/...`. It is
declared twice — in `vite.config.ts` for the bundler and in
`tsconfig.app.json` for the editor. Both must be kept in sync.

**Design tokens.** Tailwind v4 is configured in CSS, not a JS config file. The
`@theme` block in `src/index.css` defines the `brand`, `ink`, `danger` and
`success` colour ramps, which is what makes `bg-brand-600`, `text-ink-500` and
friends exist. Rebranding is an edit to that one block.

**No `enum`.** `erasableSyntaxOnly` is enabled in `tsconfig.app.json`, which
bans TypeScript enums and constructor parameter properties. Use `as const`
objects with a derived union type instead — see `shared/constants/routes.ts`.

**Type-only imports.** `verbatimModuleSyntax` is enabled, so importing a type
requires `import type { User } from './types'`. A plain `import` of a type
fails the build.

**Unused variables are errors,** not warnings (`noUnusedLocals` /
`noUnusedParameters`).

**React Router.** Import from `react-router`, not `react-router-dom` — the
latter is deprecated from v7 onward.

---

## How the API layer is wired

Two files know that a network exists:

- [`src/shared/lib/httpClient.ts`](src/shared/lib/httpClient.ts) — one
  configured axios instance (base URL, timeout, JSON headers). Every feature
  imports this rather than calling `axios.get(...)` directly, so a change of
  host or a global 401 handler has exactly one place to live.
- [`src/features/auth/api/authApi.ts`](src/features/auth/api/authApi.ts) — the
  auth feature's only door to the outside. It translates HTTP into domain
  objects: a 401 becomes an `AuthError('invalid_credentials')`, no response at
  all becomes `AuthError('network')`, anything else `AuthError('server')`.

No component, hook or context knows a status code exists — they only know that
`login()` returns a `Promise<AuthResult>` and rejects with an `AuthError`. That
contract is why replacing the Phase 1 mock with the real endpoint touched the
API layer and nothing above it.

### Known gaps in the backend contract

Worth knowing before building on top of this:

- **No token.** A successful login returns only a message, so `AuthResult.token`
  is optional and nothing is sent on later requests. Whatever comes next should
  be an `httpOnly; Secure; SameSite` cookie, not a JSON token (see below).
- **No profile.** The server returns no id, name or role, so `authApi` derives a
  placeholder `User` from the email that was just verified, with the role
  defaulting to `employee` — the least-privileged option, because the frontend
  must never grant a permission the backend has not confirmed. The fix is for
  `POST /login` to return the profile columns, or for a `GET /me` to exist.
- **No `/logout`.** `authApi.logout()` is a deliberate no-op; signing out clears
  the client session only, and the server has nothing to revoke yet.

### Security: read before going to production

- The route guard in `features/auth/components/ProtectedRoute.tsx` is
  **convenience, not security.** Client-side JavaScript can be edited by
  anyone. Real protection is the server refusing to return data without a
  valid session.
- `features/auth/lib/authStorage.ts` persists the **user profile** only, and
  deliberately not a token. Anything in `localStorage`/`sessionStorage` is
  readable by any JavaScript on the page, so one XSS bug would hand over a
  live session. The real token belongs in an `httpOnly; Secure; SameSite`
  cookie set by the backend.
- The backend distinguishes `Invalid Email` from `Wrong Password`;
  `authApi.ts` **deliberately throws that distinction away** and shows one
  message for both. Passing it on would let anyone use the login form to
  discover which addresses are registered — account enumeration, and the first
  step of a credential-stuffing run. The server's wording is still reachable on
  the error's `cause` while debugging. Ideally the API stops distinguishing
  them too.

---

## Testing

Tests live next to the code they cover (`LoginForm.tsx` ↔
`LoginForm.test.tsx`), so a file and its test move and get deleted together.

Elements are queried by **role and label** — `getByLabelText('Work email')`,
`getByRole('button', { name: /sign in/i })` — never by CSS class. That makes
the test do what a real user does: restyling the markup will not break it, but
genuinely breaking the form will. It also doubles as an accessibility check,
because a query by label only passes when the label is correctly wired to its
input.

---

## Scope

**Done:** landing page, login page wired to the live `POST /login`, session
persistence, route guard, and a `/dashboard` stub that exists only so the login
flow has a destination and can be verified end to end.

**Not yet:** signup, forgot-password, server-issued sessions, a real user
profile from the API, dashboard features, the
employee/attendance/leave/payroll modules, role-based permissions, i18n,
dark mode.
