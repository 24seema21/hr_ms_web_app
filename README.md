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
cp .env.example .env.local   # optional in Phase 1 — auth is mocked
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Demo credentials

Authentication is mocked in Phase 1, so exactly one account exists:

| Email         | Password      |
| ------------- | ------------- |
| `hr@demo.com` | `Password123` |

They are also shown on the login page itself.

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

## Swapping in a real backend

All the fake data lives in **one file**:
[`src/features/auth/api/authApi.ts`](src/features/auth/api/authApi.ts).

No component, hook or context knows whether auth is mocked or real — they only
know that `login()` returns a `Promise<AuthResult>` and rejects with an
`AuthError`. Connecting the real API means rewriting the bodies of those two
functions to `fetch` from `VITE_API_BASE_URL`, and changing nothing else.

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
- The mock API returns the **same message** for an unknown email and a wrong
  password, on purpose. Distinguishing them tells an attacker which addresses
  are registered.

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

**In Phase 1:** landing page, login page, mock auth, session persistence,
route guard, and a `/dashboard` stub that exists only so the login flow has a
destination and can be verified end to end.

**Not in Phase 1:** signup, forgot-password, real backend, dashboard features,
the employee/attendance/leave/payroll modules, role-based permissions, i18n,
dark mode.
