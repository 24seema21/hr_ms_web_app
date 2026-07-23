import { createBrowserRouter, Navigate } from 'react-router'
import { ROUTES } from '@/shared/constants/routes'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { DashboardPage, LandingPage, LoginPage } from './lazyPages'

/*
  The route table. Every path comes from ROUTES rather than a string literal,
  so a typo is a compile error instead of a blank page.

  ProtectedRoute is *not* lazily loaded: it is tiny, and it has to run before
  we know whether the page behind it should even be fetched.
*/
export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <LandingPage /> },
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  {
    /*
      A pathless "layout" route. It matches nothing on its own; it exists to
      wrap its children in the guard. Every future protected page — employees,
      payroll, reports — is added to this `children` array and is protected
      automatically, with no per-page guard to remember.
    */
    element: <ProtectedRoute />,
    children: [{ path: ROUTES.DASHBOARD, element: <DashboardPage /> }],
  },
  // Catch-all. Without it an unknown URL renders react-router's default error
  // screen, which is developer-facing and alarming for a visitor.
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
