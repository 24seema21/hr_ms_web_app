import { useNavigate } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * PLACEHOLDER — not Phase 1 feature work.
 *
 * Logging in has to land somewhere, and without a destination the login flow
 * cannot be verified end to end. This page exists only to prove that the
 * happy path works: it greets the signed-in user and can sign them out.
 * Phase 2 replaces it with the real dashboard.
 */
export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  /*
    Navigate away *first*, then clear the session — the order matters.

    Do it the other way round and `logout()` sets `user` to null while this
    page is still mounted inside ProtectedRoute. The guard immediately sees a
    logged-out user and redirects to /login, which is correct for someone who
    wandered in without a session but wrong here: logging out should land you
    on the public landing page, not the sign-in form. Leaving the protected
    route before clearing state avoids the race entirely, with no flash of the
    login page in between.
  */
  const handleLogout = async () => {
    await navigate(ROUTES.HOME, { replace: true })
    await logout()
  }

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </Container>
      </header>

      <main>
        <Container className="py-12">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {/*
              `user?.name` — the optional chain is belt-and-braces. ProtectedRoute
              guarantees a user by the time this renders, but the type does not
              know that, and a guard is cheaper than a crash.
            */}
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-ink-600">
            Signed in as {user?.email} · role:{' '}
            <span className="font-medium text-ink-800">{user?.role}</span>
          </p>

          <div className="mt-8 rounded-card border border-dashed border-ink-300 bg-white p-8">
            <h2 className="text-base font-semibold text-ink-900">
              Nothing here yet
            </h2>
            <p className="mt-2 max-w-prose text-sm text-ink-600">
              This stub exists so the login flow has a destination. The employee
              directory, attendance, leave and payroll modules arrive in the
              next phase.
            </p>
          </div>
        </Container>
      </main>
    </div>
  )
}
