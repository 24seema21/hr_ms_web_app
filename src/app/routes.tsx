import { createBrowserRouter, Navigate } from 'react-router'
import { ROUTES } from '@/shared/constants/routes'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { AppShell } from './components/AppShell'
import {
  AttendancePage,
  DashboardPage,
  EmployeesPage,
  LandingPage,
  LeavePage,
  LoginPage,
  SettingsPage,
} from './lazyPages'

/*
  The route table. Every path comes from ROUTES rather than a string literal,
  so a typo is a compile error instead of a blank page.

  ProtectedRoute and AppShell are *not* lazily loaded: the guard has to run
  before we know whether the page behind it should even be fetched, and the
  shell is on screen for every protected route anyway, so splitting it would
  only add a round trip.
*/
export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <LandingPage /> },
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
  // Catch-all. Without it an unknown URL renders react-router's default error
  // screen, which is developer-facing and alarming for a visitor.
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
