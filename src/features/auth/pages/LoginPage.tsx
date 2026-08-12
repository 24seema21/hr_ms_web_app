import { Link, Navigate } from 'react-router'
import { Logo } from '@/shared/components/ui/Logo'
import { CheckIcon } from '@/shared/components/ui/icons'
import { ROUTES } from '@/shared/constants/routes'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

const HIGHLIGHTS = [
  { id: 'directory', text: 'Every employee record in one searchable place' },
  { id: 'approvals', text: 'Leave and attendance approvals in two taps' },
  { id: 'payroll', text: 'Payroll that reconciles itself at month end' },
] as const

export function LoginPage() {
  const { user } = useAuth()

  /*
    Someone already signed in has no business on the login page. Rendering
    <Navigate> is the declarative way to redirect — the alternative,
    `useEffect(() => navigate(...))`, renders the login form for one frame
    first, which the user sees as a flash.
  */
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    /*
      `lg:grid-cols-2` only from the large breakpoint up. Below it the grid is
      a single column and the brand panel simply sits above the form — the
      "stacked on mobile, side by side on desktop" layout, with no duplicated
      markup and no JavaScript measuring the viewport.
    */
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ── Brand panel ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-between gap-12 overflow-hidden bg-brand-900 px-6 py-10 sm:px-12 lg:py-14">
        {/* The register ruling, inverted for the dark ground — the same motif
            as the landing page's hero and closing panel. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--color-brand-400) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand-400) 1px, transparent 1px)',
            backgroundSize: '3.5rem 3.5rem',
            maskImage:
              'radial-gradient(ellipse 90% 60% at 20% 10%, black, transparent)',
          }}
        />

        <Link to={ROUTES.HOME} aria-label="HarkHR home" className="relative w-fit">
          <Logo tone="light" />
        </Link>

        <div className="relative max-w-md">
          <h2 className="type-wide text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Welcome back
          </h2>
          <p className="mt-4 text-pretty text-brand-100">
            Sign in to pick up where your team left off.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-brand-50">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-800 text-accent-300"
                  aria-hidden="true"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-brand-300">
          © {new Date().getFullYear()} HarkHR
        </p>
      </section>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <main className="flex items-center justify-center bg-paper px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/*
            The page's single <h1>. The brand panel's "Welcome back" is an
            <h2> precisely so that this — the actual purpose of the page —
            stays the top-level heading.
          */}
          <h1 className="type-wide text-2xl font-bold tracking-tight text-ink-900">
            Sign in to HarkHR
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Enter your work email and password to continue.
          </p>

          {/*
            The demo-credentials panel that used to sit here is gone: sign-in
            now runs against the real backend, and accounts come from the
            `users` table. Printing working credentials on a real login page is
            not a shortcut worth keeping.
          */}
          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-sm text-ink-600">
            <Link
              to={ROUTES.HOME}
              className="font-medium text-brand-700 hover:text-brand-800"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
