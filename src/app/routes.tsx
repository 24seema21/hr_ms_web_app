import { createBrowserRouter, Navigate } from 'react-router'
import { ROUTES } from '@/shared/constants/routes'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { AppShell } from './components/AppShell'
import {
  AttendancePage,
  DashboardPage,
  EmployeesPage,
  LandingPage,
  LandingPageV2,
  LeavePage,
  LoginPage,
  SettingsPage,
} from './lazyPages'

/*
  Where the app is mounted in the URL space.

  `BASE_URL` is whatever `base` was set to in vite.config.ts — '/hr_ms_web_app/'
  for a production build, '/' in dev and under Vitest. Deriving it here rather
  than writing the path a second time means the bundler and the router can
  never drift apart.

  The trailing slash has to go: react-router matches the basename as a string
  prefix, so '/hr_ms_web_app/' fails against the slash-less '/hr_ms_web_app'
  that someone typing the bare URL lands on, and every route falls through to
  the catch-all. In dev the strip leaves an empty string, which the fallback
  turns back into '/'.
*/
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

/*
  The route table. Every path comes from ROUTES rather than a string literal,
  so a typo is a compile error instead of a blank page.

  ProtectedRoute and AppShell are *not* lazily loaded: the guard has to run
  before we know whether the page behind it should even be fetched, and the
  shell is on screen for every protected route anyway, so splitting it would
  only add a round trip.
*/
export const router = createBrowserRouter(
  [
    /*
      The v2 design won and now serves the front door; the page it replaced is
      parked at /v2 so the two can still be compared side by side.

      Note that the *names* are now the wrong way round — ROUTES.LANDING_V2
      points at the older `LandingPage`. That is the cost of leaving the loser
      reachable, and it is paid off by deleting the `features/landing` slice
      along with this route once nobody needs the comparison.
    */
    { path: ROUTES.LANDING_V2, element: <LandingPage /> },
    { path: ROUTES.HOME, element: <LandingPageV2 /> },
    { path: ROUTES.LOGIN, element: <LoginPage /> },
    {
      /*
        A pathless "layout" route. It matches nothing on its own; it exists to
        wrap its children in the guard.
      */
      element: <ProtectedRoute />,
      children: [
        {
          /*
            A second pathless layout, nested inside the guard: the signed-in
            chrome (header, nav, sign-out). Every future protected page —
            attendance, leave, payroll — is added to this `children` array and
            gets both the guard and the navigation automatically, with nothing
            to remember per page.
          */
          element: <AppShell />,
          children: [
            { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
            { path: ROUTES.EMPLOYEES, element: <EmployeesPage /> },
            { path: ROUTES.ATTENDANCE, element: <AttendancePage /> },
            { path: ROUTES.LEAVE, element: <LeavePage /> },
            { path: ROUTES.SETTINGS, element: <SettingsPage /> },
          ],
        },
      ],
    },
    // Catch-all. Without it an unknown URL renders react-router's default
    // error screen, which is developer-facing and alarming for a visitor.
    { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
  ],
  { basename: BASENAME },
)
