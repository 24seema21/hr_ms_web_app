import { lazy } from 'react'

/*
  Code splitting.

  A plain `import { LandingPage } from ...` would bundle every page into one
  JavaScript file, so a visitor who only reads the landing page still downloads
  the login form, Zod, React Hook Form and the dashboard before anything
  appears. `lazy()` turns each page into its own chunk, fetched the first time
  its route is visited.

  The `.then(...)` dance is needed because `lazy()` expects a module whose
  *default* export is the component, and we use named exports everywhere else
  (named exports are refactor-safe: rename the function and every import
  breaks loudly, instead of silently keeping a stale local name).

  These live in their own module rather than in routes.tsx because Vite's fast
  refresh only preserves state in files that export components *and nothing
  else* — and routes.tsx has to export the router table.
*/

export const LandingPage = lazy(() =>
  import('@/features/landing/pages/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
)

export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  })),
)

export const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

export const EmployeesPage = lazy(() =>
  import('@/features/employees/pages/EmployeesPage').then((m) => ({
    default: m.EmployeesPage,
  })),
)

export const AttendancePage = lazy(() =>
  import('@/features/attendance/pages/AttendancePage').then((m) => ({
    default: m.AttendancePage,
  })),
)
