# HRMS SaaS — Phase 1: Landing Page + Login Page

## Context

`HRMS_WEB` is currently an untouched Vite + React 19 + TypeScript starter template — [src/App.tsx](src/App.tsx) still shows the Vite counter demo, and there is no routing, styling system, form handling, or folder structure. Phase 1 delivers the two public-facing pages of the HRMS SaaS product (marketing landing page and login), and — just as importantly — lays down the project architecture that Phases 2+ (employees, attendance, leave, payroll) will build on.

The user is a beginner learning React, so **every step will be explained with *why* it is done and *how* it works** as I implement it. The structure below is deliberately the real-world one used in production SaaS apps, not a simplified toy version.

**Confirmed decisions:** Tailwind CSS v4 · mock auth service · React Hook Form + Zod · Vitest + Testing Library.

---

## Toolchain constraints I found (these shape the code)

These are non-obvious and will cause confusing errors if ignored:

| Constraint | Where | What it means for our code |
|---|---|---|
| `verbatimModuleSyntax: true` | [tsconfig.app.json:14](tsconfig.app.json#L14) | Type-only imports **must** be written `import type { User } from './types'`. A plain `import` of a type fails the build. |
| `erasableSyntaxOnly: true` | [tsconfig.app.json:22](tsconfig.app.json#L22) | TypeScript `enum` and constructor parameter properties are **banned**. Use `as const` objects + union types instead. |
| `noUnusedLocals` / `noUnusedParameters` | [tsconfig.app.json:20-21](tsconfig.app.json#L20-L21) | An unused variable is a build **error**, not a warning. |
| `react-router-dom` stops at v7 | npm registry | The current package is **`react-router` v8.3.0** (requires React ≥19.2.7 — we have 19.2.7 ✓). Import from `react-router`, not `react-router-dom`. |
| `eslint-plugin-jsx-a11y` peers cap at ESLint 9 | project has ESLint 10 | **Not installing it.** Accessibility is handled by hand (semantic HTML, label/input wiring, ARIA) and verified manually in the verification steps. |

---

## Architecture

### Folder structure

```
src/
├─ app/                        # App-wide wiring only
│  ├─ App.tsx                  # Providers + router composition
│  └─ routes.tsx               # Route table
├─ features/                   # Business domains — self-contained
│  ├─ auth/
│  │  ├─ api/authApi.ts        # ← the "swap seam" for the real backend
│  │  ├─ components/LoginForm.tsx
│  │  ├─ context/AuthContext.tsx
│  │  ├─ hooks/useAuth.ts
│  │  ├─ schemas/loginSchema.ts
│  │  ├─ pages/LoginPage.tsx
│  │  └─ types.ts
│  └─ landing/
│     ├─ components/{SiteHeader,Hero,FeatureGrid,HowItWorks,CtaBanner,SiteFooter}.tsx
│     ├─ data/features.ts
│     └─ pages/LandingPage.tsx
├─ shared/                     # Domain-agnostic, reusable
│  ├─ components/ui/{Button,TextField,Logo,Spinner}.tsx
│  ├─ components/layout/Container.tsx
│  ├─ constants/routes.ts
│  └─ lib/cn.ts
├─ test/setup.ts
├─ index.css                   # Tailwind import + design tokens
└─ main.tsx
```

**Why feature folders instead of `components/` + `hooks/` + `pages/`:** An HRMS grows into many domains. Type-based folders mean one feature's files scatter across five directories, and you can never tell what is safe to delete. Feature folders keep everything for a domain in one place — deleting a feature is deleting one folder.

**The one rule that keeps this clean:** `shared/` may **never** import from `features/`. Dependencies flow one direction only (`features` → `shared`), which makes circular imports structurally impossible.

---

## Implementation steps

### 1. Install dependencies

```bash
npm i react-router react-hook-form zod @hookform/resolvers
npm i -D tailwindcss @tailwindcss/vite vitest jsdom \
         @testing-library/react @testing-library/dom \
         @testing-library/jest-dom @testing-library/user-event
```

*Why each:* `react-router` swaps pages without a full browser reload · `react-hook-form` keeps form values in a ref so typing doesn't re-render the form · `zod` defines validation rules once and TypeScript infers the types from them · `@hookform/resolvers` bridges the two · `jsdom` gives tests a fake browser DOM · `@testing-library/dom` is a required peer of RTL 16 and must be installed explicitly.

### 2. Configure Vite — Tailwind, path alias, Vitest

Rewrite [vite.config.ts](vite.config.ts) to add three things: the `tailwindcss()` plugin, an `@` → `./src` alias, and a `test` block (`environment: 'jsdom'`, `globals: true`, `setupFiles`). Add the matching `baseUrl` + `paths` to [tsconfig.app.json](tsconfig.app.json), and extend its `types` array with `vitest/globals` and `@testing-library/jest-dom`.

*Why the alias:* `@/shared/components/ui/Button` instead of `../../../shared/components/ui/Button`. Path-independent, so moving a file doesn't break its imports. It must be declared **twice** — Vite resolves it at runtime, TypeScript resolves it for the editor.

Create `src/test/setup.ts` importing `@testing-library/jest-dom/vitest` (adds matchers like `toBeInTheDocument()`), and add `test`, `test:watch`, and `typecheck` scripts to [package.json](package.json).

### 3. Design tokens in `src/index.css`

Replace the template CSS entirely with `@import "tailwindcss";` plus an `@theme { ... }` block defining the brand palette, fonts, and radii.

*Why:* Tailwind v4 is CSS-first — there is no `tailwind.config.js`. Defining `--color-brand-600` in `@theme` makes `bg-brand-600`, `text-brand-600`, `border-brand-600` all work automatically. Rebranding the whole product later means editing one block.

### 4. Route constants + `cn` helper

`shared/constants/routes.ts` exports an `as const` object (**not** an enum — banned by `erasableSyntaxOnly`) so route paths are typo-proof and autocompleted. `shared/lib/cn.ts` is a three-line class-name joiner that filters falsy values, so conditional classes stay readable.

### 5. Shared UI primitives

`Button` (variant + size + `isLoading`) and `TextField` (label + input + error message), both extending the native HTML element props so `type`, `disabled`, `onClick` etc. work as expected.

*Why these exist:* the login button and the four landing-page CTAs are the same component. One definition means one place to fix a styling bug.

`TextField` wires accessibility properly: `htmlFor`/`id` pairing (clicking the label focuses the input), `aria-invalid` when errored, and `aria-describedby` pointing at the error text so screen readers announce it. In **React 19 `ref` is a normal prop** — no `forwardRef` wrapper needed, which is how React Hook Form's `register()` attaches to the input.

### 6. Landing page

`LandingPage` composes six section components: `SiteHeader` (logo, nav, "Sign in"), `Hero` (headline + two CTAs), `FeatureGrid` (six HRMS modules — directory, attendance, leave, payroll, performance, reports), `HowItWorks`, `CtaBanner`, `SiteFooter`.

*Why split:* each file stays under ~60 lines and does one thing. A 500-line `LandingPage.tsx` is unreviewable and unreusable.

Feature cards render from a typed array in `landing/data/features.ts` via `.map()`, keyed by a stable `id` — **never the array index** (I'll explain what actually breaks when you use index keys). Layout is mobile-first Tailwind, with semantic `<header>`/`<main>`/`<section>`/`<footer>` and exactly one `<h1>` per page.

### 7. Auth data layer — the backend swap seam

`auth/types.ts` defines `User`, `LoginCredentials`, `AuthResult`. `auth/api/authApi.ts` exports `login()` / `logout()` — an in-memory demo user (`hr@demo.com` / `Password123`) with a simulated ~800ms delay and a typed error on bad credentials.

*Why isolate it:* no component ever knows whether the data is fake or real. Connecting the real backend in Phase 2 means rewriting the body of this **one file** — zero component changes. That is dependency inversion, and it's the single most valuable pattern in this plan.

### 8. Auth state — Context + `useAuth`

`AuthContext` holds `{ user, status, error, login, logout }`; `useAuth()` reads it and **throws a clear error** if called outside the provider (fail loudly at the source, not with a confusing `undefined` three components later). The context value is wrapped in `useMemo` — without it, every provider render re-renders every consumer.

*Why Context here specifically:* the header, the login page, and every future page need auth. Passing it down by props would thread it through components that don't care. Context is the right tool for genuinely global, cross-cutting state — I'll also explain why it's the *wrong* tool for most other state.

**Security note I'll flag in code:** the session is persisted to `sessionStorage` so a page refresh doesn't log you out. In production, an auth token belongs in an **httpOnly cookie set by the backend** — anything in `sessionStorage`/`localStorage` is readable by any XSS on the page. The comment stays in the file as a Phase-2 TODO.

### 9. Login page + validated form

`loginSchema.ts` — a Zod object (email, password ≥ 8 chars, rememberMe) with `type LoginFormValues = z.infer<typeof loginSchema>`.

*Why Zod:* rules and types come from **one** source. Add a field to the schema and TypeScript immediately knows about it everywhere — they can never drift apart.

`LoginForm.tsx` uses `useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' })`. On submit it calls `useAuth().login()`, maps a rejected login to a form-level `root` error, and disables the button with a spinner while `isSubmitting`. Validating `onBlur` rather than on every keystroke avoids shouting "invalid email" at someone who has typed two characters.

`LoginPage.tsx` is a split layout — brand panel and form side by side on desktop, stacked on mobile — with the demo credentials shown on screen so the page is testable.

### 10. Router

`app/routes.tsx` defines the table with `createBrowserRouter`; `main.tsx` renders `RouterProvider` inside `AuthProvider`. Route components are loaded with `React.lazy` + `Suspense` so a visitor to the landing page doesn't download the login bundle.

**Scope note:** login needs a destination, so I'll add a **minimal `/dashboard` stub** (greeting + logout button) plus a `ProtectedRoute` guard that redirects logged-out users to `/login`. This is deliberately a placeholder, not Phase-1 feature work — without it the login flow can't be verified end to end.

### 11. Tests

- `loginSchema.test.ts` — pure unit tests of each validation rule (fast, no rendering).
- `LoginForm.test.tsx` — empty submit shows both errors · valid submit calls the auth API · rejected login shows the form-level error.
- `LandingPage.test.tsx` — smoke test: `<h1>` renders, sign-in link points at `/login`.

*Why query by role and label* (`getByLabelText('Email')`) *rather than by CSS class:* the test then does what a real user does. Restyling the markup won't break it, but genuinely breaking the form will — and a test that only passes when the label is correctly wired doubles as an accessibility check.

### 12. Cleanup and quality gate

Delete the template leftovers — `src/App.css`, `src/assets/{react.svg,vite.svg,hero.png}`, `public/icons.svg`. Update [index.html](index.html) with the real title, meta description, and `lang`. Add `.env.example` with `VITE_API_BASE_URL` for Phase 2, and rewrite [README.md](README.md) with setup, scripts, folder-structure explanation, and the demo credentials. Then run lint, typecheck, test, and build until all four are clean.

---

## Verification

**Automated** — all four must pass:
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

**Manual** — `npm run dev`, then:

1. Landing page renders; resize to ~375px wide — no horizontal scroll, nav collapses cleanly.
2. "Sign in" navigates to `/login` **without a full page reload** (the router working).
3. Submit the empty form → inline errors under both fields; the button stays enabled (nothing silently swallowed).
4. Enter `not-an-email` → email error appears on blur.
5. Wrong password → form-level error message, password field is not cleared.
6. `hr@demo.com` / `Password123` → spinner on the button → redirect to `/dashboard` showing the user's name.
7. Refresh the page → still logged in.
8. Log out → back to the landing page; then visit `/dashboard` directly → redirected to `/login`.
9. **Keyboard only:** Tab through the login page — every control reachable, focus ring always visible, Enter submits.

---

## Out of scope for Phase 1

Signup/registration · forgot-password · real backend integration · dashboard features · employee/attendance/leave/payroll modules · role-based permissions · i18n · dark mode.

The `/dashboard` route in step 10 is a stub existing only to make the login flow verifiable.
