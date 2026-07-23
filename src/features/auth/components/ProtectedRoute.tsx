import { Navigate, Outlet, useLocation } from 'react-router'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '../hooks/useAuth'

/**
 * A route guard: renders its child routes only for a signed-in user, and
 * bounces everyone else to the login page.
 *
 * IMPORTANT — this is convenience, not security. Anyone can edit client-side
 * JavaScript, so a guard in the browser only stops *accidental* access. The
 * real protection is the server refusing to return data without a valid
 * session. Never rely on a component like this to keep data private.
 */
export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    /*
      `state={{ from: location }}` remembers where they were heading, so a
      later version can send them back there after signing in instead of
      always dumping them on the dashboard.

      `replace` keeps the blocked URL out of history — otherwise pressing Back
      from the login page retries the protected route and bounces again,
      trapping the user in a loop.
    */
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  /*
    `<Outlet />` is the placeholder react-router fills with the matched child
    route. It is what lets one guard wrap many routes without repeating it.
  */
  return <Outlet />
}
